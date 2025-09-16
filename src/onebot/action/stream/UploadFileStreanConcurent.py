import asyncio
import websockets
import json
import base64
import hashlib
import os
from typing import Optional

class FileUploadTester:
    def __init__(self, ws_uri: str, file_path: str):
        self.ws_uri = ws_uri
        self.file_path = file_path
        self.chunk_size = 64 * 1024  # 64KB per chunk
        self.stream_id = None
        
    async def connect_and_upload(self):
        """连接到WebSocket并上传文件"""
        async with websockets.connect(self.ws_uri) as ws:
            print(f"已连接到 {self.ws_uri}")
            
            # 准备文件数据
            file_info = self.prepare_file()
            if not file_info:
                return
                
            print(f"文件信息: {file_info['filename']}, 大小: {file_info['file_size']} bytes, 块数: {file_info['total_chunks']}")
            
            # 生成stream_id
            self.stream_id = f"upload_{hash(file_info['filename'] + str(file_info['file_size']))}"
            print(f"Stream ID: {self.stream_id}")
            
            # 重置流（如果存在）
            await self.reset_stream(ws)
            
            # 开始分块上传
            await self.upload_chunks(ws, file_info)
            
            # 完成上传
            await self.complete_upload(ws)
            
            # 等待一些响应
            await self.listen_for_responses(ws)
    
    def prepare_file(self):
        """准备文件信息"""
        if not os.path.exists(self.file_path):
            print(f"文件不存在: {self.file_path}")
            return None
            
        file_size = os.path.getsize(self.file_path)
        filename = os.path.basename(self.file_path)
        total_chunks = (file_size + self.chunk_size - 1) // self.chunk_size
        
        # 计算SHA256
        sha256_hash = hashlib.sha256()
        with open(self.file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b""):
                sha256_hash.update(chunk)
        expected_sha256 = sha256_hash.hexdigest()
        
        return {
            'filename': filename,
            'file_size': file_size,
            'total_chunks': total_chunks,
            'expected_sha256': expected_sha256
        }
    
    async def reset_stream(self, ws):
        """重置流"""
        req = {
            "action": "upload_file_stream",
            "params": {
                "stream_id": self.stream_id,
                "reset": True
            },
            "echo": "reset"
        }
        await ws.send(json.dumps(req))
        print("发送重置请求...")
    
    async def upload_chunks(self, ws, file_info):
        """上传文件块"""
        with open(self.file_path, 'rb') as f:
            for chunk_index in range(file_info['total_chunks']):
                # 读取块数据
                chunk_data = f.read(self.chunk_size)
                chunk_base64 = base64.b64encode(chunk_data).decode('utf-8')
                
                # 准备请求
                req = {
                    "action": "upload_file_stream",
                    "params": {
                        "stream_id": self.stream_id,
                        "chunk_data": chunk_base64,
                        "chunk_index": chunk_index,
                        "total_chunks": file_info['total_chunks'],
                        "file_size": file_info['file_size'],
                        "filename": file_info['filename'],
                        #"expected_sha256": file_info['expected_sha256']
                    },
                    "echo": f"chunk_{chunk_index}"
                }
                
                await ws.send(json.dumps(req))
                print(f"发送块 {chunk_index + 1}/{file_info['total_chunks']} ({len(chunk_data)} bytes)")
                
                # 等待响应
                try:
                    response = await asyncio.wait_for(ws.recv(), timeout=5.0)
                    resp_data = json.loads(response)
                    if resp_data.get('echo') == f"chunk_{chunk_index}":
                        if resp_data.get('status') == 'ok':
                            data = resp_data.get('data', {})
                            print(f"  -> 状态: {data.get('status')}, 已接收: {data.get('received_chunks')}")
                        else:
                            print(f"  -> 错误: {resp_data.get('message')}")
                except asyncio.TimeoutError:
                    print(f"  -> 块 {chunk_index} 响应超时")
                
                # 小延迟避免过快发送
                await asyncio.sleep(0.1)
    
    async def complete_upload(self, ws):
        """完成上传"""
        req = {
            "action": "upload_file_stream",
            "params": {
                "stream_id": self.stream_id,
                "is_complete": True
            },
            "echo": "complete"
        }
        await ws.send(json.dumps(req))
        print("发送完成请求...")
    
    async def verify_stream(self, ws):
        """验证流状态"""
        req = {
            "action": "upload_file_stream",
            "params": {
                "stream_id": self.stream_id,
                "verify_only": True
            },
            "echo": "verify"
        }
        await ws.send(json.dumps(req))
        print("发送验证请求...")
    
    async def listen_for_responses(self, ws, duration=10):
        """监听响应"""
        print(f"监听响应 {duration} 秒...")
        try:
            end_time = asyncio.get_event_loop().time() + duration
            while asyncio.get_event_loop().time() < end_time:
                try:
                    msg = await asyncio.wait_for(ws.recv(), timeout=1.0)
                    resp_data = json.loads(msg)
                    echo = resp_data.get('echo', 'unknown')
                    
                    if echo == "complete":
                        if resp_data.get('status') == 'ok':
                            data = resp_data.get('data', {})
                            print(f"✅ 上传完成!")
                            print(f"   文件路径: {data.get('file_path')}")
                            print(f"   文件大小: {data.get('file_size')} bytes")
                            print(f"   SHA256: {data.get('sha256')}")
                            print(f"   状态: {data.get('status')}")
                        else:
                            print(f"❌ 上传失败: {resp_data.get('message')}")
                    elif echo == "verify":
                        if resp_data.get('status') == 'ok':
                            data = resp_data.get('data', {})
                            print(f"🔍 验证结果: {data}")
                    elif echo == "reset":
                        print(f"🔄 重置完成: {resp_data}")
                    else:
                        print(f"📨 收到响应 [{echo}]: {resp_data}")
                        
                except asyncio.TimeoutError:
                    continue
                    
        except Exception as e:
            print(f"监听出错: {e}")

async def main():
    # 配置
    WS_URI = "ws://localhost:3001"  # 修改为你的WebSocket地址
    FILE_PATH = "C:\\Users\\nanaeo\\Pictures\\CatPicture.zip"
    
    print("=== 文件流上传测试 ===")
    print(f"WebSocket URI: {WS_URI}")
    print(f"文件路径: {FILE_PATH}")
    
    try:
        tester = FileUploadTester(WS_URI, FILE_PATH)
        await tester.connect_and_upload()
    except Exception as e:
        print(f"测试出错: {e}")

if __name__ == "__main__":
    asyncio.run(main())

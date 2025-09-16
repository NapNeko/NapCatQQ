import asyncio
import websockets
import json
import base64
import hashlib
import os
from typing import Optional, Dict, Set
import time
from dataclasses import dataclass

@dataclass
class ChunkInfo:
    index: int
    data: bytes
    size: int
    retry_count: int = 0
    uploaded: bool = False

class FileUploadTester:
    def __init__(self, ws_uri: str, file_path: str, max_concurrent: int = 5):
        self.ws_uri = ws_uri
        self.file_path = file_path
        self.chunk_size = 64 * 1024  # 64KB per chunk
        self.max_concurrent = max_concurrent  # 最大并发数
        self.max_retries = 3  # 最大重试次数
        self.stream_id = None
        self.chunks: Dict[int, ChunkInfo] = {}
        self.upload_semaphore = asyncio.Semaphore(max_concurrent)
        self.failed_chunks: Set[int] = set()
        
        # 消息路由机制
        self.response_futures: Dict[str, asyncio.Future] = {}
        self.message_receiver_task = None
        
    async def connect_and_upload(self):
        """连接到WebSocket并上传文件"""
        async with websockets.connect(self.ws_uri) as ws:
            print(f"已连接到 {self.ws_uri}")
            
            # 启动消息接收器
            self.message_receiver_task = asyncio.create_task(self._message_receiver(ws))
            
            try:
                # 准备文件数据
                file_info = self.prepare_file()
                if not file_info:
                    return
                    
                print(f"文件信息: {file_info['filename']}, 大小: {file_info['file_size']} bytes, 块数: {file_info['total_chunks']}")
                print(f"并发设置: 最大 {self.max_concurrent} 个并发上传")
                
                # 生成stream_id
                self.stream_id = f"upload_{hash(file_info['filename'] + str(file_info['file_size']))}"
                print(f"Stream ID: {self.stream_id}")
                
                # 重置流（如果存在）
                await self.reset_stream(ws)
                
                # 准备所有分片
                self.prepare_chunks(file_info)
                
                # 并行上传分片
                await self.upload_chunks_parallel(ws, file_info)
                
                # 重试失败的分片
                if self.failed_chunks:
                    await self.retry_failed_chunks(ws, file_info)
                
                # 完成上传
                await self.complete_upload(ws)
                
                # 等待一段时间确保所有响应都收到
                await asyncio.sleep(2)
                
            finally:
                # 取消消息接收器
                if self.message_receiver_task:
                    self.message_receiver_task.cancel()
                    try:
                        await self.message_receiver_task
                    except asyncio.CancelledError:
                        pass
                
                # 清理未完成的Future
                for future in self.response_futures.values():
                    if not future.done():
                        future.cancel()
    
    async def _message_receiver(self, ws):
        """专门的消息接收协程，负责分发响应到对应的Future"""
        try:
            while True:
                message = await ws.recv()
                try:
                    data = json.loads(message)
                    echo = data.get('echo', 'unknown')
                    
                    # 查找对应的Future
                    if echo in self.response_futures:
                        future = self.response_futures[echo]
                        if not future.done():
                            future.set_result(data)
                    else:
                        # 处理未预期的响应
                        print(f"📨 未预期响应 [{echo}]: {data}")
                        
                except json.JSONDecodeError as e:
                    print(f"⚠️ JSON解析错误: {e}")
                except Exception as e:
                    print(f"⚠️ 消息处理错误: {e}")
                    
        except asyncio.CancelledError:
            print("🔄 消息接收器已停止")
            raise
        except Exception as e:
            print(f"💥 消息接收器异常: {e}")
    
    async def _send_and_wait_response(self, ws, request: dict, timeout: float = 10.0) -> Optional[dict]:
        """发送请求并等待响应"""
        echo = request.get('echo', 'unknown')
        
        # 创建Future用于接收响应
        future = asyncio.Future()
        self.response_futures[echo] = future
        
        try:
            # 发送请求
            await ws.send(json.dumps(request))
            
            # 等待响应
            response = await asyncio.wait_for(future, timeout=timeout)
            return response
            
        except asyncio.TimeoutError:
            print(f"⏰ 请求超时: {echo}")
            return None
        except Exception as e:
            print(f"💥 请求异常: {echo} - {e}")
            return None
        finally:
            # 清理Future
            if echo in self.response_futures:
                del self.response_futures[echo]
    
    def prepare_file(self):
        """准备文件信息"""
        if not os.path.exists(self.file_path):
            print(f"文件不存在: {self.file_path}")
            return None
            
        file_size = os.path.getsize(self.file_path)
        filename = os.path.basename(self.file_path)
        total_chunks = (file_size + self.chunk_size - 1) // self.chunk_size
        
        # 计算SHA256
        print("计算文件SHA256...")
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
    
    def prepare_chunks(self, file_info):
        """预读取所有分片数据"""
        print("预读取分片数据...")
        with open(self.file_path, 'rb') as f:
            for chunk_index in range(file_info['total_chunks']):
                chunk_data = f.read(self.chunk_size)
                self.chunks[chunk_index] = ChunkInfo(
                    index=chunk_index,
                    data=chunk_data,
                    size=len(chunk_data)
                )
        print(f"已准备 {len(self.chunks)} 个分片")
    
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
        
        print("发送重置请求...")
        response = await self._send_and_wait_response(ws, req, timeout=5.0)
        
        if response and response.get('echo') == 'reset':
            print("✅ 流重置完成")
        else:
            print(f"⚠️ 重置响应异常: {response}")
    
    async def upload_chunks_parallel(self, ws, file_info):
        """并行上传所有分片"""
        print(f"\n开始并行上传 {len(self.chunks)} 个分片...")
        start_time = time.time()
        
        # 创建上传任务
        tasks = []
        for chunk_index in range(file_info['total_chunks']):
            task = asyncio.create_task(
                self.upload_single_chunk(ws, chunk_index, file_info)
            )
            tasks.append(task)
        
        # 等待所有任务完成
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 统计结果
        successful = sum(1 for r in results if r is True)
        failed = sum(1 for r in results if r is not True)
        
        elapsed = time.time() - start_time
        speed = file_info['file_size'] / elapsed / 1024 / 1024  # MB/s
        
        print(f"\n📊 并行上传完成:")
        print(f"   成功: {successful}/{len(self.chunks)}")
        print(f"   失败: {failed}")
        print(f"   耗时: {elapsed:.2f}秒")
        print(f"   速度: {speed:.2f}MB/s")
        
        if failed > 0:
            print(f"⚠️ {failed} 个分片上传失败，将进行重试")
    
    async def upload_single_chunk(self, ws, chunk_index: int, file_info) -> bool:
        """上传单个分片"""
        async with self.upload_semaphore:  # 限制并发数
            chunk = self.chunks[chunk_index]
            
            try:
                chunk_base64 = base64.b64encode(chunk.data).decode('utf-8')
                
                req = {
                    "action": "upload_file_stream",
                    "params": {
                        "stream_id": self.stream_id,
                        "chunk_data": chunk_base64,
                        "chunk_index": chunk_index,
                        "total_chunks": file_info['total_chunks'],
                        "file_size": file_info['file_size'],
                        "filename": file_info['filename'],
                        "expected_sha256": file_info['expected_sha256']
                    },
                    "echo": f"chunk_{chunk_index}"
                }
                
                # 使用统一的发送和接收方法
                response = await self._send_and_wait_response(ws, req, timeout=10.0)
                
                if response and response.get('echo') == f"chunk_{chunk_index}":
                    if response.get('status') == 'ok':
                        chunk.uploaded = True
                        data = response.get('data', {})
                        progress = data.get('received_chunks', 0)
                        total = data.get('total_chunks', file_info['total_chunks'])
                        print(f"✅ 块 {chunk_index + 1:3d}/{total} ({chunk.size:5d}B) - 进度: {progress}/{total}")
                        return True
                    else:
                        error_msg = response.get('message', 'Unknown error')
                        print(f"❌ 块 {chunk_index + 1} 失败: {error_msg}")
                        self.failed_chunks.add(chunk_index)
                        return False
                else:
                    print(f"⚠️ 块 {chunk_index + 1} 响应异常或超时")
                    self.failed_chunks.add(chunk_index)
                    return False
                    
            except Exception as e:
                print(f"💥 块 {chunk_index + 1} 异常: {e}")
                self.failed_chunks.add(chunk_index)
                return False
    
    async def retry_failed_chunks(self, ws, file_info):
        """重试失败的分片"""
        print(f"\n🔄 开始重试 {len(self.failed_chunks)} 个失败分片...")
        
        for retry_round in range(self.max_retries):
            if not self.failed_chunks:
                break
                
            print(f"第 {retry_round + 1} 轮重试，剩余 {len(self.failed_chunks)} 个分片")
            current_failed = self.failed_chunks.copy()
            self.failed_chunks.clear()
            
            # 重试当前失败的分片
            retry_tasks = []
            for chunk_index in current_failed:
                task = asyncio.create_task(
                    self.upload_single_chunk(ws, chunk_index, file_info)
                )
                retry_tasks.append(task)
            
            retry_results = await asyncio.gather(*retry_tasks, return_exceptions=True)
            successful_retries = sum(1 for r in retry_results if r is True)
            
            print(f"重试结果: {successful_retries}/{len(current_failed)} 成功")
            
            if not self.failed_chunks:
                print("✅ 所有分片重试成功!")
                break
            else:
                await asyncio.sleep(1)  # 重试间隔
        
        if self.failed_chunks:
            print(f"❌ 仍有 {len(self.failed_chunks)} 个分片失败: {sorted(self.failed_chunks)}")
    
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
        
        print("\n发送完成请求...")
        response = await self._send_and_wait_response(ws, req, timeout=10.0)
        
        if response:
            if response.get('status') == 'ok':
                data = response.get('data', {})
                print(f"✅ 上传完成!")
                print(f"   文件路径: {data.get('file_path')}")
                print(f"   文件大小: {data.get('file_size')} bytes")
                print(f"   SHA256: {data.get('sha256')}")
                print(f"   状态: {data.get('status')}")
            else:
                print(f"❌ 上传失败: {response.get('message')}")
        else:
            print("⚠️ 完成请求超时或失败")

async def main():
    # 配置
    WS_URI = "ws://localhost:3001"  # 修改为你的WebSocket地址
    FILE_PATH = r"C:\Users\nanaeo\Pictures\CatPicture.zip" #!!!!!!!!!!!
    MAX_CONCURRENT = 8  # 最大并发上传数，可根据服务器性能调整
    
    # 创建测试文件（如果不存在）
    if not os.path.exists(FILE_PATH):
        with open(FILE_PATH, 'w', encoding='utf-8') as f:
            f.write("这是一个测试文件，用于演示并行文件分片上传功能。\n" * 100)
        print(f"✅ 创建测试文件: {FILE_PATH}")
    
    print("=== 并行文件流上传测试 ===")
    print(f"WebSocket URI: {WS_URI}")
    print(f"文件路径: {FILE_PATH}")
    print(f"最大并发数: {MAX_CONCURRENT}")
    
    try:
        tester = FileUploadTester(WS_URI, FILE_PATH, MAX_CONCURRENT)
        await tester.connect_and_upload()
        print("🎉 测试完成!")
    except Exception as e:
        print(f"💥 测试出错: {e}")

if __name__ == "__main__":
    asyncio.run(main())

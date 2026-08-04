package com.napcat.jni.model.params;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 文件相关参数 Model
 */
public final class FileParams {

    private FileParams() {
    }

    /** 获取图片/文件信息参数 */
    public static class GetFile {
        /** 文件 ID（与 file 二选一） */
        @JsonProperty("file_id")
        public String fileId;
        /** 文件路径、URL 或 Base64（与 fileId 二选一） */
        public String file;

        public GetFile() {
        }

        public GetFile(String fileId) {
            this.fileId = fileId;
        }

        public static GetFile byId(String fileId) {
            return new GetFile(fileId);
        }

        public static GetFile byPath(String file) {
            GetFile p = new GetFile();
            p.file = file;
            return p;
        }
    }

    /** 获取语音参数（含输出格式） */
    public static class GetRecord {
        public String file;
        /** 输出格式：mp3 / amr / wma / m4a / spx / ogg / wav / flac */
        @JsonProperty("out_format")
        public String outFormat;

        public GetRecord() {
        }

        public GetRecord(String file, String outFormat) {
            this.file = file;
            this.outFormat = outFormat;
        }
    }

    /** 上传群文件参数 */
    public static class UploadGroupFile {
        @JsonProperty("group_id")
        public String groupId;
        /** 文件本地路径 */
        public String file;
        /** 文件名 */
        public String name;
        /** 目标文件夹 ID（根目录传 /） */
        public String folder;

        public UploadGroupFile() {
        }

        public UploadGroupFile(String groupId, String file, String name, String folder) {
            this.groupId = groupId;
            this.file = file;
            this.name = name;
            this.folder = folder;
        }
    }

    /** 上传私聊文件参数 */
    public static class UploadPrivateFile {
        @JsonProperty("user_id")
        public String userId;
        public String file;
        public String name;

        public UploadPrivateFile() {
        }

        public UploadPrivateFile(String userId, String file, String name) {
            this.userId = userId;
            this.file = file;
            this.name = name;
        }
    }

    /** 下载文件参数 */
    public static class DownloadFile {
        /** 下载 URL */
        public String url;
        /** 下载到本地路径 */
        @JsonProperty("thread_cnt")
        public int threadCount;
        /** 保存的文件名（可选） */
        public String name;

        public DownloadFile() {
        }

        public DownloadFile(String url, int threadCount) {
            this.url = url;
            this.threadCount = threadCount;
        }
    }
}

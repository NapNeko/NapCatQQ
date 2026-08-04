package com.napcat.jni.model.result;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 文件信息（get_image / get_record / get_file 返回）
 */
public class FileInfo {
    /** 本地路径（可选） */
    public String file;
    /** 下载 URL（可选） */
    public String url;
    @JsonProperty("file_size")
    public String fileSize;
    @JsonProperty("file_name")
    public String fileName;
    /** Base64 编码（可选） */
    public String base64;

    @Override
    public String toString() {
        return "FileInfo{file='" + file + "', url='" + url + "', fileName='" + fileName + "'}";
    }
}

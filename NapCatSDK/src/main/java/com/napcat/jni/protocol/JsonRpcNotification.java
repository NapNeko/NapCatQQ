package com.napcat.jni.protocol;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;

/**
 * JSON-RPC 2.0 通知消息（无 id，不需要响应）
 * <p>
 * 示例：{"jsonrpc":"2.0","method":"onMessage","params":{...}}
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JsonRpcNotification<P> implements Serializable {

    private static final long serialVersionUID = 1L;

    @JsonProperty("jsonrpc")
    private final String jsonrpc = "2.0";

    @JsonProperty("method")
    private String method;

    @JsonProperty("params")
    private P params;

    public JsonRpcNotification() {
    }

    public JsonRpcNotification(String method, P params) {
        this.method = method;
        this.params = params;
    }

    public String getJsonrpc() {
        return jsonrpc;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public P getParams() {
        return params;
    }

    public void setParams(P params) {
        this.params = params;
    }
}

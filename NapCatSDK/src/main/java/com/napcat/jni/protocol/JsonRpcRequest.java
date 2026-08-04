package com.napcat.jni.protocol;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;

/**
 * JSON-RPC 2.0 请求消息（有 id，需要响应）
 * <p>
 * 示例：{"jsonrpc":"2.0","id":1,"method":"init","params":{...}}
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JsonRpcRequest<P> implements Serializable {

    private static final long serialVersionUID = 1L;

    @JsonProperty("jsonrpc")
    private final String jsonrpc = "2.0";

    @JsonProperty("id")
    private Object id;

    @JsonProperty("method")
    private String method;

    @JsonProperty("params")
    private P params;

    public JsonRpcRequest() {
    }

    public JsonRpcRequest(Object id, String method, P params) {
        this.id = id;
        this.method = method;
        this.params = params;
    }

    public String getJsonrpc() {
        return jsonrpc;
    }

    public Object getId() {
        return id;
    }

    public void setId(Object id) {
        this.id = id;
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

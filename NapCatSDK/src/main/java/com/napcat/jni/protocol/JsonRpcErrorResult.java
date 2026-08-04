package com.napcat.jni.protocol;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;

/**
 * JSON-RPC 2.0 错误响应包装
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JsonRpcErrorResult implements Serializable {

    private static final long serialVersionUID = 1L;

    @JsonProperty("jsonrpc")
    private final String jsonrpc = "2.0";

    @JsonProperty("id")
    private Object id;

    @JsonProperty("error")
    private JsonRpcError error;

    public JsonRpcErrorResult() {
    }

    public JsonRpcErrorResult(Object id, JsonRpcError error) {
        this.id = id;
        this.error = error;
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

    public JsonRpcError getError() {
        return error;
    }

    public void setError(JsonRpcError error) {
        this.error = error;
    }
}

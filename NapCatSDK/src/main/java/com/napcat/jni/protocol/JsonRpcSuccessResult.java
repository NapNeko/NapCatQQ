package com.napcat.jni.protocol;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;

/**
 * JSON-RPC 2.0 成功响应
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JsonRpcSuccessResult<R> implements Serializable {

    private static final long serialVersionUID = 1L;

    @JsonProperty("jsonrpc")
    private final String jsonrpc = "2.0";

    @JsonProperty("id")
    private Object id;

    @JsonProperty("result")
    private R result;

    public JsonRpcSuccessResult() {
    }

    public JsonRpcSuccessResult(Object id, R result) {
        this.id = id;
        this.result = result;
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

    public R getResult() {
        return result;
    }

    public void setResult(R result) {
        this.result = result;
    }
}

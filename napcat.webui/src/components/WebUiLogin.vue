<template>
    <div class="login-container">
        <h2>WebUi Login</h2>
        <t-form ref="form" :data="formData" :colon="true" :label-width="0" @submit="onSubmit">
            <t-form-item name="password">
                <t-input v-model="formData.password" type="password" clearable placeholder="请输入Token">
                    <template #prefix-icon>
                        <lock-on-icon />
                    </template>
                </t-input>
            </t-form-item>
            <t-form-item>
                <t-button theme="primary" type="submit" block>登录</t-button>
            </t-form-item>
        </t-form>
        <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { LockOnIcon } from 'tdesign-icons-vue-next';

const formData = reactive({
    password: '',
});

const errorMessage = ref('');

const onSubmit = async ({ validateResult, firstError }) => {
    if (validateResult === true) {
        errorMessage.value = '';
        try {
            // 处理表单提交逻辑
        } catch (error) {
            errorMessage.value = '登录失败，请重试';
        }
    } else {
        errorMessage.value = firstError;
    }
};
</script>
<style scoped>
.login-container {
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    background-color: white;
    max-width: 400px;
    min-width: 300px;
    position: relative;
}

.error-message {
    color: red;
    margin-top: 5px;
}
</style>
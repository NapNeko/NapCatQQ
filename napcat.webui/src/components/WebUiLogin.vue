<template>
    <div class="login-container">
        <h2 class="sotheby-font">WebUi Login</h2>
        <t-form ref="form" :data="formData" :colon="true" :label-width="0" @submit="onSubmit">
            <t-form-item name="password">
                <t-input v-model="formData.token" type="password" clearable placeholder="请输入Token">
                    <template #prefix-icon>
                        <lock-on-icon />
                    </template>
                </t-input>
            </t-form-item>
            <t-form-item>
                <t-button theme="primary" type="submit" block>登录</t-button>
            </t-form-item>
        </t-form>
    </div>
    <div class="footer">
        Power By NapCat.WebUi
    </div>
</template>

<script setup>
import '../css/font.css';
import { reactive, ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { LockOnIcon } from 'tdesign-icons-vue-next';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const formData = reactive({
    token: '',
});

const onSubmit = async ({ validateResult, firstError }) => {
    if (validateResult === true) {
        MessagePlugin.success('登录中...');
        await router.push({ path: '/qqlogin' });
    } else {
        MessagePlugin.error('登录失败');
    }
};

</script>
<style scoped>
.login-container {
    padding: 20px;
    border-radius: 5px;
    background-color: white;
    max-width: 400px;
    min-width: 300px;
    position: relative;
    margin: 0 auto;
}

@media (max-width: 600px) {
    .login-container {
        width: 90%;
        min-width: unset;
    }
}

.error-message {
    color: red;
    margin-top: 5px;
}

.tdesign-demo-block-column {
    display: flex;
    flex-direction: column;
    row-gap: 16px;
}

.tdesign-demo-block-column-large {
    display: flex;
    flex-direction: column;
    row-gap: 32px;
}

.tdesign-demo-block-row {
    display: flex;
    column-gap: 16px;
    align-items: center;
}

.sotheby-font {
    font-family: Sotheby, Helvetica, monospace;
    font-size: 3.125rem;
    line-height: 1.2;
    text-shadow: 0 1px 2px rgba(0, 0, 0, .1);
}

.footer {
    text-align: center;
    margin: 0;
    font-size: 0.875rem;
    color: #888;
    position: fixed;
    bottom: 20px;
    left: 0;
    right: 0;
    width: 100%;
    background-color: white;
}
</style>
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
import '../css/style.css';
import '../css/font.css';
import { reactive, ref, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { LockOnIcon } from 'tdesign-icons-vue-next';
import { useRouter } from 'vue-router';
import { QQLoginManager } from '../backend/shell';

const router = useRouter();

const formData = reactive({
    token: '',
});

const handleLoginSuccess = async (credential) => {
    localStorage.setItem('auth', credential);
    const loginManager = new QQLoginManager(credential);
    const isQQLoggedIn = await loginManager.checkQQLoginStatus();
    if (isQQLoggedIn) {
        await router.push({ path: '/config' });
    } else {
        await router.push({ path: '/qqlogin' });
    }
    MessagePlugin.success('登录成功');
};

const handleLoginFailure = (message) => {
    MessagePlugin.error(message);
};

const checkLoginStatus = async () => {
    const storedCredential = localStorage.getItem('auth');
    if (storedCredential) {
        const loginManager = new QQLoginManager(storedCredential);
        const isQQLoggedIn = await loginManager.checkQQLoginStatus();
        if (isQQLoggedIn) {
            await router.push({ path: '/dashboard/basic-info' });
        } else {
            await router.push({ path: '/qqlogin' });
        }
    }
};

onMounted(() => {
    checkLoginStatus();
});

const onSubmit = async ({ validateResult }) => {
    if (validateResult === true) {
        const loginManager = new QQLoginManager('');
        const credential = await loginManager.loginWithToken(formData.token);
        if (credential) {
            await handleLoginSuccess(credential);
        } else {
            handleLoginFailure('登录失败，请检查Token');
        }
    } else {
        handleLoginFailure('请填写Token');
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
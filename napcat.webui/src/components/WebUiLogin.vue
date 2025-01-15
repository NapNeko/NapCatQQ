<template>
    <t-card class="layout" :bordered="false">
        <div class="login-container">
            <h2 class="sotheby-font">WebUi Login</h2>
            <t-form ref="form" :data="formData" colon :label-width="0" @submit="onSubmit">
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
        <t-footer class="footer">Power By NapCat.WebUi</t-footer>
    </t-card>
</template>

<script setup lang="ts">
import '../css/style.css';
import '../css/font.css';
import { reactive, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { LockOnIcon } from 'tdesign-icons-vue-next';
import { useRouter } from 'vue-router';
import { QQLoginManager } from '@/backend/shell';

const router = useRouter();

interface FormData {
    token: string;
}

const formData: FormData = reactive({
    token: '',
});

const handleLoginSuccess = async (credential: string) => {
    localStorage.setItem('auth', credential);
    await checkLoginStatus();
};

const handleLoginFailure = (message: string) => {
    MessagePlugin.error(message);
};

const checkLoginStatus = async () => {
    const storedCredential = localStorage.getItem('auth');
    if (!storedCredential) {
        return;
    }
    const loginManager = new QQLoginManager(storedCredential);
    const isWenUiLoggedIn = await loginManager.checkWebUiLogined();
    console.log('isWenUiLoggedIn', isWenUiLoggedIn);
    if (!isWenUiLoggedIn) {
        return;
    }

    const isQQLoggedIn = await loginManager.checkQQLoginStatus();
    if (isQQLoggedIn) {
        await router.push({ path: '/dashboard/basic-info' });
    } else {
        await router.push({ path: '/qqlogin' });
    }
};

const loginWithToken = async (token: string) => {
    const loginManager = new QQLoginManager('');
    const credential = await loginManager.loginWithToken(token);
    if (credential) {
        await handleLoginSuccess(credential);
    } else {
        handleLoginFailure('登录失败，请检查Token');
    }
};

onMounted(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    if (token) {
        loginWithToken(token);
    }
    checkLoginStatus();
});

const onSubmit = async ({ validateResult }: { validateResult: boolean }) => {
    if (validateResult) {
        await loginWithToken(formData.token);
    } else {
        handleLoginFailure('请填写Token');
    }
};
</script>

<style scoped>
.layout {
    height: 100vh;
}
.login-container {
    padding: 20px;
    border-radius: 5px;
    max-width: 400px;
    min-width: 300px;
    position: relative;
    margin: 50px auto;
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
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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
}
</style>

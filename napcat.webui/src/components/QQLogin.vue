<template>
    <div class="login-container">
        <h2 class="sotheby-font">QQ Login</h2>
        <div class="login-methods">
            <t-button id="quick-login" class="login-method" :class="{ active: isQuickLoginVisible }" @click="showQuickLogin">Quick Login</t-button>
            <t-button id="qrcode-login" class="login-method" :class="{ active: isQrCodeVisible }" @click="showQrCodeLogin">QR Code</t-button>
        </div>
        <div id="quick-login-dropdown" class="login-form" v-show="isQuickLoginVisible">
            <t-select id="quick-login-select" v-model="selectedAccount" @change="selectAccount">
                <t-option v-for="account in quickLoginList" :key="account" :value="account">{{ account }}</t-option>
            </t-select>
        </div>
        <div id="qrcode" class="qrcode" v-show="isQrCodeVisible">
            <canvas id="qrcode-canvas"></canvas>
        </div>
        <p id="message">{{ message }}</p>
    </div>
    <div class="footer">
        Power By NapCat.WebUi
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Button as TButton, Select as TSelect, Option as TOption, MessagePlugin } from 'tdesign-vue-next';
import QRCode from 'qrcode';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const isQuickLoginVisible = ref(true);
const isQrCodeVisible = ref(false);
const quickLoginList = ref([]);
const selectedAccount = ref('');
const message = ref('');

const showQuickLogin = () => {
    isQuickLoginVisible.value = true;
    isQrCodeVisible.value = false;
};

const showQrCodeLogin = () => {
    isQuickLoginVisible.value = false;
    isQrCodeVisible.value = true;
};

const selectAccount = async (accountName) => {
    //const { result, errMsg } = await SetQuickLogin(accountName, localStorage.getItem('auth'));
    if (true) {
        MessagePlugin.success("登录成功即将跳转");
        await router.push({ path: '/dashboard' });
    } else {
        MessagePlugin.error("登录失败," + errMsg);
    }
};

const generateQrCode = (data, canvas) => {
    QRCode.toCanvas(canvas, data, function (error) {
        if (error) console.log(error);
        console.log('QR Code generated!');
    });
};

const InitPages = async () => {
    // let QuickLists = await GetQQQucickLoginList(localStorage.getItem('auth'));
    quickLoginList.value = ['example1', 'example2', 'example3'];
    // generateQrCode(await GetQQLoginQrcode(localStorage.getItem('auth')), document.querySelector('#qrcode-canvas'));
    generateQrCode('test', document.querySelector('#qrcode-canvas'));
    setInterval(HeartBeat, 3000);
};

onMounted(() => {
    InitPages();
});
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

.login-methods {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.login-method {
    padding: 10px 15px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s;
}

.login-method.active {
    background-color: #e6f0ff;
    color: #007BFF;
}

.login-form,
.qrcode {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.qrcode {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    text-align: center;
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
<template>
    <div class="login-container">
        <h2>Login</h2>
        <div class="login-methods">
            <t-button id="quick-login" class="login-method active" @click="showQuickLogin">Quick Login</t-button>
            <t-button id="qrcode-login" class="login-method" @click="showQrCodeLogin">QR Code</t-button>
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
</template>

<script>
import { ref, onMounted } from 'vue';
import { Button as TButton, Select as TSelect, Option as TOption } from 'tdesign-vue-next';
import QRCode from 'qrcode';
import { MessagePlugin } from 'tdesign-vue-next';

export default {
    components: {
        TButton,
        TSelect,
        TOption,
    },
    setup() {
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

        return {
            isQuickLoginVisible,
            isQrCodeVisible,
            quickLoginList,
            selectedAccount,
            message,
            showQuickLogin,
            showQrCodeLogin,
            selectAccount,
        };
    },
};
</script>

<style scoped>
body {
    font-family: Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f2f5;
}

.login-container {
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    background-color: white;
    max-width: 400px;
    min-width: 300px;
    position: relative;
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

button {
    width: 100%;
    padding: 10px;
    background-color: #007BFF;
    color: white;
    border: none;
    cursor: pointer;
    transition: all 0.3s;
}

button:hover {
    background-color: #0056b3;
}

.hidden {
    display: none;
}

#qrcode-canvas {
    width: 200px;
    height: 200px;
}
</style>
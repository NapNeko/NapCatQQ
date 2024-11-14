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
      let loginResponse = await fetch('../api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: formData.password })
      });
      const loginResponseJson = await loginResponse.json();
      let retCode = loginResponseJson.code;
      if (retCode === 0) {
        let retCredential = loginResponseJson.data.Credential;
        localStorage.setItem('auth', retCredential);
        let QQLoginResponse = await fetch('../api/QQLogin/CheckLoginStatus', {
          method: 'POST',
          headers: {
            'Authorization': "Bearer " + retCredential,
            'Content-Type': 'application/json'
          }
        });
        if (QQLoginResponse.status == 200) {
          let QQLoginResponseJson = await QQLoginResponse.json();
          if (QQLoginResponseJson.code == 0) {
            if (QQLoginResponseJson.data.isLogin) {
              window.location.href = './config.html';
            } else {
              window.location.href = './QQLogin.html';
            }
          }
        }
        MessagePlugin.success('登录成功即将跳转');
      } else {
        console.log(loginResponseJson.message);
        MessagePlugin.warning(loginResponseJson.message);
      }
    } catch (e) {
      MessagePlugin.error('登录失败');
      console.log('请求异常', e);
    }
  } else {
    console.log('Validate Errors: ', firstError, validateResult);
    errorMessage.value = firstError;
    MessagePlugin.warning(firstError);
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
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import {
    Button as TButton,
    Input as TInput,
    Form as TForm,
    FormItem as TFormItem,
    Select as TSelect,
    Option as TOption

} from 'tdesign-vue-next';
import { router } from './router';

const app = createApp(App);
app.use(router);
app.use(TButton);
app.use(TInput);
app.use(TForm);
app.use(TFormItem);
app.use(TSelect);
app.use(TOption);
app.mount('#app');
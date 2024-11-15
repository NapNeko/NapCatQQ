import { createApp } from 'vue'
import App from './App.vue'
import {
    Button as TButton,
    Input as TInput,
    Form as TForm,
    FormItem as TFormItem,
    Select as TSelect,
    Option as TOption,
    Menu as TMenu,
    MenuItem as TMenuItem,
    Icon as TIcon,
    Submenu as TSubmenu,

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
app.use(TMenu);
app.use(TMenuItem);
app.use(TIcon);
app.use(TSubmenu);
app.mount('#app');
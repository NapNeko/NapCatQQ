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
    Col as TCol,
    Row as TRow,
    Card as TCard,
    Divider as TDivider,
    Link as TLink,
    List as TList,
    Alert as TAlert,
    Tag as TTag,
    ListItem as TListItem,
    Tabs as TTabs,
    TabPanel as TTabPanel,
    Space as TSpace,
    Checkbox as TCheckbox,
    Popup as TPopup,
    Dialog as TDialog
} from 'tdesign-vue-next';
import { router } from './router';
import 'tdesign-vue-next/es/style/index.css';

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
app.use(TCol);
app.use(TRow);
app.use(TCard);
app.use(TDivider);
app.use(TLink);
app.use(TList);
app.use(TAlert);
app.use(TTag);
app.use(TListItem);
app.use(TTabs);
app.use(TTabPanel);
app.use(TSpace);
app.use(TCheckbox);
app.use(TPopup);
app.use(TDialog);
app.mount('#app');
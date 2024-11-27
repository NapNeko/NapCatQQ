import { createApp } from 'vue';
import App from './App.vue';
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
    Descriptions as TDescriptionsProps,
    DescriptionsItem as TDescriptionsItem,
    Collapse as TCollapse,
    CollapsePanel as TCollapsePanel,
    ListItem as TListItem,
    Tabs as TTabs,
    TabPanel as TTabPanel,
    Space as TSpace,
    Checkbox as TCheckbox,
    Popup as TPopup,
    Dialog as TDialog,
    Switch as TSwitch,
    Tooltip as Tooltip,
    StickyTool as TStickyTool,
    StickyItem as TStickyItem,
    Layout as TLayout,
    Content as TContent,
    Footer as TFooter,
    Aside as TAside,
    Popconfirm as Tpopconfirm,
    Empty as TEmpty,
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
app.use(TDescriptionsProps);
app.use(TDescriptionsItem);
app.use(TCollapse);
app.use(TCollapsePanel);
app.use(TListItem);
app.use(TTabs);
app.use(TTabPanel);
app.use(TSpace);
app.use(TCheckbox);
app.use(TPopup);
app.use(TDialog);
app.use(TSwitch);
app.use(Tooltip);
app.use(TStickyTool);
app.use(TStickyItem);
app.use(TLayout);
app.use(TContent);
app.use(TFooter);
app.use(TAside);
app.use(Tpopconfirm);
app.use(TEmpty);
app.mount('#app');

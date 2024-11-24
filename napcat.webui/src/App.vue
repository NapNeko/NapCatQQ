<template>
    <div id="app" theme-mode="dark">
        <router-view />
    </div>
    <div v-if="show">
        <t-sticky-tool
            shape="round"
            placement="right-bottom"
            :offset="[-50, 10]"
            @click="changeTheme"
        >
            <t-sticky-item label="浅色" popup="切换浅色模式" >
                <template #icon><sunny-icon/></template>
            </t-sticky-item>
            <t-sticky-item label="深色" popup="切换深色模式" >
                <template #icon><mode-dark-icon/></template>
            </t-sticky-item>
            <t-sticky-item label="自动" popup="跟随系统" >
                <template #icon><control-platform-icon/></template>
            </t-sticky-item>
        </t-sticky-tool>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUnmounted, ref } from 'vue';
import { ControlPlatformIcon, ModeDarkIcon, SunnyIcon } from 'tdesign-icons-vue-next';
const smallScreen = window.matchMedia('(max-width: 768px)');
interface Item {
    label: string;
    popup: string;
}

interface Context {
    item: Item;
}
enum ThemeMode {
    Dark = 'dark',
    Light = 'light',
    Auto = 'auto',
}
const themeLabelMap: Record<string, ThemeMode> = {
    '浅色': ThemeMode.Light,
    '深色': ThemeMode.Dark,
    '自动': ThemeMode.Auto,
};
const show = ref<boolean>(true)
const createSetThemeAttributeFunction = () => {
    let mediaQueryForAutoTheme: MediaQueryList | null = null;
    return (mode: ThemeMode | null) => {
        const element = document.documentElement;
        if (mode === ThemeMode.Dark) {
            element.setAttribute('theme-mode', ThemeMode.Dark);
        } else if (mode === ThemeMode.Light) {
            element.removeAttribute('theme-mode');
        } else if (mode === ThemeMode.Auto) {
            mediaQueryForAutoTheme = window.matchMedia('(prefers-color-scheme: dark)');
            const handleMediaChange = (e: MediaQueryListEvent) => {
                if (e.matches) {
                    element.setAttribute('theme-mode', ThemeMode.Dark);
                } else {
                    element.removeAttribute('theme-mode');
                }
            };
            mediaQueryForAutoTheme.addEventListener('change', handleMediaChange);
            const event = new Event('change');
            Object.defineProperty(event,'matches', {
                value: mediaQueryForAutoTheme.matches,
                writable: false
            });
            mediaQueryForAutoTheme.dispatchEvent(event);
            onBeforeUnmount(() => {
                if (mediaQueryForAutoTheme) {
                    mediaQueryForAutoTheme.removeEventListener('change', handleMediaChange);
                }
            });
        }
    };
};

const setThemeAttribute = createSetThemeAttributeFunction();

const getStoredTheme = (): ThemeMode | null => {
    return localStorage.getItem('theme') as ThemeMode | null;
};

const initTheme = () => {
    const storedTheme = getStoredTheme();
    if (storedTheme === null) {
        setThemeAttribute(ThemeMode.Auto);
    } else {
        setThemeAttribute(storedTheme);
    }
};

const changeTheme = (context: Context) => {
    const themeLabel = themeLabelMap[context.item.label] as ThemeMode;
    console.log(themeLabel);
    setThemeAttribute(themeLabel);
    localStorage.setItem('theme', themeLabel);
};
const haddingFbars = () => {
    show.value = !smallScreen.matches;
    if (smallScreen.matches) {
        localStorage.setItem('theme', 'auto');
    }
};
onMounted(() => {
    initTheme();
    haddingFbars()
    window.addEventListener('resize', haddingFbars);
});
onUnmounted(() => {
    window.removeEventListener('resize', haddingFbars);
});
</script>
<style  scoped>

</style>

<template>
    <div class="title">
        <t-divider content="日志查看" align="left">
            <template #content>
                <div style="display: flex; justify-content: center; align-items: center">
                    <system-log-icon></system-log-icon>
                    <div style="margin-left: 5px">日志查看</div>
                </div>
            </template>
        </t-divider>
    </div>
    <div class="tab-box">
        <t-tabs default-value="realtime" @change="selectType">
            <t-tab-panel value="realtime" label="实时日志"></t-tab-panel>
            <t-tab-panel value="history" label="历史日志"></t-tab-panel>
        </t-tabs>
    </div>
    <div class="card-box">
        <t-card class="card" :bordered="true">
            <template #actions>
                <t-row :align="'middle'" justify="center" :style="{ gap: smallScreen.matches ? '5px' : '24px' }">
                    <t-col flex="auto" style="display: inline-flex; justify-content: center">
                        <t-tooltip content="清理日志">
                            <t-button variant="text" shape="square" @click="clearLogs">
                                <clear-icon></clear-icon>
                            </t-button>
                        </t-tooltip>
                    </t-col>
                    <t-col flex="auto" style="display: inline-flex; justify-content: center">
                        <t-tooltip content="下载日志">
                            <t-button variant="text" shape="square" @click="downloadText">
                                <download-icon></download-icon>
                            </t-button>
                        </t-tooltip>
                    </t-col>
                    <t-col v-if="LogDataType === 'history'" flex="auto"
                        style="display: inline-flex; justify-content: center">
                        <t-tooltip content="历史日志">
                            <t-button variant="text" shape="square" @click="historyLog">
                                <history-icon></history-icon>
                            </t-button>
                        </t-tooltip>
                    </t-col>
                    <t-col flex="auto" style="display: inline-flex; justify-content: center">
                        <div class="tag-box">
                            <t-tag class="t-tag" :style="{ backgroundImage: typeKey[optValue.description] }">{{
                                optValue.content }}</t-tag>
                        </div>
                        <t-dropdown :options="options" :min-column-width="112" @click="openTypeList">
                            <t-button variant="text" shape="square">
                                <more-icon />
                            </t-button>
                        </t-dropdown>
                    </t-col>
                </t-row>
            </template>
            <template #content>
                <div class="content" ref="contentBox">
                    <div v-for="item in LogDataType === 'realtime'
                        ? realtimeLogHtmlList.get(optValue.description)
                        : historyLogHtmlList.get(optValue.description)">
                        <span>{{ item.time }}</span><span :id="item.type">{{ item.content }}</span>
                    </div>
                </div>
            </template>
        </t-card>
    </div>
    <t-dialog v-model:visible="visibleBody" header="历史日志" :destroy-on-close="true" :show-in-attached-element="true"
        :on-confirm="GetLogList" class=".t-dialog__ctx .t-dialog__position">
        <t-select v-model="value" :options="logFileData" placeholder="请选择日志" :multiple="true"
            style="text-align: left" />
    </t-dialog>
</template>
<script setup lang="ts">
import { MoreIcon, ClearIcon, DownloadIcon, HistoryIcon, SystemLogIcon } from 'tdesign-icons-vue-next';
import { nextTick, onMounted, onUnmounted, Ref, ref, watch } from 'vue';
import { LogManager } from '@/backend/log';
import { MessagePlugin } from 'tdesign-vue-next';
import { EventSourcePolyfill } from 'event-source-polyfill';
const smallScreen = window.matchMedia('(max-width: 768px)');
const LogDataType = ref<string>('realtime');
const visibleBody = ref<boolean>(false);
const contentBox = ref<HTMLElement | null>(null);
let isMouseEntered = false;
const logManager = new LogManager(localStorage.getItem('auth') || '');
const eventSource = ref<EventSourcePolyfill | null>(null);
const intervalId = ref<number | null>(null);
const isPaused = ref(false);
interface OptionItem {
    content: string;
    value: number;
    description: string;
}
const options = ref<OptionItem[]>([
    {
        content: '全部',
        value: 1,
        description: 'all',
    },
    {
        content: '调试',
        value: 2,
        description: 'debug',
    },
    {
        content: '提示',
        value: 3,
        description: 'info',
    },
    {
        content: '警告',
        value: 4,
        description: 'warn',
    },
    {
        content: '错误',
        value: 5,
        description: 'error',
    },
    {
        content: '致命',
        value: 5,
        description: 'fatal',
    },
]);
const typeKey = ref<Record<string, string>>({
    all: 'linear-gradient(60deg,#16a085 0%, #f4d03f 100%)',
    debug: 'linear-gradient(-225deg, #5271c4 0%, #b19fff 48%, #eca1fe 100%)',
    info: 'linear-gradient(-225deg, #22e1ff 0%, #1d8fe1 48%, #625eb1 100%)',
    warn: 'linear-gradient(to right, #e14fad 0%, #f9d423 48%, #e37318 100%)',
    error: 'linear-gradient(to left, #ffe29f 0%, #ffa99f 48%, #d94541 100%)',
    fatal: 'linear-gradient(-225deg, #fd0700, #ec567f)',
});
interface logHtml {
    type?: string;
    content: string;
    color?: string;
    time?: string;
}
type LogHtmlMap = Map<string, logHtml[]>;
const realtimeLogHtmlList = ref<LogHtmlMap>(
    new Map([
        ['all', []],
        ['debug', []],
        ['info', []],
        ['warn', []],
        ['error', []],
        ['fatal', []],
    ])
);
const historyLogHtmlList = ref<LogHtmlMap>(
    new Map([
        ['all', []],
        ['debug', []],
        ['info', []],
        ['warn', []],
        ['error', []],
        ['fatal', []],
    ])
);
const logFileData = ref<{ label: string; value: string }[]>([]);
const value = ref([]);
const optValue = ref<OptionItem>({
    content: '全部',
    value: 1,
    description: 'all',
});
const openTypeList = (data: OptionItem) => {
    optValue.value = data;
};
//清理log
const clearLogs = () => {
    if (LogDataType.value === 'realtime') {
        clearAllLogs(realtimeLogHtmlList);
    } else {
        clearAllLogs(historyLogHtmlList);
    }
};
const clearAllLogs = (logList: Ref<Map<string, Array<logHtml>>>) => {
    if ((optValue.value && optValue.value.description === 'all') || !optValue.value) {
        logList.value = new Map([
            ['all', []],
            ['debug', []],
            ['info', []],
            ['warn', []],
            ['error', []],
            ['fatal', []],
        ]);
    } else {
        logList.value.set(optValue.value.description, []);
    }
};
//定时清理log

const TimerClear = () => {
    clearAllLogs(realtimeLogHtmlList);
};
const startTimer = () => {
    if (!isPaused.value) {
        intervalId.value = window.setInterval(TimerClear, 0.5 * 60 * 1000);
    }
};
const pauseTimer = () => {
    if (intervalId.value) {
        window.clearInterval(intervalId.value);
        isPaused.value = true;
    }
};
const resumeTimer = () => {
    if (isPaused.value) {
        startTimer();
        isPaused.value = false;
    }
};
const stopTimer = () => {
    if (intervalId.value) {
        window.clearInterval(intervalId.value);
        intervalId.value = null;
    }
};
const loadData = (text: string, loadType: string) => {
    const lines = text.split(/\r\n/);
    lines.forEach((line) => {
        let remoteJson = JSON.parse(line) as { message: string, level: string };
        const type = remoteJson.level;
        const actualType = type || 'other';
        const color = actualType && typeKey.value[actualType] ? typeKey.value[actualType] : undefined;
        const data: logHtml = {
            type: actualType,
            content: remoteJson.message,
            color: color,
            time: '',
        };

        if (loadType === 'realtime') {
            updateLogList(realtimeLogHtmlList, actualType, data);
        } else if (loadType === 'history') {
            updateLogList(historyLogHtmlList, actualType, data);
        }
    });
};

const updateLogList = (logList: Ref<Map<string, Array<logHtml>>>, actualType: string, data: logHtml) => {
    const allLogs = logList.value.get('all');
    if (Array.isArray(allLogs)) {
        allLogs.push(data);
    }
    if (actualType !== 'unknown') {
        const typeLogs = logList.value.get(actualType);
        if (Array.isArray(typeLogs)) {
            typeLogs.push(data);
        }
    }
};
const selectType = (key: string) => {
    LogDataType.value = key;
};
interface CustomURL extends URL {
    recycleObjectURL: (url: string) => void;
}

const isCompatibleWithCustomURL = (obj: any): obj is CustomURL => {
    return typeof obj === 'object' && obj !== null && typeof (obj as any).recycleObjectURL === 'function';
};

const recycleURL = (url: string) => {
    if (isCompatibleWithCustomURL(window.URL)) {
        const customURL = window.URL as CustomURL;
        customURL.recycleObjectURL(url);
    }
};
const generateTXT = (textContent: string, fileName: string) => {
    try {
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        recycleURL(url);
    } catch (error) {
        console.error('下载文本时出现错误:', error);
    }
};
const downloadText = () => {
    if (LogDataType.value === 'realtime') {
        const logs = realtimeLogHtmlList.value.get(optValue.value.description);
        if (logs && logs.length > 0) {
            const result = logs.map((obj) => obj.content).join('\r\n');
            generateTXT(result, '实时日志');
        } else {
            MessagePlugin.error('暂无可下载日志');
        }
    } else {
        const logs = historyLogHtmlList.value.get(optValue.value.description);
        if (logs && logs.length > 0) {
            const result = logs.map((obj) => obj.content).join('\r\n');
            generateTXT(result, '历史日志');
        } else {
            MessagePlugin.error('暂无可下载日志');
        }
    }
};
const historyLog = async () => {
    value.value = [];
    visibleBody.value = true;
    const res = await logManager.GetLogList();
    clearAllLogs(historyLogHtmlList);
    if (res.length > 0) {
        logFileData.value = res.map((ele: string) => {
            return { label: ele, value: ele };
        });
    } else {
        logFileData.value = [];
    }
};
const GetLogList = async () => {
    if (value.value.length > 0) {
        for (const ele of value.value) {
            try {
                const data = await logManager.GetLog(ele);
                if (data && data !== 'null') {
                    loadData(data, 'history');
                }
            } catch (error) {
                console.error(`获取日志 ${ele} 时出现错误:`, error);
            }
        }
        visibleBody.value = false;
    } else {
        MessagePlugin.error('请选择日志');
    }
};

const fetchRealTimeLogs = async () => {
    eventSource.value = await logManager.getRealTimeLogs();
    if (eventSource.value) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        eventSource.value.onmessage = (event: MessageEvent) => {
            loadData(event.data, 'realtime');
        };
    }
};
const closeRealTimeLogs = async () => {
    if (eventSource.value) {
        eventSource.value.close();
    }
};
const scrollToBottom = () => {
    if (!isMouseEntered) {
        nextTick(() => {
            if (contentBox.value) {
                contentBox.value.scrollTop = contentBox.value.scrollHeight;
            }
        });
    }
};

const observeDOMChanges = () => {
    if (contentBox.value) {
        const observer = new MutationObserver(() => {
            scrollToBottom();
        });
        observer.observe(contentBox.value, {
            childList: true,
            subtree: true,
        });
    }
};
const showScrollbar = () => {
    if (contentBox.value) {
        contentBox.value.style.overflow = 'auto';
    }
};
const hideScrollbar = () => {
    if (contentBox.value) {
        contentBox.value.style.overflow = 'hidden';
        if (!isMouseEntered) {
            scrollToBottom();
        }
    }
};

watch(
    realtimeLogHtmlList,
    () => {
        if (!isMouseEntered) {
            scrollToBottom();
        }
    },
    { immediate: true }
);
watch(
    historyLogHtmlList,
    () => {
        if (!isMouseEntered) {
            scrollToBottom();
        }
    },
    { immediate: true }
);

onMounted(() => {
    fetchRealTimeLogs();
    startTimer();
    contentBox.value = document.querySelector('.content');
    if (contentBox.value) {
        contentBox.value.style.overflow = 'hidden';
        contentBox.value.addEventListener('mouseenter', () => {
            isMouseEntered = true;
            showScrollbar();
            pauseTimer();
        });
        contentBox.value.addEventListener('mouseleave', () => {
            isMouseEntered = false;
            hideScrollbar();
            resumeTimer();
            setTimeout(() => {
                scrollToBottom();
            }, 1000);
        });
        observeDOMChanges();
    }
});
onUnmounted(() => {
    closeRealTimeLogs();
    stopTimer();
});
</script>
<style scoped>
.title {
    padding: 20px 20px 0 20px;
}

.tab-box {
    margin: 0 20px;
}

.card-box {
    margin: 10px 20px;
}

.content {
    height: 56vh;
    background-image: url('@/assets/logo.png');
    border: 1px solid #ddd6d6 !important;
    padding: 5px 10px;
    text-align: left;
    overflow-y: auto;
    margin-top: -10px;
    font-family: monospace;
    font-size: 15px;
    line-height: 16px;
}

.content span {
    white-space: pre-wrap;
    word-break: break-all;
    overflow-wrap: break-word;
}

@keyframes fadeInOnce {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

@keyframes fadeOutOnce {
    0% {
        opacity: 1;
    }

    100% {
        opacity: 0;
    }
}

.content div {
    animation: fadeInOnce 0.5s forwards;
}

::-webkit-scrollbar {
    width: 5px;
    background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
    background-color: #888888;
    border-radius: 4px;
}

.tag-box {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 5px;
}

.t-tag {
    min-width: 60px;
    text-align: center;
    display: flex;
    justify-content: center;
    color: white;
    font-weight: 500;
}

#debug {
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-image: linear-gradient(-225deg, #5271c4 0%, #b19fff 48%, #eca1fe 100%);
}

#info {
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-image: linear-gradient(-225deg, #22e1ff 0%, #1d8fe1 48%, #625eb1 100%);
}

#warn {
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-image: linear-gradient(225deg, #e14fad 0%, #f9d423 48%, #e37318 100%);
}

#error {
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-image: linear-gradient(to left, #ffe29f 0%, #ffa99f 48%, #d94541 100%);
}

#fatal {
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-image: linear-gradient(to right, #fd0700, #ec567f);
}

#other {
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-image: linear-gradient(to top, #3f51b1 0%, #5a55ae 13%, #7b5fac 25%, #8f6aae 38%, #a86aa4 50%, #cc6b8e 62%, #f18271 75%, #f3a469 87%, #f7c978 100%);
}

@media (max-width: 786px) {
    .content {
        height: 50vh;
        font-family: ProtoNerdFontItalic, monospace;
        font-size: 12px;
        line-height: 14.3px;
    }
}
</style>
<style>
.card {
    padding: 5px 10px 20px 10px !important;
}

@media (max-width: 786px) {
    .card {
        padding: 0 !important;
    }
}
</style>

<template>
    <div class="title">
        <t-divider content="面板关于信息" align="left">
            <template #content>
                <div style="display: flex; justify-content: center; align-items: center">
                    <info-circle-icon></info-circle-icon>
                    <div style="margin-left: 5px">面板关于信息</div>
                </div>
            </template>
        </t-divider>
        <t-divider align="right">
            <span style="height: 32px; display: block">&nbsp;</span>
            <!--            <t-button @click="addConfig()">-->
            <!--                <template #icon><add-icon /></template>-->
            <!--                添加配置</t-button-->
            <!--            >-->
        </t-divider>
    </div>
    <div class="about-us">
        <t-alert theme="success" class="header" message="NapCat.WebUi is running" />
        <t-list>
            <t-list-item>
                <div class="label-box">
                    <star-filled-icon class="item-icon" size="large" />
                    <span class="item-label">Star:</span>
                </div>
                <span class="item-content">
                    <t-link class="link-text" href="https://github.com/NapNeko/NapCatQQ/stargazers">{{
                        githubBastData?.stargazers_count
                    }}</t-link>
                </span>
            </t-list-item>
            <t-list-item>
                <tips-filled-icon class="item-icon" size="large" />
                <span class="item-label">issues:</span>
                <span class="item-content">
                    <t-link class="link-text" href="https://github.com/NapNeko/NapCatQQ/issues">{{
                        githubBastData?.open_issues_count
                    }}</t-link>
                </span>
            </t-list-item>
            <t-list-item>
                <git-pull-request-filled-icon class="item-icon" size="large" />
                <span class="item-label">Pull Requests:</span>
                <span class="item-content">
                    <t-link class="link-text" href="https://github.com/NapNeko/NapCatQQ/pulls">{{
                        githubPullData?.length
                    }}</t-link>
                </span>
            </t-list-item>
            <t-list-item>
                <bookmark-add-filled-icon class="item-icon" size="large" />
                <span class="item-label">Releases:</span>
                <span class="item-content">
                    <t-link class="link-text" href="https://github.com/NapNeko/NapCatQQ/releases">{{
                        githubReleasesData && githubReleasesData[0]
                            ? timeDifference(githubReleasesData[0].published_at) + '前更新'
                            : ''
                    }}</t-link>
                </span>
            </t-list-item>
            <t-list-item>
                <usergroup-filled-icon class="item-icon" size="large" />
                <span class="item-label">Contributors:</span>
                <span class="item-content">
                    <t-link class="link-text" href="https://github.com/NapNeko/NapCatQQ/graphs/contributors">{{
                        githubContributorsData?.length
                    }}</t-link>
                </span>
            </t-list-item>
            <t-list-item>
                <browse-filled-icon class="item-icon" size="large" />
                <span class="item-label">Watchers:</span>
                <span class="item-content">
                    <t-link class="link-text" href="https://github.com/NapNeko/NapCatQQ/watchers">{{
                        githubBastData?.watchers
                    }}</t-link>
                </span>
            </t-list-item>
            <t-list-item>
                <fork-filled-icon class="item-icon" size="large" />
                <span class="item-label">Fork:</span>
                <span class="item-content">
                    <t-link class="link-text" href="https://github.com/NapNeko/NapCatQQ/fork">{{
                        githubBastData?.forks_count
                    }}</t-link>
                </span>
            </t-list-item>
            <t-list-item>
                <statue-of-jesus-filled-icon class="item-icon" size="large" />
                <span class="item-label">License:</span>
                <span class="item-content">
                    <t-link class="link-text" href="https://github.com/NapNeko/NapCatQQ#License-1-ov-file">{{
                        githubBastData?.license.key
                    }}</t-link>
                </span>
            </t-list-item>
            <t-list-item>
                <component-layout-filled-icon class="item-icon" size="large" />
                <span class="item-label">Version:</span>
                <span class="item-content">
                    <t-tag class="tag-item pgk-color"> WebUi: {{ pkg.version }} </t-tag>
                    <t-tag class="tag-item nc-color">
                        NapCat:
                        {{ napCatVersion }}
                    </t-tag>
                    <t-tag
                        v-if="
                            githubReleasesData &&
                            githubReleasesData[0]?.tag_name &&
                            'v' + napCatVersion != githubReleasesData[0].tag_name
                        "
                        class="tag-item nc-color-new"
                    >
                        New NapCat:
                        {{ githubReleasesData[0].tag_name }}
                    </t-tag>
                    <t-tag class="tag-item td-color"> TDesign: {{ pkg.dependencies['tdesign-vue-next'] }} </t-tag>
                </span>
            </t-list-item>
        </t-list>
    </div>
</template>

<script setup lang="ts">
import pkg from '../../package.json';
import { napCatVersion } from '../../../src/common/version';
import {
    InfoCircleIcon,
    TipsFilledIcon,
    StarFilledIcon,
    GitPullRequestFilledIcon,
    ForkFilledIcon,
    StatueOfJesusFilledIcon,
    BookmarkAddFilledIcon,
    UsergroupFilledIcon,
    BrowseFilledIcon,
    ComponentLayoutFilledIcon,
} from 'tdesign-icons-vue-next';
import { githubApiManager } from '@/backend/githubApi';
import { onMounted, ref } from 'vue';

const githubApi = new githubApiManager();
const githubBastData = ref<any>(null);
const githubReleasesData = ref<any>(null);
const githubContributorsData = ref<any>(null);
const githubPullData = ref<any>(null);
const getBaseData = async () => {
    githubBastData.value = await githubApi.GetBaseData();
    githubReleasesData.value = await githubApi.GetReleasesData();
    githubContributorsData.value = await githubApi.GetContributors();
    githubPullData.value = await githubApi.GetPullsData();
};
const timeDifference = (timestamp: string): string => {
    const givenTime = new Date(timestamp);
    const currentTime = new Date();
    const diffInMilliseconds = currentTime.getTime() - givenTime.getTime();

    const seconds = Math.floor(diffInMilliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}小时`;
    } else if (minutes > 0) {
        return `${minutes}分钟`;
    } else {
        return `${seconds}秒`;
    }
};
onMounted(() => {
    getBaseData();
});
</script>

<style scoped>
.title {
    padding: 20px 20px 0 20px;
    display: flex;
    justify-content: space-between;
}

.about-us {
    padding: 0 20px 20px 20px;
    text-align: left;
}

.label-box {
    display: flex;
    justify-content: center;
    align-items: center;
}

.item-icon {
    padding: 5px;
    color: #ffffff;
    border-radius: 3px;
    background-image: linear-gradient(-225deg, #2cd8d5 0%, #c5c1ff 56%, #ffbac3 100%);
}

.item-label {
    flex: 1;
    margin-left: 8px;
    box-sizing: border-box;
    height: auto;
    padding: 0;
    border: none;
    font-size: 16px;
}

.item-content {
    flex: 2;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.tag-item {
    margin-right: 10px;
    margin-bottom: 10px;
    border: none;
}
</style>
<style>
.t-list-item {
    padding: 5px var(--td-comp-paddingLR-l);
}

.item-label {
    flex: 2;
    background-image: linear-gradient(to right, #fa709a 0%, #fee140 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.pgk-color {
    color: white;
    background-image: linear-gradient(-225deg, #9be15d 0%, #00e3ae 100%);
}

.nc-color {
    color: white;
    background-image: linear-gradient(-225deg, #2cd8d5 0%, #c5c1ff 56%, #ffbac3 100%);
}

.nc-color-new {
    color: white;
    background-image: linear-gradient(-225deg, #ffbac3 0%, #c5c1ff 56%, #495aff 100%);
}

.td-color {
    color: white;
    background-image: linear-gradient(-225deg, #495aff 0%, #0acffe 100%);
}

.header {
    background-image: linear-gradient(225deg, #dfffcd 0%, #90f9c4 48%, #39f3bb 100%) !important;
}

.link-text {
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-image: linear-gradient(-225deg, #b6cee8 0%, #f578dc 100%);
    font-weight: bold;
}
</style>

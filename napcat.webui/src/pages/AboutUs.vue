<template>
    <div class="about-us">
        <div>
            <t-divider content="面板关于信息" align="left" />
            <t-alert theme="success" message="NapCat.WebUi is running" />
            <t-list class="list">
                <t-list-item class="list-item">
                    <span class="item-label">开发人员:</span>
                    <span class="item-content">
                        <t-link href="mailto:nanaeonn@outlook.com">Mlikiowa</t-link>
                    </span>
                </t-list-item>
                <t-list-item class="list-item">
                    <span class="item-label">版本信息:</span>
                    <span class="item-content">
                        <t-tag class="tag-item" theme="success"> WebUi: 1.0.0 </t-tag>
                        <t-tag class="tag-item" theme="success"> NapCat: 4.?.? </t-tag>
                        <t-tag class="tag-item" theme="success"> Tdesign: 1.10.3 </t-tag>
                    </span>
                </t-list-item>
            </t-list>
        </div>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.about-us {
    padding: 20px;
    text-align: left;
}

.list {
    display: flex;
    flex-direction: column;
}

.list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.item-label {
    flex: 1;
    font-weight: bold;
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
}
</style>

<script setup lang="ts">
import showPanel from '@/components/showPanel.vue';
import { inject } from 'vue';


const list = inject('searchResult') as Array<{
  id: number,
  title: string,
  url: string,
  content: string,
  user_id: number
}> || [] // 获取跨级传递的数据;



</script>
<template>
  <div class="search">
    <showPanel :list="list" v-if="list.length" :isUser="false"></showPanel>
    <div class="null" v-else>
      空空如也
    </div>
  </div>
</template>
<style lang="less" scoped>
.search {
  height: 100%;

  .null {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 60px;
    font-weight: bold;
    color: rgb(227, 225, 225);
  }
}
</style>
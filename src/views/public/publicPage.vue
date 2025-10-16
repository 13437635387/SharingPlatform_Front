<script setup lang="ts">
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import EditPanel from '@/components/EditPanel.vue';
</script>

<template>
  <div class="public">
    <div class="edit">
      <EditPanel :panelType="'public'"></EditPanel>
    </div>
  </div>
</template>
<style lang="less" scoped>
.public {
  width: 100%;

  .edit {
    width: 800px;
  }
}
</style>
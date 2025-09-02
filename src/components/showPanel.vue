<script setup lang="ts">
import { LazyImg, Waterfall } from 'vue-waterfall-plugin-next'
import 'vue-waterfall-plugin-next/dist/style.css'
import { ref } from 'vue';
import { getUserInfoByIdService } from '@/api/user';

type listType = {
  id: number,
  title: string,
  url: string,
  content: string,
  user_id: number
}
const props = defineProps<{ list: listType[] }>()

// 移动端配置（详细看文档）
const breakpoints = {
  1500: {
    // when wrapper width < 1200
    rowPerView: 5,
  },
  1200: {
    rowPerView: 4
  },
  900: {
    // when wrapper width < 800
    rowPerView: 3,
  },
  600: {
    // when wrapper width < 500
    rowPerView: 2,
  },
  400: {
    rowPerView: 1
  }
}

//是否展示详细内容
const isShowDetail = ref(false)
const idIndex = ref(0)//找到当前细节项的id的下标
const detailUserPic = ref('')
const detailUserName = ref('')
const showDetail = async (id: number) => {
  props.list.forEach((item, index) => {
    if (item.id === id) {
      idIndex.value = index
    }
  })
  isShowDetail.value = true
  // console.log(props.list[idIndex.value].id);

  const res = await getUserInfoByIdService(props.list[idIndex.value].user_id)
  detailUserPic.value = 'http://localhost:8080' + res.data.user_pic
  detailUserName.value = res.data.username
}

</script>
<template>
  <div class="showPanel">
    <Waterfall :list="props.list" :breakpoints="breakpoints" :gutter="20">
      <template #default="{ item }">
        <div class="card" @click="showDetail(item.id)">
          <LazyImg :url="`http://localhost:8080${item.url}`" alt="" class="pic" />
          <p class="title">{{ item.title }}</p>
        </div>
      </template>
    </Waterfall>
    <!-- 详情内容 -->
    <el-dialog v-model="isShowDetail" :show-close="false">
      <div class="left">
        <el-image :src="`http://localhost:8080${props.list[idIndex].url}`" alt="图片不见啦！" fit="cover" style="width: 100%;"
          height="100%" />
      </div>
      <div class="right">
        <div class="user-info">
          <el-avatar size="default" :src="detailUserPic"></el-avatar>
          <span class="user-name">{{ detailUserName }}</span>
        </div>
        <div v-html="props.list[idIndex].content" class="content"></div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="less">
.showPanel {
  height: 100%;

  .pic {
    border: 1px solid rgb(220, 220, 220);
    border-radius: 20px;
  }


  :deep(.el-dialog) {
    height: 600px;
    width: 700px;

    .el-dialog__header {
      padding-bottom: 0px;
    }

    .el-dialog__body {
      padding: 0;
      height: 100%;
      display: flex;

      .left {
        // background-color: pink;
        background-color: rgb(250, 250, 250);
        width: 50%;
        height: 100%;
        // line-height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .right {
        padding: 0px 5px;
        width: 50%;
        height: 100%;
        text-align: center;
        display: flex;
        flex-direction: column;
        // justify-content: center;

        .user-info {
          width: 100%;
          height: 50px;
          background-color: rgb(252, 252, 252);
          justify-content: center;
          display: flex;
          align-items: center;
          gap: 20px; //flex盒子子元素之间的间距
        }

        .content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
      }
    }
  }
}
</style>
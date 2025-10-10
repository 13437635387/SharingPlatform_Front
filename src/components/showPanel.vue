<script setup lang="ts">
import { LazyImg, Waterfall } from 'vue-waterfall-plugin-next'
import 'vue-waterfall-plugin-next/dist/style.css'
import { ref } from 'vue';
import { getUserInfoByIdService } from '@/api/user';
import { deleteArticleService } from '@/api/article';
import { ElMessage } from 'element-plus';
import type { DrawerProps } from 'element-plus'
import EditPanel from './EditPanel.vue';


type listType = {
  id: number,
  title: string,
  url: string,
  content: string,
  user_id: number
}
const props = defineProps<{ list: listType[], isUser: boolean }>()
const emit = defineEmits(['reloadList'])

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

//当前详情的所有信息
const currentDetailInfo = ref<listType & { user_pic: string, username: string }>({
  id: 0,
  title: '',
  url: '',
  content: '',
  user_id: 0,
  user_pic: '',
  username: ''
})

const showDetail = async (id: number) => {
  props.list.forEach((item, index) => {
    if (item.id === id) {
      idIndex.value = index
    }
  })
  isShowDetail.value = true
  const res = await getUserInfoByIdService(props.list[idIndex.value].user_id)
  detailUserPic.value = 'http://localhost:8080' + res.data.user_pic
  detailUserName.value = res.data.username
  currentDetailInfo.value = {
    ...props.list[idIndex.value],
    url: 'http://localhost:8080' + props.list[idIndex.value].url,
    user_id: res.data.id,
    user_pic: detailUserPic.value,
    username: detailUserName.value
  }
  console.log('当前的：', currentDetailInfo.value);
}

// 关闭详情页的回调
const visible = ref(false)//删除弹出框是否显示

const handleClose = () => {
  visible.value = false
  isShowDetail.value = false
}

//删除文章
const deleteItem = async (id: number) => {
  console.log(id);
  const res = await deleteArticleService(id)
  emit('reloadList')
  console.log(res);
  ElMessage.success('删除成功')
  isShowDetail.value = false
  // props.list.splice(idIndex.value, 1)
  // isShowDetail.value = false 
  visible.value = false
}

//文章编辑
const drawer = ref(false)


</script>
<template>
  <div class="showPanel">
    <Waterfall :list="props.list" :breakpoints="breakpoints" :gutter="20">
      <template #default="{ item }">
        <div class="card" @click="showDetail(item.id)">
          <LazyImg :url="`http://localhost:8080${item.url}`" alt="" class="pic" v-if="!item.url.includes('.')" />
          <video :src="item.url" v-else></video>
          <p class="title">{{ item.title }}</p>
        </div>
      </template>
    </Waterfall>
    <!-- 详情内容 -->
    <el-dialog v-model="isShowDetail" :show-close="false" :before-close="handleClose">
      <div class="left">
        <el-image :src="currentDetailInfo.url" alt="图片不见啦！" fit="cover" style="width: 100%;" height="100%" />
      </div>
      <div class="right">
        <div class="user-info">
          <el-avatar size="default" :src="currentDetailInfo.user_pic"></el-avatar>
          <span class="user-name">{{ currentDetailInfo.username }}</span>
        </div>
        <div v-html="currentDetailInfo.content" class="content"></div>
        <div class="footer" v-if="props.isUser">
          <el-button type="primary" link @click="drawer = true">编辑</el-button>
          <el-divider direction="vertical" />
          <el-popover :visible="visible" placement="top" :width="180">
            <p>确定要删除吗?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="small" type="primary" @click="visible = false">取消</el-button>
              <el-button size="small" type="danger" @click="deleteItem(currentDetailInfo.id)">
                确定
              </el-button>
            </div>
            <template #reference>
              <el-button type="danger" link @click="visible = true">删除</el-button>
            </template>
          </el-popover>
        </div>
      </div>
    </el-dialog>
    <!-- 编辑文章抽屉 -->
    <el-drawer v-model="drawer" size="600">
      <template #header="{ close, titleId, titleClass }">
        <h3>编辑文章</h3>
      </template>
      <!-- <span>Hi, there!</span> -->
      <EditPanel :panelType="'edit'" :currentDetailInfo="currentDetailInfo"></EditPanel>
    </el-drawer>
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

        .footer {
          width: 100%;
          height: 24px;
        }
      }
    }
  }

  :deep(.el-drawer__header) {
    margin-bottom: 16px;
  }
}
</style>
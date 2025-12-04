<script setup lang="ts">
import { provide, ref } from 'vue'
import {
  Bicycle,
  ChatRound,
  Close,
  DocumentAdd,
  Promotion,
  Search,
  User,
} from '@element-plus/icons-vue'
import { searchArticleService } from '@/api/article'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const isCollapse = ref(false)
// 搜索
const search_content = ref('')
const clear_content = () => {
  search_content.value = ''
  router.push('/home') // 清空搜索内容时跳转到首页
}
const searchList = ref([])
provide('searchResult', searchList)
const searchThings = async () => {
  if (search_content.value.trim()) {
    const res = await searchArticleService(search_content.value.trim())
    searchList.value = res.data
    router.push('/search') // 跳转到搜索页面 
  }
  else {
    ElMessage.error('请输入有效内容!')
    search_content.value = ''
  }
}

//去登录
const login = () => {
  router.push('/login')
}

// 去管理员界面
const toAdmin = () => {
  ElMessageBox.prompt('测试凭证：123456', '请输入管理员凭证', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern:
      /^(123456)$/,
    inputErrorMessage: '凭证错误',
  })
    .then(() => {
      router.push('/admin')
      ElMessage({
        type: 'success',
        message: `跳转成功！`,
      })
    })
}

// 展开收起面板
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
} 
</script>
<template>
  <div class="layout">
    <el-container>
      <!-- 头部 -->
      <el-header class="head">
        <!-- 搜索 -->
        <div class="search">
          <input placeholder="宁可少字，不可多字、错字" class="search-input" v-model="search_content" />
          <span class="button">
            <el-button link size="large" @click="clear_content">
              <el-icon>
                <Close />
              </el-icon>
            </el-button>
            <el-button link size="large" @click="searchThings">
              <el-icon>
                <Search />
              </el-icon>
            </el-button>
          </span>
        </div>
        <!-- 用户 -->
        <div class="user">

          <!-- 管理员界面  -->
          <el-button type="primary" link style="margin-right: 5px; height: 100%; line-height: 100%; font-size: 12px;"
            @click="toAdmin">管理员</el-button>
          <!-- <el-button type="primary" link
            style="margin-right: 3px;height: 100%;line-height: 100%;font-size: 12px;">管理员界面</el-button> -->
          <el-dropdown>
            <div class="user-info">
              <el-avatar size="default" :src="userStore.userPic"></el-avatar>
              <span>{{ userStore.username ? userStore.username : '未登录' }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu v-if="userStore.username">
                <el-dropdown-item @click="userStore.logout()">退出登录</el-dropdown-item>
              </el-dropdown-menu>
              <el-dropdown-menu v-else>
                <el-dropdown-item @click="login">去登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-container class="body">
        <!-- 左侧导航 -->
        <el-aside :width="isCollapse ? '70px' : '200px'" class="menu">
          <el-menu :default-active="$route.path" :collapse="isCollapse" :router="true">
            <el-menu-item index="/home">
              <el-icon>
                <Promotion />
              </el-icon>
              <span>发现</span>
            </el-menu-item>
            <el-menu-item index="/public">
              <el-icon>
                <DocumentAdd />
              </el-icon>
              <span>发布</span>
            </el-menu-item>
            <el-menu-item index="/travel">
              <el-icon>
                <Bicycle />
              </el-icon>
              <span>找旅友</span>
            </el-menu-item>
            <el-menu-item index="/chat">
              <el-icon>
                <ChatRound />
              </el-icon>
              <span>聊天室</span>
            </el-menu-item>

            <el-menu-item index="/user">
              <el-icon>
                <User />
              </el-icon>
              <span>用户</span>
            </el-menu-item>
            <el-button @click="toggleCollapse" class="collapse-button" :class="{ 'is-collapsed': isCollapse }" text>
              <el-icon v-if="!isCollapse" class="buttonIcon">
                <ArrowLeftBold />
              </el-icon>
              <el-icon v-else class="buttonIcon">
                <ArrowRightBold />
              </el-icon>
              <span class="buttonText" v-show="!isCollapse">收起</span>
            </el-button>
          </el-menu>
        </el-aside>

        <!-- 主要内容 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>

  </div>
</template>

<style lang="less" scoped>
@head-height: 70px;

.layout {
  padding: 20px 50px;
  width: 100%;
  height: 100vh;

  :deep(.el-container) {
    height: 100%;

    // 头部
    .head {
      height: @head-height;
      display: flex;
      align-items: center;
      width: 100%;
      position: relative;

      // 搜索
      .search {
        position: absolute;
        left: 50%;
        transform: translate(-50%);
        display: inline-flex;
        width: 470px;
        background-color: rgb(247, 247, 247);
        border-radius: 40px;
        height: 40px;
        line-height: 40px;
        justify-content: space-between;

        .search-input {
          width: 430px;
          height: 40px;
          line-height: 40px;
          border: none;
          background-color: rgb(247, 247, 247);
          border-radius: 40px;
          padding: 10px;
          font-size: 16px;
        }

        .button {
          position: absolute;
          right: 20px;
          height: 40px;
          line-height: 40px;
        }

        // outline属性是元素获得焦点（被选中、激活等情况 ）时显示的轮廓线
        .search-input:focus {
          outline: none;
        }
      }

      // 媒体查询
      @media (max-width: 920px) {
        .search {
          width: 300px;
          left: 0%;
          transform: translate(0%);
        }

      }

      //用户信息
      .user {
        position: absolute;
        right: 20px;

        height: 100%;
        display: flex;
        align-items: center;
        gap: 8px;

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px; //flex盒子子元素之间的间距
        }
      }
    }

    .body {
      height: calc(100% - @head-height);

      .menu {
        height: 100%;

        // 不知道为什么右边框去不掉
        :deep(.el-aside) .el-menu {
          border-right: none;
        }
      }

      :deep(.el-main) {
        padding: 0px 20px;
        height: 100%;
      }

      //面板按钮样式----Collapse
      .collapse-button {
        height: 56px;
        width: 100%;
        display: flex;
        justify-content: left;
        padding: 0 20px;

        &:hover {
          background-color: rgb(236, 245, 255);
          color: rgb(48, 49, 51);
        }

        .buttonIcon {
          margin-right: 5px;
          font-size: 18px;
        }

        .buttonText {
          margin-left: 0px;
        }
      }
    }
  }

}
</style>
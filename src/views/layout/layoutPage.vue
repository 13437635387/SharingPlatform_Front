<script setup lang="ts">
import { ref } from 'vue'
import {
  Close,
  DocumentAdd,
  Promotion,
  Search,
  User,
} from '@element-plus/icons-vue'

const isCollapse = ref(false)
// 搜索
const search_content = ref('')
const clear_content = () => {
  search_content.value = ''
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
          <input placeholder="搜索" class="search-input" v-model="search_content" />
          <span class="button">
            <el-button link size="large" @click="clear_content">
              <el-icon>
                <Close />
              </el-icon>
            </el-button>
            <el-button link size="large">
              <el-icon>
                <Search />
              </el-icon>
            </el-button>
          </span>
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
              <span>发现</span>
            </el-menu-item>
            <el-menu-item index="/user">
              <el-icon>
                <User />
              </el-icon>
              <span>用户</span>
            </el-menu-item>
            <el-menu-item @click="toggleCollapse">
              <!-- <el-button> -->
              <el-icon v-if="!isCollapse">
                <ArrowLeftBold />
              </el-icon>
              <el-icon v-else>
                <ArrowRightBold />
              </el-icon>
              <span>{{ isCollapse ? '展开' : '收起' }}</span>
              <!-- </el-button> -->
            </el-menu-item>
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
        width: 500px;
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
    }
  }

}
</style>
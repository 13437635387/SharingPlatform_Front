<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus'
import type { UploadRequestOptions } from 'element-plus'
import { Plus } from '@element-plus/icons-vue';
import type { FormModel } from '@/types/user';
import type { FormInstance, FormRules } from 'element-plus'
import { updateUserInfoService, getUserAvatarService } from '@/api/user';
import http from '@/util/http';
import { getUserArticleList } from '@/api/article';
import showPanel from '@/components/showPanel.vue';


const userStore = useUserStore()

//左侧头像上传，自定义文件上传
const customUpload = async (options: UploadRequestOptions) => {
  const formData = new FormData();
  formData.append('avatar', options.file);
  try {
    const response = await http.post('/my/userinfo/updateAvatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: userStore.token, // 手动传递 token
      },
    });
    const res = await getUserAvatarService();
    userStore.userPic = 'http://localhost:8080' + res.data
    ElMessage.success('修改成功!')
  } catch (error) {
    console.error('上传失败', error);
  }
}

//右侧 修改个人资料
const formRef = ref<FormInstance>()

const formModel = ref<FormModel>({
  username: '',
  password: '',
  repassword: '',
  gender: '',
  age: null
})
const checkPassword = (rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value !== formModel.value.password) {
    callback(new Error('两次密码不一致'))
  } else {
    callback()
  }
}
const rules = reactive<FormRules<FormModel>>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 14, message: '密码长度为 6-14 个字符', trigger: 'blur' }
  ],
  repassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: checkPassword, trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  // 修改 age 校验：确保 type 为 number，min/max 生效，触发器使用 change（适用于 el-input-number）
  age: [
    { required: true, message: '请输入年龄', trigger: 'change' },
    { type: 'number', min: 1, max: 150, message: '年龄必须在 1 到 150 岁之间', trigger: 'change' }
  ]
})
const confirm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate()

  const res = await updateUserInfoService({
    username: formModel.value.username,
    password: formModel.value.password,
    gender: formModel.value.gender,
    age: formModel.value.age,
  })
  userStore.username = formModel.value.username
  userStore.password = formModel.value.password
  userStore.userGender = formModel.value.gender
  userStore.userAge = formModel.value.age
  ElMessage.success('修改成功！')
  formRef.value?.resetFields()
}
const isShow = ref(false)//是否展示右侧修改页面
// 获取该用户文章
const userArticleList = ref([])
const getUserArticles = async () => {
  const res = await getUserArticleList(userStore.userId);
  userArticleList.value = res.data
}
getUserArticles()

</script>
<template>
  <div class="user">
    <!-- 左侧头像上传 -->
    <div class="left">
      <div class="userinfo">
        <div class="pic">
          <el-upload class="avatar-uploader" :show-file-list="false" name="avatar" :http-request="customUpload">
            <el-image :src="userStore.userPic" class="avatar" fit="cover" />
            <!-- 这里要实现鼠标移入背景变暗的效果，方法是使用一个图层遮盖 -->
            <div class="cover"></div>
            <el-icon class="addIcon">
              <Plus />
            </el-icon>
          </el-upload>
        </div>
        <div class="info">
          <p style="font-size: 20px;color: #545151;">{{ userStore.username }}</p>
          <p style="font-size: 15px;">{{ userStore.userGender }} - {{ userStore.userAge }}岁</p>
          <!-- 切换显示修改资料和作品列表 -->
          <el-button link type="primary" v-if="!isShow" @click="isShow = true">修改用户信息 &gt; </el-button>
          <el-button link type="primary" v-if="isShow" @click="isShow = false">显示作品 &lt; </el-button>
        </div>
      </div>
    </div>
    <!-- 右侧资料修改 -->
    <div class="right">
      <el-card class="setting" v-if="isShow">
        <template #header>
          <div class="card-header">
            <h2>修改个人资料</h2>
          </div>
        </template>
        <el-form ref="formRef" :model="formModel" :rules="rules" status-icon size="large">
          <el-form-item prop="username">
            <el-input v-model="formModel.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item prop="gender">
            <el-select v-model="formModel.gender" placeholder="请选择性别" style="width: 100%;">
              <el-option label="男" value="男"></el-option>
              <el-option label="女" value="女"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="age">
            <!-- 使用 el-input-number，确保 v-model 获取到数字类型，且触发 change 事件 -->
            <el-input-number v-model="formModel.age" :min="1" :max="150" placeholder="请输入年龄" style="width: 100%;" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="formModel.password" type="password" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item prop="repassword">
            <el-input v-model="formModel.repassword" type="password" placeholder="请再次输入密码" />
          </el-form-item>

          <el-form-item>
            <el-button style="width: 100%; margin-top: 20px" type="primary" @click="confirm(formRef)">确认</el-button>
          </el-form-item>

        </el-form>
      </el-card>
      <div class="userWorks" v-else>
        <el-empty v-if="!userArticleList.length"></el-empty>
        <showPanel :list="userArticleList" :isUser="true" @reloadList="getUserArticles" v-else></showPanel>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.user {
  height: 600px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0px 20px;

  .left,
  .right {
    flex: 1 1 300px; // 响应式宽度，最小300px
    min-width: 350px;
    height: 100%;
  }

  .left {
    margin-right: 20px;
    padding-top: 10%;
    display: flex;
    flex-direction: column;
    align-items: center;

    .pic {
      width: 300px;
      height: 300px;
      border-radius: 50%;
      border: 1px solid #ddb8b8;

      :deep(.avatar-uploader) {
        width: 100%;
        height: 100%;

        .el-upload {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          position: relative;
          width: 100%;
          height: 100%;

          .avatar {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 1px solid rgb(201, 123, 123, green, blue);
          }

          .cover {
            position: absolute;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0);
            border-radius: 50%;
            transition: all 0.4s;

          }

          .addIcon {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            font-size: 48px;
            color: rgba(255, 255, 255, 0);
            transition: all 0.4s;


          }

          &:hover {
            .cover {
              background-color: rgba(0, 0, 0, 0.5);
            }

            .addIcon {
              color: rgb(255, 255, 255, 1);
            }
          }
        }

      }

      margin-bottom: 25px;
    }

    .info {
      text-align: center;

      p {
        color: #878787;
        margin-bottom: 10px;
      }
    }
  }

  .right {
    display: flex;
    flex-direction: column;
    justify-content: center;

    .setting {
      height: 500px;

      .card-header {
        text-align: center;
      }
    }

    .userWorks {
      height: 100%;
      overflow-y: auto;
    }
  }
}
</style>
<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus'
import type { UploadProps } from 'element-plus'
import { Plus } from '@element-plus/icons-vue';
import type { FormModel } from '@/types/user';
import type { FormInstance, FormRules } from 'element-plus'
import { updateUserInfoService } from '@/api/user';


const userStore = useUserStore()

//左侧头像上传
const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  // uploadFile
) => {
  console.log('上传成功：', response);
}

const handleError: UploadProps['onError'] = (error) => {
  console.error('上传失败', error)
}

const uploadImg = {
  "Authorization": userStore.token
}


// //左侧头像上传
// const imageUrl = ref('')

// const handleAvatarSuccess: UploadProps['onSuccess'] = (
//   response,
//   uploadFile
// ) => {
//   imageUrl.value = URL.createObjectURL(uploadFile.raw!)
// }

// const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
//   if (rawFile.type !== 'image/jpeg') {
//     ElMessage.error('Avatar picture must be JPG format!')
//     return false
//   } else if (rawFile.size / 1024 / 1024 > 2) {
//     ElMessage.error('Avatar picture size can not exceed 2MB!')
//     return false
//   }
//   return true
// }


//右侧 修改个人资料
const formRef = ref<FormInstance>()

const formModel = ref<FormModel>({
  username: '',
  password: '',
  repassword: ''
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
  ]
})
const confirm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate()

  const res = await updateUserInfoService({
    username: formModel.value.username,
    password: formModel.value.password
  })
  console.log(res);
  userStore.username = formModel.value.username
  userStore.password = formModel.value.password
  ElMessage.success('修改成功！')
  formModel.value = {
    username: '',
    password: '',
    repassword: ''
  }
}

</script>
<template>
  <div class="user">
    <!-- 左侧头像上传 -->
    <div class="left">
      <div class="userinfo">
        <div class="pic">
          <el-upload class="avatar-uploader" action="http://127.0.0.1:8080/my/userinfo/updateAvatar"
            :show-file-list="false" :on-success="handleAvatarSuccess" :on-error="handleError" :headers="uploadImg"
            name="avatar">
            <img :src="userStore.userPic" class="avatar" />
            <!-- 这里要实现鼠标移入背景变暗的效果，方法是使用一个图层遮盖 -->
            <div class="cover"></div>
            <el-icon class="addIcon">
              <Plus />
            </el-icon>
          </el-upload>
        </div>
        <div class="info">
          <p style="font-size: 20px;color: #545151;">{{ userStore.username }}</p>
          <p style="font-size: 15px;">{{ userStore.password }}</p>
        </div>
      </div>
    </div>
    <!-- 右侧资料修改 -->
    <div class="right">
      <el-card class="setting">
        <template #header>
          <div class="card-header">
            <h2>修改个人资料</h2>
          </div>
        </template>
        <el-form ref="formRef" :model="formModel" :rules="rules" status-icon size="large">
          <el-form-item prop="username">
            <el-input v-model="formModel.username" placeholder="请输入用户名" />
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

    </div>
  </div>
  <!-- <div class="user">
    <div class="left">
      <div class="userinfo">
        <div class="pic">
          <el-upload class="avatar-uploader" action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
            :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
            <img :src="userStore.userPic" class="avatar" />
            这里要实现鼠标移入背景变暗的效果，方法是使用一个图层遮盖
            <div class="cover"></div>
            <el-icon class="addIcon">
              <Plus />
            </el-icon>
          </el-upload>

        </div>
        <div class="info">
          <p style="font-size: 20px;color: #545151;">{{ userStore.username }}</p>
          <p style="font-size: 15px;">{{ userStore.password }}</p>
        </div>
      </div>
    </div>
    <div class="right">
      <el-card class="setting">
        <template #header>
          <div class="card-header">
            <h2>修改个人资料</h2>
          </div>
        </template>
<el-form ref="formRef" :model="formModel" :rules="rules" status-icon size="large">
  <el-form-item prop="username">
    <el-input v-model="formModel.username" placeholder="请输入用户名" />
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
</div>

</div> -->
</template>
<style lang="less" scoped>
.user {
  height: 100%;
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
  }
}
</style>
<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { userLoginService, userRegisterService } from '@/api/user'
// import type { userTokenType } from '@/types/user'
import { getUserInfoService } from '@/api/user'

type userTokenType = {
  status: number;
  message: string;
  token: string;
  refreshToken: string;
};

const userStore = useUserStore()

// 标题栏
const activeName = ref('first')


// 登录
const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()
type FormModel = {
  username: string,
  password: string,
  remember: boolean,
  repassword: string
}
const formModel = ref<FormModel>({
  username: '',
  password: '',
  remember: userStore.remember || false,
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


// 注册 or 登录

const router = useRouter()

const changeActiveName = () => {
  activeName.value = activeName.value === 'first' ? 'second' : 'first'
}
const login = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate()
  const res = await userLoginService({
    username: formModel.value.username,
    password: formModel.value.password
  })
  userStore.remember = formModel.value.remember//记住登录状态 
  userStore.username = formModel.value.username
  userStore.password = formModel.value.password

  userStore.token = (res as unknown as userTokenType).token
  userStore.refreshToken = (res as unknown as userTokenType).refreshToken
  console.log('loginToken', res);

  ElMessage.success('登录成功！')
  router.push({ path: '/home' })

  //一登录成功就要获取用户信息
  const res2 = await getUserInfoService();
  userStore.userId = res2.data.id;
  userStore.userPic = 'http://localhost:8080' + res2.data.user_pic;
}

const register = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate()
  userStore.username = formModel.value.username
  userStore.password = formModel.value.password
  activeName.value = 'first'
  const res = await userRegisterService({
    username: formModel.value.username,
    password: formModel.value.password
  })
  console.log(res);

  ElMessage.success('注册成功！')
}

// 监听登录注册的切换，及时清空表单
watch(activeName, () => {
  formModel.value = {
    username: '',
    password: '',
    remember: userStore.remember,
    repassword: ''
  }
})
onMounted(() => {
  if (formModel.value.remember) {
    formModel.value.password = userStore.password
    formModel.value.username = userStore.username
  }
})

</script>
<template>
  <div class="login">
    <el-tabs v-model="activeName" type="border-card" class="demo-tabs">
      <!-- 登录 -->
      <el-tab-pane label="登录" name="first">

        <el-form ref="loginFormRef" :model="formModel" :rules="rules" class="demo-ruleForm" status-icon size="large">
          <el-form-item prop="username">
            <el-input v-model="formModel.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="formModel.password" type="password" placeholder="请输入密码" />
          </el-form-item>

          <el-form-item>
            <el-button style="width: 100%; margin-top: 20px" type="primary" @click="login(loginFormRef)">登录</el-button>
          </el-form-item>

          <el-form-item class="third">
            <el-checkbox v-model="formModel.remember">记住密码</el-checkbox>
            <el-link type="primary" style="font-size: 12px" @click="changeActiveName">没有账号？点击注册</el-link>
          </el-form-item>
        </el-form>

      </el-tab-pane>
      <!-- 注册 -->
      <el-tab-pane label="注册" name="second">

        <el-form ref="registerFormRef" :model="formModel" :rules="rules" class="demo-ruleForm" status-icon size="large">
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
            <el-button style="width: 100%; margin-top: 20px" type="primary"
              @click="register(registerFormRef)">注册</el-button>
          </el-form-item>

          <el-form-item class="register_third">
            <el-link type="primary" style="font-size: 12px" @click="changeActiveName">已有账号？点击登录</el-link>
          </el-form-item>
        </el-form>

      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<style lang="less" scoped>
.login {
  width: 100%;
  height: 100%;
  background: url('@/assets/【哲风壁纸】森林-车站.png') no-repeat center / cover;

  .demo-tabs {
    padding: 20px;
    width: 400px;
    height: 400px;
    display: flex;
    text-align: center;
    background-color: #fff;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 10px;
    border: 2px solid #000000;

    :deep(.el-tabs__nav-wrap) {
      display: flex;
      justify-content: center;
    }

    :deep(.el-form-item) {
      margin-bottom: 20px;
    }

    .third :deep(.el-form-item__content) {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .register_third :deep(.el-form-item__content) {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
  }
}
</style>

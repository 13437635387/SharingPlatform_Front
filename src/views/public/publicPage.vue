<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { ref } from 'vue'
import type { QuillEditor as QuillEditorType } from '@vueup/vue-quill';
import { ElMessage, type UploadProps } from 'element-plus'
import { addArticleService } from '@/api/article'
import { useUserStore } from '@/stores/user'

// 表单
const ruleFormRef = ref()
const formData = ref<{
  title: string
  imgURL: Blob
  content: string
}>({
  title: '',
  imgURL: new Blob(),
  content: ''
})
// 校验规则
const rules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' }
  ],
  imgURL: [
    { required: true, message: '请上传文章封面', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' }
  ]
}
//图片上传
const backupURL = ref('')//图片回显用
const handleChange: UploadProps['onChange'] = (uploadFile) => {
  formData.value.imgURL = uploadFile.raw as Blob
  backupURL.value = URL.createObjectURL(uploadFile.raw as Blob);
}

// 设置编辑器
const editor = ref<InstanceType<typeof QuillEditorType> | null>(null)

// 提交表单
const userStore = useUserStore()
const submitForm = async () => {
  await ruleFormRef.value.validate()
  //转变为FormData格式
  const fd = new FormData()
  for (const key in formData.value) {
    fd.append(key, (formData.value as Record<string, string | Blob>)[key])
  }
  fd.append('user_id', userStore.userId)//追加用户id
  await addArticleService(fd)
  ElMessage.success('新增成功!')
  formData.value = { title: '', imgURL: new Blob(), content: '' }
  backupURL.value = '' // 清空图片回显
  editor.value?.setHTML('')//清空编辑器内容
}
</script>

<template>
  <div class="public">
    <el-card class="content">
      <el-form ref="ruleFormRef" :model="formData" :rules="rules" label-width="100px" status-icon>
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" maxlength="15" show-word-limit />
        </el-form-item>
        <!-- 图片 -->
        <el-form-item label="文章封面" prop="imgURL">
          <el-upload :show-file-list="false" class="avatar-uploader" :auto-upload="false" @change="handleChange">
            <img v-if="backupURL" :src="backupURL" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="文章内容" prop="content">
          <div class="editor">
            <QuillEditor theme="snow" v-model:content="formData.content" contentType="html" ref="editor">
            </QuillEditor>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm" size="large" style="width:150px;">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<style lang="less" scoped>
.public {
  width: 100%;
  // height: 700px;

  .content {
    width: 700px;
    height: 100%;

    // 图像
    :deep(.avatar-uploader) {
      .avatar {
        width: 178px;
        height: 178px;
        display: block;
      }

      .el-upload {
        border: 1px dashed var(--el-border-color);
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: var(--el-transition-duration-fast);
      }

      .el-upload:hover {
        border-color: var(--el-color-primary);
      }
    }

    .el-icon.avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      text-align: center;
    }

    .editor {
      width: 100%;

      :deep(.ql-editor) {
        min-height: 300px;
      }
    }

  }
}
</style>
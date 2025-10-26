<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { ref, toRaw, toRef, toRefs, watch } from 'vue'
import type { QuillEditor as QuillEditorType } from '@vueup/vue-quill';
import { ElMessage, type UploadProps } from 'element-plus'
import { addArticleService, addArticleVideoService, addLargeFileArticleService, checkFileRequest, editArticleService, editLargeFileArticleService, mergeRequest } from '@/api/article'
import { useUserStore } from '@/stores/user'
import SparkMD5 from 'spark-md5'
import type { FileChunkType } from '@/types/user'

type currentDetailInfoType = {
  user_pic: string,
  username: string,
  user_id: number,
  id: number,
  title: string,
  url: string,
  content: string,
}

const props = defineProps<{ panelType: string, currentDetailInfo?: currentDetailInfoType }>()

const fullscreenLoading = ref(false)//loading

// 表单
const ruleFormRef = ref()
const formData = ref<{
  // id?: number
  title: string
  imgURL: Blob
  content: string
}>({
  // id: 0,
  title: '',
  imgURL: new Blob(),
  content: ''
})
// 校验规则
// 编辑器要特殊判空，可能是它组件设计问题，一旦输入内容后再删除，值变为"<p><br></p>"，而不是""
const checkNull = (rule: any, value: any, callback: any) => {
  if (!value.trim() || value === '<p><br></p>') {
    return callback(new Error('请输入文章内容'))
  }
  callback()
}
const rules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' }
  ],
  imgURL: [
    { required: true, message: '请上传文章封面', trigger: 'change' }
  ],
  content: [
    // { required: true, message: '请输入文章内容', trigger: 'blur' },
    { validator: checkNull, trigger: 'blur' }
  ]
}
// 编辑器失焦时校验，因为QuillEditor 没有原生blur事件，所以自定义一个
const onEditorBlur = () => {
  ruleFormRef.value?.validateField('content')
}

//文件上传（图片or视频）
const backupURL = ref('')//图片回显
const isPic = ref(true)//是否是图片
const videoUploadFile = ref()//视频文件
const handleChange: UploadProps['onChange'] = (uploadFile) => {
  console.log('uploadFile:', uploadFile);
  if (uploadFile.raw!.type.startsWith('image/')) {
    isPic.value = true
    formData.value.imgURL = uploadFile.raw as Blob
  } else {
    isPic.value = false
    videoUploadFile.value = uploadFile.raw
  }
  const fr = new FileReader();
  fr.readAsDataURL(uploadFile.raw as Blob);
  fr.onload = () => {
    backupURL.value = fr.result as string;
  };
}

// 设置编辑器
const editor = ref<InstanceType<typeof QuillEditorType> | null>(null)

const userStore = useUserStore()
// 大文件分片上传
const CHUNK_SIZE = 1024 * 1024  // 1MB
const fileChunksList = ref<Blob[]>([])//原始分片数组
const fileDetailList = ref<FileChunkType[]>([])//分片详细信息数组


// // 计算文件哈希(增量算法，完整计算分片)
// const sparkHash = () => {
//   return new Promise((resolve) => {
//     const spark = new SparkMD5.ArrayBuffer()
//     function _read(i: number) {

//       if (i >= fileChunksList.value.length) {
//         resolve(spark.end())
//         return
//       }
//       const blob = fileChunksList.value[i]
//       const fileReader = new FileReader()
//       fileReader.readAsArrayBuffer(blob)
//       fileReader.onload = (e) => {
//         spark.append(e.target?.result as ArrayBuffer)
//         _read(i + 1)
//       }
//     }
//     _read(0)
//   })
// }

const uploadToBehind = async (existChunks = []) => {
  // 构造FormDatas数组
  const formDatas = fileDetailList.value
    .filter((item, index) => {
      // 过滤服务器上已经有的切片
      return !existChunks.includes(item.fileHash)
    })
    .map(item => {
      const formData = new FormData()
      formData.append('fileHash', item.fileHash)
      formData.append('chunkIndex', item.chunkIndex)
      formData.append('chunk', item.chunk)
      formData.append('fileName', item.fileName)
      return formData
    })
  console.log('formDatas:', formDatas);
  // 发送请求
  const maxCount = 6; // 最大并发数
  const total = formDatas.length;
  let completedCount = 0; // 已完成任务数
  let resolveAll: any;
  const allDone = new Promise(resolve => {
    resolveAll = resolve;
  });

  // 2. 构建“待执行任务队列”（每个任务返回Promise）
  const taskQueue = formDatas.map((formData, index) => {
    // 封装单个分片上传任务
    return () => {
      const currentIndex = index;
      return addArticleVideoService(formData)
        .then(res => {
          // console.log(`分片 ${currentIndex + 1}/${total} 上传成功`);
          return res.data;
        })
        .catch(err => {
          // console.error(`分片 ${currentIndex + 1}/${total} 上传失败`, err);
        })
        .finally(() => {
          completedCount++;
          // 任务完成后，从“待执行队列”取任务补充
          if (taskQueue.length > 0) {
            const nextTask = taskQueue.shift(); // 取出下一个任务
            if (nextTask) {
              nextTask().then(); // 执行下一个任务
            }
          }
          // 所有任务完成
          if (completedCount === total) {
            resolveAll();
          }
        });
    };
  });

  // 3. 启动初始任务（填充到最大并发数）
  for (let i = 0; i < maxCount && taskQueue.length > 0; i++) {
    const task = taskQueue.shift();
    if (task) {
      task().then();
    }
  }

  // 4. 等待所有任务完成
  await allDone;
  console.log('所有分片上传完成');

  // 发送切片合并请求
  await mergeRequest({
    size: CHUNK_SIZE,
    fileHash: fileDetailList.value[0].fileHash,
    fileName: fileDetailList.value[0].fileName,
  })

  // 合并完成后添加文章
  if (props.panelType === 'public') {
    const res = await addLargeFileArticleService({
      fileHash: fileDetailList.value[0].fileHash,
      fileName: fileDetailList.value[0].fileName,
      title: formData.value.title,
      user_id: userStore.userId,
      content: formData.value.content,
    })
    console.log(res);
    ElMessage.success(res.message)
  }
  else {
    // 编辑文章
    const res = await editLargeFileArticleService({
      fileHash: fileDetailList.value[0].fileHash,
      fileName: fileDetailList.value[0].fileName,
      title: formData.value.title,
      user_id: userStore.userId,
      content: formData.value.content,
      id: props.currentDetailInfo!.id
    })
    console.log(res);
    ElMessage.success(res.message)
    window.location.reload()
  }
  formData.value = { title: '', imgURL: new Blob(), content: '' }
  backupURL.value = '' // 清空图片回显
  editor.value?.setHTML('')//清空编辑器内容
  return
}

// 秒传
const verify = async (fileHash: string, fileName: string) => {
  const res = await checkFileRequest({
    fileHash,
    fileName,
  })
  return res.data
}

const videoUpload = async () => {
  console.log('开始上传：', new Date());
  console.time('分片+hash时间');

  fullscreenLoading.value = true
  fileChunksList.value = [] // 清空分片数组
  const rawValue = toRaw(videoUploadFile.value)
  console.log(rawValue)

  // 视频里的简洁实现：把分片任务分配给 THREAD_COUNT 个 worker，每个 worker 负责一段索引区间
  const totalFileSize = rawValue.size // 文件总大小
  const chunkCount = Math.ceil(totalFileSize / CHUNK_SIZE)
  const THREAD_COUNT = Math.min(navigator.hardwareConcurrency || 4, chunkCount)// 使用核心数和分片数的较小值作为线程数

  // 创建多个 worker，分配分片计算任务，收集结果并扁平化返回
  const cutFile = (file: File) => {
    return new Promise<any[]>((resolve, reject) => {
      const result: any[] = []
      let finishCount = 0
      for (let i = 0; i < THREAD_COUNT; i++) {
        const worker = new Worker(new URL('../util/worker.js', import.meta.url), { type: 'module' })
        // 计算该 worker 负责的分片区间
        const start = Math.floor((i * chunkCount) / THREAD_COUNT)
        let end = Math.floor(((i + 1) * chunkCount) / THREAD_COUNT)
        if (end > chunkCount) end = chunkCount

        worker.postMessage({ file, CHUNK_SIZE, start, end })
        worker.onmessage = (e: MessageEvent) => {
          // worker 返回一个数组（该区间的 chunk 列表）
          result[i] = e.data
          worker.terminate()
          finishCount++
          if (finishCount === THREAD_COUNT) {
            // 扁平化并返回
            resolve((result as any[]).flat())
          }
        }
        worker.onerror = (err) => {
          worker.terminate()
          reject(err)
        }
      }
    })
  }

  // 调用 cutFile 获取所有 chunk 对象（每个对象包含 index, blob, hash）
  const chunks = await cutFile(rawValue as File)
  // 按 index 排序
  chunks.sort((a: any, b: any) => a.index - b.index)

  // 用每个分片的 hash 拼接后再计算整体 hash（避免在主线程读大量 ArrayBuffer）
  const spark = new SparkMD5()
  for (const c of chunks) {
    spark.append(c.hash)
  }
  const fileHash = spark.end()

  // 把 blob 列表赋给 fileChunksList 保持原逻辑不变
  fileChunksList.value = chunks.map((c: any) => c.blob)
  console.log('fileHash', fileHash)
  console.timeEnd('分片+hash时间')


  // 秒传   ---如果改文件已经上传过就不再分片，直接添加文章
  const data = await verify(fileHash as string, rawValue.name)
  const isExists = data.isExists
  if (isExists) {
    //添加文章
    if (props.panelType === 'public') {
      const res = await addLargeFileArticleService({
        fileHash: fileHash,
        fileName: rawValue.name,
        title: formData.value.title,
        user_id: userStore.userId,
        content: formData.value.content,
      })
      console.log('成功添加', res);
      fullscreenLoading.value = false
      ElMessage.success(res.message)
    } else {
      // 编辑文章
      const res = await editLargeFileArticleService({
        fileHash: fileHash,
        fileName: rawValue.name,
        title: formData.value.title,
        user_id: userStore.userId,
        content: formData.value.content,
        id: props.currentDetailInfo!.id
      })
      console.log('成功编辑', res);
      fullscreenLoading.value = false
      window.location.reload()
      ElMessage.success(res.message)

    }
    formData.value = { title: '', imgURL: new Blob(), content: '' }
    backupURL.value = '' // 清空图片回显
    editor.value?.setHTML('')//清空编辑器内容
    console.log('结束上传：', new Date());

  } else {
    // 构造详细分片数组
    fileDetailList.value = fileChunksList.value.map((item, index) => {
      return {
        chunk: item, //分片内容
        fileHash: fileHash as string, //文件哈希，强制类型为string
        chunkIndex: `${fileHash}-${index}`, //分片索引哈希
        fileName: rawValue.name, //文件名
      }
    })
    // 上传视频切片
    await uploadToBehind(data.existChunks)
    fullscreenLoading.value = false
    console.log('结束上传：', new Date());
  }
}

// 提交表单
const submitForm = async () => {
  await ruleFormRef.value.validate()
  // 如果是图像直接提交
  if (isPic.value) {
    fullscreenLoading.value = true
    //转变为FormData格式
    const fd = new FormData()
    for (const key in formData.value) {
      fd.append(key, (formData.value as unknown as Record<string, string | Blob>)[key])
    }
    fd.append('user_id', userStore.userId)//追加用户id
    // fd.append('isPic', String(isPic.value))//是否是图片
    //发布和编辑分开处理
    if (props.panelType === 'public') {
      await addArticleService(fd)
      fullscreenLoading.value = false
      ElMessage.success('新增成功!')
    }
    if (props.panelType === 'edit') {
      if (props.currentDetailInfo && props.currentDetailInfo.id !== undefined) {
        fd.append('id', String(props.currentDetailInfo.id))
        const res = await editArticleService(fd)
        console.log('res:', res);
        fullscreenLoading.value = false
        ElMessage.success('编辑成功!')
        // 刷新页面
        window.location.reload()
      }
    }

    formData.value = { title: '', imgURL: new Blob(), content: '' }
    // videoUploadFile.value = new File([], '') // 清空视频文件
    backupURL.value = '' // 清空文件回显
    editor.value?.setHTML('')//清空编辑器内容
  }
  // 如果是视频，使用大文件分片上传
  else {
    videoUpload()
  }
}

//props直接结构会丢失相应属性的响应式，而用watch可以监听到变化，为防止formData无法通过currentDetailInfo初始化，使用watch监听props变化
watch(() => props.currentDetailInfo, (newVal) => {
  if (newVal) {
    // 处理数据初始化
    Object.assign(formData.value, {
      title: newVal.title,
      content: newVal.content,
    })
  }
}, { immediate: true })
</script>

<template>
  <!-- 发布 -->
  <el-card class="content" v-if="panelType === 'public'">
    <el-form ref="ruleFormRef" :model="formData" :rules="rules" label-width="100px" status-icon>
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入标题" maxlength="15" show-word-limit />
      </el-form-item>
      <!-- 图片 -->
      <el-form-item label="文章配图" prop="imgURL">
        <div style="display: flex; align-items: flex-start;">
          <el-upload :show-file-list="false" class="avatar-uploader" :auto-upload="false" @change="handleChange">
            <template #trigger>
              <el-button type="primary" plain>上传文件</el-button>
            </template>
          </el-upload>
          <div class="avatar-show" style="margin-right: 16px;">
            <div class="avatar" v-if="backupURL">
              <img :src="backupURL" style="width: 100%;
              height: 100%;" v-if="isPic" />
              <video :src="backupURL" v-else style="width: 100%;
              height: 100%;" controls></video>
            </div>
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="文章内容" prop="content">
        <div class="editor">
          <QuillEditor theme="snow" v-model:content="formData.content" contentType="html" ref="editor"
            @blur="onEditorBlur">
          </QuillEditor>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm" size="large" style="width:150px;"
          v-loading.fullscreen.lock="fullscreenLoading">提交</el-button>
      </el-form-item>
    </el-form>
  </el-card>

  <!-- 编辑 -->
  <el-card class="content" v-if="panelType === 'edit'">
    <el-form ref="ruleFormRef" :model="formData" :rules="rules" label-width="100px" status-icon>
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入标题" maxlength="15" show-word-limit />
      </el-form-item>
      <!-- 图片 -->
      <el-form-item label="文章配图" prop="imgURL">
        <div style="display: flex; align-items: flex-start;">
          <el-upload :show-file-list="false" class="avatar-uploader" :auto-upload="false" @change="handleChange">
            <template #trigger>
              <el-button type="primary" plain>上传文件</el-button>
            </template>
          </el-upload>
          <div class="avatar-show" style="margin-right: 16px;">
            <div class="avatar" v-if="backupURL">
              <img :src="backupURL" style="width: 100%;
              height: 100%;" v-if="isPic" />
              <video :src="backupURL" v-else style="width: 100%;
              height: 100%;" controls></video>
            </div>
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="文章内容" prop="content">
        <div class="editor">
          <QuillEditor theme="snow" v-model:content="formData.content" contentType="html" ref="editor"
            @blur="onEditorBlur">
          </QuillEditor>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm" size="large" style="width:150px;"
          v-loading.fullscreen.lock="fullscreenLoading">提交</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<style lang="less" scoped>
// .public {
//   width: 100%;
// height: 700px;

.content {
  width: 100%;
  // width: 700px;
  height: 100%;

  // 图像
  // :deep(.avatar-uploader) {
  //   .avatar {
  //     width: 178px;
  //     height: 178px;
  //     display: block;
  //   }

  //   .el-upload {
  //     border: 1px dashed var(--el-border-color);
  //     border-radius: 6px;
  //     cursor: pointer;
  //     position: relative;
  //     overflow: hidden;
  //     transition: var(--el-transition-duration-fast);
  //   }

  //   .el-upload:hover {
  //     border-color: var(--el-color-primary);
  //   }
  // }

  .avatar-show {
    // .avatar {
    width: 178px;
    height: 178px;
    display: block;
    border: 1px dashed #cbcbcb;
    border-radius: 10px;
    margin-left: 20px;

    // }
    .avatar {
      width: 100%;
      height: 100%;
      display: block;
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

// }</style>

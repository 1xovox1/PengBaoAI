<template>
  <div class="file-center">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="文件管理" name="files">
        <div class="file-upload-area">
          <el-upload
            class="upload-demo"
            drag
            :action="uploadUrl"
            multiple
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 PDF、Excel、Word、图片等格式，最大 50MB
              </div>
            </template>
          </el-upload>
        </div>
      </el-tab-pane>
      <el-tab-pane label="知识库" name="knowledge">
        <KnowledgeBase />
      </el-tab-pane>
    </el-tabs>

    <div class="file-list">
      <h3>我的文件</h3>
      <el-table :data="fileList" style="width: 100%">
        <el-table-column prop="name" label="文件名" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="size" label="大小" width="100" />
        <el-table-column prop="uploadTime" label="上传时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button text size="small" @click="analyzeFile(scope.row)">
              分析
            </el-button>
            <el-button text size="small" @click="downloadFile(scope.row)">
              下载
            </el-button>
            <el-button text size="small" type="danger" @click="deleteFile(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import KnowledgeBase from './KnowledgeBase.vue'
import { listFiles as apiListFiles, deleteFile as apiDeleteFile, downloadUrl } from '@/api/files'

const activeTab = ref('files')

const uploadUrl = ref('/api/upload')

const fileList = ref([])

async function refreshFiles() {
  try {
    fileList.value = await apiListFiles()
  } catch (e) {
    ElMessage.error(`加载文件列表失败：${e.message || e}`)
  }
}

onMounted(() => {
  refreshFiles()
})

const handleUploadSuccess = (response, file) => {
  ElMessage.success('文件上传成功')
  // 后端会返回 file 记录；为了避免不一致，直接刷新列表
  refreshFiles()
}

const handleUploadError = () => {
  ElMessage.error('文件上传失败')
}

const getFileType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase()
  const typeMap = {
    pdf: 'PDF',
    xlsx: 'Excel',
    xls: 'Excel',
    doc: 'Word',
    docx: 'Word',
    jpg: '图片',
    png: '图片',
    jpeg: '图片'
  }
  return typeMap[ext] || '其他'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const analyzeFile = (file) => {
  ElMessage.info(`正在分析文件：${file.name}`)
  // 实现文件分析逻辑，调用知识库API
}

const downloadFile = (file) => {
  if (!file?.id) return
  window.open(downloadUrl(file.id), '_blank', 'noopener,noreferrer')
}

const deleteFile = (file) => {
  if (!file?.id) return
  apiDeleteFile(file.id)
    .then(() => {
      ElMessage.success('文件已删除')
      refreshFiles()
    })
    .catch((e) => ElMessage.error(`删除失败：${e.message || e}`))
}
</script>

<style scoped lang="scss">
.file-center {
  .file-upload-area {
    margin-bottom: 24px;

    .upload-demo {
      :deep(.el-upload-dragger) {
        background: #F9FAFB;
        border: 2px dashed #D1D5DB;
        border-radius: 8px;

        &:hover {
          border-color: #1428A0;
        }
      }
    }
  }

  .file-list {
    h3 {
      margin-bottom: 16px;
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    }
  }
}
</style>


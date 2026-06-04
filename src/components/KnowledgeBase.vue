<template>
  <div class="knowledge-base">
    <div class="kb-header">
      <h2>知识库管理</h2>
      <el-button type="primary" @click="showUploadDialog = true">
        <el-icon><Plus /></el-icon>
        <span style="margin-left: 4px;">上传知识库</span>
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="kb-toolbar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索知识库..."
        :prefix-icon="Search"
        clearable
        style="width: 300px;"
        @input="handleSearch"
      />
      <el-select v-model="selectedCategory" placeholder="分类筛选" clearable style="width: 150px;">
        <el-option label="全部" value="" />
        <el-option label="产品文档" value="product" />
        <el-option label="营销资料" value="marketing" />
        <el-option label="培训材料" value="training" />
        <el-option label="FAQ" value="faq" />
        <el-option label="其他" value="other" />
      </el-select>
    </div>

    <!-- 知识库列表 -->
    <div class="kb-list">
      <el-table :data="filteredKnowledgeBases" style="width: 100%">
        <el-table-column prop="name" label="知识库名称" min-width="200" />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="scope">
            <el-tag :type="getCategoryType(scope.row.category)">
              {{ getCategoryLabel(scope.row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fileCount" label="文件数" width="100" />
        <el-table-column prop="size" label="总大小" width="120" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'ready' ? 'success' : 'warning'">
              {{ scope.row.status === 'ready' ? '就绪' : '处理中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button text size="small" @click="viewDetails(scope.row)">
              查看
            </el-button>
            <el-button text size="small" @click="editKnowledgeBase(scope.row)">
              编辑
            </el-button>
            <el-button text size="small" @click="useInChat(scope.row)">
              在对话中使用
            </el-button>
            <el-button text size="small" type="danger" @click="deleteKnowledgeBase(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 上传知识库对话框 -->
    <el-dialog
      v-model="showUploadDialog"
      title="上传知识库"
      width="600px"
      @close="resetUploadForm"
    >
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="知识库名称" required>
          <el-input v-model="uploadForm.name" placeholder="请输入知识库名称" />
        </el-form-item>
        <el-form-item label="分类" required>
          <el-select v-model="uploadForm.category" placeholder="选择分类" style="width: 100%;">
            <el-option label="产品文档" value="product" />
            <el-option label="营销资料" value="marketing" />
            <el-option label="培训材料" value="training" />
            <el-option label="FAQ" value="faq" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="uploadForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入知识库描述（可选）"
          />
        </el-form-item>
        <el-form-item label="上传文件" required>
          <el-upload
            ref="uploadRef"
            :action="uploadUrl"
            :file-list="uploadForm.files"
            multiple
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            drag
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 PDF、Word、Excel、TXT、MD 等格式，单个文件最大 50MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="处理方式">
          <el-radio-group v-model="uploadForm.processMode">
            <el-radio label="auto">自动处理（推荐）</el-radio>
            <el-radio label="manual">手动处理</el-radio>
          </el-radio-group>
          <div style="font-size: 12px; color: #909399; margin-top: 8px;">
            自动处理将自动提取文档内容并建立索引，手动处理需要您后续手动配置
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" @click="submitUpload" :loading="uploading">
          上传并处理
        </el-button>
      </template>
    </el-dialog>

    <!-- 知识库详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="知识库详情"
      width="800px"
    >
      <div v-if="selectedKB" class="kb-detail">
        <div class="detail-section">
          <h3>基本信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="名称">{{ selectedKB.name }}</el-descriptions-item>
            <el-descriptions-item label="分类">
              <el-tag :type="getCategoryType(selectedKB.category)">
                {{ getCategoryLabel(selectedKB.category) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="文件数">{{ selectedKB.fileCount }}</el-descriptions-item>
            <el-descriptions-item label="总大小">{{ selectedKB.size }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ selectedKB.createTime }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ selectedKB.updateTime }}</el-descriptions-item>
            <el-descriptions-item label="状态" :span="2">
              <el-tag :type="selectedKB.status === 'ready' ? 'success' : 'warning'">
                {{ selectedKB.status === 'ready' ? '就绪' : '处理中' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">
              {{ selectedKB.description || '暂无描述' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <h3>文件列表</h3>
          <el-table :data="selectedKB.files" style="width: 100%">
            <el-table-column prop="name" label="文件名" />
            <el-table-column prop="size" label="大小" width="100" />
            <el-table-column prop="uploadTime" label="上传时间" width="180" />
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button text size="small" @click="previewFile(scope.row)">
                  预览
                </el-button>
                <el-button text size="small" type="danger" @click="removeFile(scope.row)">
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, UploadFilled } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const selectedCategory = ref('')
const showUploadDialog = ref(false)
const showDetailDialog = ref(false)
const selectedKB = ref(null)
const uploading = ref(false)
const uploadUrl = ref('/api/knowledge-base/upload')

const uploadForm = ref({
  name: '',
  category: '',
  description: '',
  files: [],
  processMode: 'auto'
})

const knowledgeBases = ref([
  {
    id: 1,
    name: '三星产品手册',
    category: 'product',
    description: '包含所有三星产品的详细参数和功能介绍',
    fileCount: 15,
    size: '45.6 MB',
    createTime: '2024-01-10 10:00',
    updateTime: '2024-01-15 14:30',
    status: 'ready',
    files: [
      { name: 'Galaxy S24系列.pdf', size: '12.3 MB', uploadTime: '2024-01-15 14:30' },
      { name: '折叠屏产品介绍.docx', size: '8.5 MB', uploadTime: '2024-01-15 14:25' }
    ]
  },
  {
    id: 2,
    name: '营销话术库',
    category: 'marketing',
    description: '各类营销场景的标准话术和应对策略',
    fileCount: 8,
    size: '23.4 MB',
    createTime: '2024-01-08 09:00',
    updateTime: '2024-01-14 16:20',
    status: 'ready',
    files: []
  },
  {
    id: 3,
    name: '客户常见问题FAQ',
    category: 'faq',
    description: '客户咨询的常见问题及标准答案',
    fileCount: 3,
    size: '5.2 MB',
    createTime: '2024-01-12 11:00',
    updateTime: '2024-01-12 11:00',
    status: 'ready',
    files: []
  }
])

const filteredKnowledgeBases = computed(() => {
  let result = knowledgeBases.value

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(kb =>
      kb.name.toLowerCase().includes(keyword) ||
      (kb.description && kb.description.toLowerCase().includes(keyword))
    )
  }

  if (selectedCategory.value) {
    result = result.filter(kb => kb.category === selectedCategory.value)
  }

  return result
})

const getCategoryLabel = (category) => {
  const map = {
    product: '产品文档',
    marketing: '营销资料',
    training: '培训材料',
    faq: 'FAQ',
    other: '其他'
  }
  return map[category] || category
}

const getCategoryType = (category) => {
  const map = {
    product: 'primary',
    marketing: 'warning',
    training: 'success',
    faq: 'info',
    other: ''
  }
  return map[category] || ''
}

const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

const handleFileChange = (file, fileList) => {
  uploadForm.value.files = fileList
}

const handleFileRemove = (file, fileList) => {
  uploadForm.value.files = fileList
}

const resetUploadForm = () => {
  uploadForm.value = {
    name: '',
    category: '',
    description: '',
    files: [],
    processMode: 'auto'
  }
}

const submitUpload = async () => {
  if (!uploadForm.value.name.trim()) {
    ElMessage.warning('请输入知识库名称')
    return
  }
  if (!uploadForm.value.category) {
    ElMessage.warning('请选择分类')
    return
  }
  if (uploadForm.value.files.length === 0) {
    ElMessage.warning('请至少上传一个文件')
    return
  }

  uploading.value = true
  try {
    // 模拟上传
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newKB = {
      id: Date.now(),
      name: uploadForm.value.name,
      category: uploadForm.value.category,
      description: uploadForm.value.description,
      fileCount: uploadForm.value.files.length,
      size: formatTotalSize(uploadForm.value.files),
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString(),
      status: uploadForm.value.processMode === 'auto' ? 'processing' : 'ready',
      files: uploadForm.value.files.map(f => ({
        name: f.name,
        size: formatFileSize(f.size || 0),
        uploadTime: new Date().toLocaleString()
      }))
    }
    
    knowledgeBases.value.unshift(newKB)
    ElMessage.success('知识库上传成功！' + (uploadForm.value.processMode === 'auto' ? '正在自动处理中...' : ''))
    showUploadDialog.value = false
    resetUploadForm()
  } catch (error) {
    ElMessage.error('上传失败，请重试')
  } finally {
    uploading.value = false
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const formatTotalSize = (files) => {
  const totalBytes = files.reduce((sum, file) => sum + (file.size || 0), 0)
  return formatFileSize(totalBytes)
}

const viewDetails = (kb) => {
  selectedKB.value = kb
  showDetailDialog.value = true
}

const editKnowledgeBase = (kb) => {
  ElMessage.info(`编辑知识库：${kb.name}`)
  // 实现编辑逻辑
}

const useInChat = (kb) => {
  ElMessage.success(`知识库"${kb.name}"已应用到对话中`)
  // 实现应用到对话的逻辑
}

const deleteKnowledgeBase = async (kb) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除知识库"${kb.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const index = knowledgeBases.value.findIndex(k => k.id === kb.id)
    if (index > -1) {
      knowledgeBases.value.splice(index, 1)
      ElMessage.success('知识库已删除')
    }
  } catch {
    // 用户取消
  }
}

const previewFile = (file) => {
  ElMessage.info(`预览文件：${file.name}`)
}

const removeFile = async (file) => {
  try {
    await ElMessageBox.confirm(`确定要从知识库中移除文件"${file.name}"吗？`, '确认移除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    ElMessage.success('文件已移除')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped lang="scss">
.knowledge-base {
  padding: 20px;
}

.kb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: #111827;
  }
}

.kb-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.kb-list {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.kb-detail {
  .detail-section {
    margin-bottom: 24px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 16px;
    }
  }
}
</style>


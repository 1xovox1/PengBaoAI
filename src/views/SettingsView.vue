<template>
  <div class="settings-view">
    <div class="settings-header">
      <h1>系统设置</h1>
    </div>

    <div class="settings-content">
      <el-tabs v-model="activeTab" tab-position="left">
        <el-tab-pane label="API密钥管理" name="api">
          <div class="settings-section">
            <h3>API密钥管理</h3>
            <p class="api-tip">智能对话使用的密钥在<strong>服务器</strong>配置（server/.env），不在此处填写，以保证安全。此处仅作本地备忘或未来扩展。</p>
            <el-form :model="apiSettings" label-width="150px">
              <el-form-item label="OpenAI API Key">
                <el-input
                  v-model="apiSettings.openai"
                  type="password"
                  show-password
                  placeholder="输入OpenAI API密钥"
                />
              </el-form-item>
              <el-form-item label="Claude API Key">
                <el-input
                  v-model="apiSettings.claude"
                  type="password"
                  show-password
                  placeholder="输入Claude API密钥"
                />
              </el-form-item>
              <el-form-item label="Kimi API Key">
                <el-input
                  v-model="apiSettings.kimi"
                  type="password"
                  show-password
                  placeholder="输入Kimi API密钥"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveApiKeys">保存</el-button>
                <el-button @click="resetApiKeys">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="权限管理" name="permissions">
          <div class="settings-section">
            <h3>业务组权限分配</h3>
            <el-table :data="permissionGroups" style="width: 100%">
              <el-table-column prop="group" label="业务组" width="200" />
              <el-table-column prop="members" label="成员数" width="120" />
              <el-table-column label="权限" min-width="300">
                <template #default="scope">
                  <el-checkbox-group v-model="scope.row.permissions">
                    <el-checkbox label="智能对话">智能对话</el-checkbox>
                    <el-checkbox label="Agent使用">Agent使用</el-checkbox>
                    <el-checkbox label="数据查看">数据查看</el-checkbox>
                    <el-checkbox label="文件上传">文件上传</el-checkbox>
                  </el-checkbox-group>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button text size="small" @click="editPermissions(scope.row)">
                    编辑
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="系统配置" name="system">
          <div class="settings-section">
            <h3>系统配置</h3>
            <el-form :model="systemSettings" label-width="200px">
              <el-form-item label="默认模型">
                <el-select v-model="systemSettings.defaultModel" placeholder="选择默认模型">
                  <el-option label="GPT-4" value="gpt-4" />
                  <el-option label="Claude 3" value="claude-3" />
                  <el-option label="Kimi" value="kimi" />
                  <el-option label="鹏宝SFT模型" value="pengbao-sft" />
                </el-select>
              </el-form-item>
              <el-form-item label="最大Token限制">
                <el-input-number
                  v-model="systemSettings.maxTokens"
                  :min="1000"
                  :max="100000"
                  :step="1000"
                />
              </el-form-item>
              <el-form-item label="启用流式输出">
                <el-switch v-model="systemSettings.streamOutput" />
              </el-form-item>
              <el-form-item label="自动保存对话">
                <el-switch v-model="systemSettings.autoSave" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveSystemSettings">保存</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('api')

const apiSettings = ref({
  openai: '',
  claude: '',
  kimi: ''
})

const permissionGroups = ref([
  {
    group: '电商运营组',
    members: 25,
    permissions: ['智能对话', 'Agent使用', '数据查看', '文件上传']
  },
  {
    group: '视觉设计组',
    members: 12,
    permissions: ['智能对话', 'Agent使用', '文件上传']
  },
  {
    group: '售后服务组',
    members: 18,
    permissions: ['智能对话', 'Agent使用']
  }
])

const systemSettings = ref({
  defaultModel: 'gpt-4',
  maxTokens: 4000,
  streamOutput: true,
  autoSave: true
})

const saveApiKeys = () => {
  ElMessage.success('API密钥已保存')
}

const resetApiKeys = () => {
  apiSettings.value = {
    openai: '',
    claude: '',
    kimi: ''
  }
  ElMessage.info('已重置')
}

const editPermissions = (row) => {
  ElMessage.info(`编辑 ${row.group} 的权限`)
}

const saveSystemSettings = () => {
  ElMessage.success('系统配置已保存')
}
</script>

<style scoped lang="scss">
.settings-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F9FAFB;
}

.settings-header {
  padding: 20px 24px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  h1 {
    font-size: 24px;
    font-weight: 600;
    color: #111827;
  }
}

.settings-content {
  flex: 1;
  overflow: hidden;
  padding: 24px;
  background: white;
  margin: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  :deep(.el-tabs) {
    height: 100%;

    .el-tabs__content {
      height: calc(100% - 40px);
      overflow-y: auto;
    }
  }
}

.settings-section {
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 24px;
  }

  .api-tip {
    color: #6B7280;
    font-size: 13px;
    margin-bottom: 16px;
    padding: 8px 0;
  }
}
</style>


<template>
  <div class="prompt-templates">
    <el-tabs v-model="activeCategory">
      <el-tab-pane
        v-for="category in categories"
        :key="category.key"
        :label="category.label"
        :name="category.key"
      >
        <div class="template-grid">
          <div
            v-for="template in getTemplatesByCategory(category.key)"
            :key="template.id"
            class="template-card"
            @click="selectTemplate(template)"
          >
            <div class="template-header">
              <h4>{{ template.title }}</h4>
              <el-tag size="small" :type="template.tagType">{{ template.tag }}</el-tag>
            </div>
            <p class="template-desc">{{ template.description }}</p>
            <div class="template-preview">
              <code>{{ template.prompt.substring(0, 100) }}...</code>
            </div>
            <div class="template-footer">
              <span class="usage-count">使用 {{ template.usageCount }} 次</span>
              <el-button text size="small" @click.stop="selectTemplate(template)">
                使用
              </el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['select'])

const activeCategory = ref('all')

const categories = [
  { key: 'all', label: '全部' },
  { key: 'copywriting', label: '文案生成' },
  { key: 'data', label: '数据分析' },
  { key: 'translation', label: '翻译' },
  { key: 'summary', label: '总结归纳' },
  { key: 'marketing', label: '营销推广' },
  { key: 'customer', label: '客服话术' },
  { key: 'product', label: '产品相关' },
  { key: 'social', label: '社交媒体' },
  { key: 'email', label: '邮件写作' }
]

const templates = [
  // 文案生成
  {
    id: 1,
    category: 'copywriting',
    title: '产品介绍文案',
    description: '将产品参数转换为吸引人的营销文案',
    prompt: '请根据以下产品参数，生成一份符合三星品牌调性的产品介绍文案，要求突出产品亮点，语言简洁有力，体现科技感和品质感。',
    tag: '热门',
    tagType: 'danger',
    usageCount: 1234
  },
  {
    id: 2,
    category: 'copywriting',
    title: '小红书文案',
    description: '一键生成小红书风格的产品推广文案',
    prompt: '请帮我将以下产品信息转换为小红书风格的推广文案，要求：1. 使用emoji表情增加趣味性 2. 分段清晰，每段不超过3行 3. 突出核心卖点 4. 语言轻松活泼，符合年轻用户习惯',
    tag: '推荐',
    tagType: 'warning',
    usageCount: 856
  },
  {
    id: 3,
    category: 'copywriting',
    title: '微博文案',
    description: '生成适合微博平台的短文案',
    prompt: '请根据以下内容生成一条微博文案，要求：1. 控制在140字以内 2. 包含相关话题标签 3. 语言简洁有力 4. 适合转发和互动',
    tag: '常用',
    tagType: 'success',
    usageCount: 642
  },
  {
    id: 4,
    category: 'copywriting',
    title: '抖音短视频脚本',
    description: '生成抖音风格的短视频脚本',
    prompt: '请为以下产品/内容创作一个抖音短视频脚本，包括：1. 开场3秒抓人眼球的hook 2. 产品/内容介绍 3. 互动引导 4. 时长控制在15-30秒',
    tag: '实用',
    tagType: 'info',
    usageCount: 523
  },
  // 数据分析
  {
    id: 5,
    category: 'data',
    title: '数据趋势分析',
    description: '分析数据表格并生成趋势报告',
    prompt: '请分析以下数据表格，提取关键趋势和洞察，并生成一份简洁的数据分析报告，包括：1. 数据概览 2. 关键发现 3. 趋势预测 4. 行动建议',
    tag: '常用',
    tagType: 'success',
    usageCount: 642
  },
  {
    id: 6,
    category: 'data',
    title: '销售数据分析',
    description: '深度分析销售数据，找出问题和机会',
    prompt: '请对以下销售数据进行深度分析：1. 各产品/渠道的销售表现 2. 同比和环比变化 3. 异常数据识别 4. 改进建议和机会点',
    tag: '专业',
    tagType: 'warning',
    usageCount: 456
  },
  {
    id: 7,
    category: 'data',
    title: '用户行为分析',
    description: '分析用户行为数据，生成用户画像',
    prompt: '请根据以下用户行为数据，生成用户画像分析报告：1. 用户特征总结 2. 行为模式分析 3. 偏好识别 4. 个性化推荐建议',
    tag: '实用',
    tagType: 'info',
    usageCount: 389
  },
  // 翻译
  {
    id: 8,
    category: 'translation',
    title: '中英互译',
    description: '高质量的中英文翻译',
    prompt: '请将以下内容进行中英文翻译，要求：1. 保持原意准确 2. 语言自然流畅 3. 符合目标语言习惯 4. 专业术语准确',
    tag: '基础',
    tagType: 'info',
    usageCount: 2341
  },
  {
    id: 9,
    category: 'translation',
    title: '技术文档翻译',
    description: '专业的技术文档翻译',
    prompt: '请将以下技术文档进行翻译，要求：1. 保持技术术语的准确性 2. 符合行业标准 3. 格式保持一致 4. 专业且易读',
    tag: '专业',
    tagType: 'warning',
    usageCount: 567
  },
  // 总结归纳
  {
    id: 10,
    category: 'summary',
    title: '会议纪要',
    description: '将会议内容整理为结构化纪要',
    prompt: '请将以下会议内容整理为结构化的会议纪要，包括：1. 会议主题和时间 2. 参会人员 3. 主要讨论点 4. 决策事项 5. 待办事项和负责人',
    tag: '实用',
    tagType: 'success',
    usageCount: 523
  },
  {
    id: 11,
    category: 'summary',
    title: '长文档摘要',
    description: '将长文档提炼为简洁摘要',
    prompt: '请将以下长文档提炼为简洁摘要，要求：1. 保留核心信息 2. 结构清晰 3. 控制在原文档20%的篇幅 4. 突出关键要点',
    tag: '常用',
    tagType: 'success',
    usageCount: 789
  },
  // 营销推广
  {
    id: 12,
    category: 'marketing',
    title: '促销活动方案',
    description: '生成完整的促销活动方案',
    prompt: '请为以下产品/活动生成一份促销活动方案，包括：1. 活动主题和定位 2. 目标受众 3. 活动策略 4. 执行计划 5. 预期效果',
    tag: '热门',
    tagType: 'danger',
    usageCount: 912
  },
  {
    id: 13,
    category: 'marketing',
    title: '品牌故事创作',
    description: '创作有感染力的品牌故事',
    prompt: '请为以下品牌创作一个品牌故事，要求：1. 体现品牌价值观 2. 有情感共鸣 3. 语言生动有画面感 4. 适合传播和分享',
    tag: '推荐',
    tagType: 'warning',
    usageCount: 678
  },
  {
    id: 14,
    category: 'marketing',
    title: '竞品分析报告',
    description: '生成竞品分析报告',
    prompt: '请对以下竞品进行深度分析，生成分析报告：1. 产品功能对比 2. 价格策略分析 3. 市场定位 4. 优劣势分析 5. 机会和建议',
    tag: '专业',
    tagType: 'info',
    usageCount: 445
  },
  // 客服话术
  {
    id: 15,
    category: 'customer',
    title: '客服回复话术',
    description: '根据客户问题生成专业回复',
    prompt: '请根据以下客户问题，生成专业的客服回复话术，要求：1. 态度友好专业 2. 解决问题明确 3. 语言简洁清晰 4. 体现品牌服务标准',
    tag: '常用',
    tagType: 'success',
    usageCount: 1234
  },
  {
    id: 16,
    category: 'customer',
    title: '投诉处理话术',
    description: '生成投诉处理的标准话术',
    prompt: '请为以下客户投诉情况生成处理话术：1. 表达理解和歉意 2. 说明处理方案 3. 提供补偿措施 4. 确保客户满意',
    tag: '实用',
    tagType: 'warning',
    usageCount: 567
  },
  // 产品相关
  {
    id: 17,
    category: 'product',
    title: '产品需求文档',
    description: '将需求整理为产品需求文档',
    prompt: '请将以下需求整理为产品需求文档（PRD），包括：1. 需求背景 2. 目标用户 3. 功能需求 4. 交互设计要点 5. 验收标准',
    tag: '专业',
    tagType: 'info',
    usageCount: 334
  },
  {
    id: 18,
    category: 'product',
    title: '产品使用说明',
    description: '生成清晰的产品使用说明',
    prompt: '请为以下产品生成使用说明文档，要求：1. 步骤清晰易懂 2. 配图说明位置 3. 常见问题解答 4. 注意事项提醒',
    tag: '实用',
    tagType: 'success',
    usageCount: 556
  },
  // 社交媒体
  {
    id: 19,
    category: 'social',
    title: '朋友圈文案',
    description: '生成适合朋友圈的文案',
    prompt: '请为以下内容生成朋友圈文案，要求：1. 语言自然真实 2. 有个人色彩 3. 适合互动 4. 长度适中',
    tag: '常用',
    tagType: 'success',
    usageCount: 889
  },
  {
    id: 20,
    category: 'social',
    title: '微信公众号文章大纲',
    description: '生成公众号文章大纲',
    prompt: '请为以下主题生成微信公众号文章大纲，包括：1. 吸引人的标题 2. 文章结构 3. 每个部分的要点 4. 结尾总结',
    tag: '推荐',
    tagType: 'warning',
    usageCount: 667
  },
  // 邮件写作
  {
    id: 21,
    category: 'email',
    title: '商务邮件',
    description: '生成专业的商务邮件',
    prompt: '请根据以下场景生成商务邮件，要求：1. 格式规范 2. 语言专业礼貌 3. 目的明确 4. 包含必要的附件说明',
    tag: '常用',
    tagType: 'success',
    usageCount: 1123
  },
  {
    id: 22,
    category: 'email',
    title: '营销邮件',
    description: '生成营销推广邮件',
    prompt: '请生成一份营销推广邮件，要求：1. 主题吸引人 2. 内容有说服力 3. 包含明确的行动号召 4. 符合邮件营销规范',
    tag: '实用',
    tagType: 'info',
    usageCount: 445
  }
]

const getTemplatesByCategory = (category) => {
  if (category === 'all') return templates
  return templates.filter(t => t.category === category)
}

const selectTemplate = (template) => {
  emit('select', template.prompt)
}
</script>

<style scoped lang="scss">
.prompt-templates {
  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    padding: 16px 0;
  }

  .template-card {
    padding: 16px;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    background: white;

    &:hover {
      border-color: #1428A0;
      box-shadow: 0 4px 12px rgba(20, 40, 160, 0.1);
      transform: translateY(-2px);
    }

    .template-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      h4 {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
      }
    }

    .template-desc {
      font-size: 14px;
      color: #6B7280;
      margin-bottom: 12px;
    }

    .template-preview {
      background: #F9FAFB;
      padding: 8px;
      border-radius: 4px;
      margin-bottom: 12px;

      code {
        font-size: 12px;
        color: #4B5563;
      }
    }

    .template-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .usage-count {
        font-size: 12px;
        color: #9CA3AF;
      }
    }
  }
}
</style>


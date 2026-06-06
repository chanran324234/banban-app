# 伴办

伴办是一个免费开源的 AI 陪伴 + 工作流自动化 App。它面向正在推进项目的人，帮助用户把想法、情绪、任务和复盘收束成下一步行动。

## 第一版能力

- 今日推进看板
- DeepSeek V4 聊天
- 对话转任务
- 工作流模板
- 长期记忆管理
- 用户自带 DeepSeek API Key
- 本地持久化任务、记忆和聊天记录
- DeepSeek 结构化输出，自动沉淀任务和记忆
- 本地数据导出
- 本地数据清空
- 隐私政策、用户协议、AI 内容说明草案
- 每日计划、晚间复盘和项目拆解 AI 工作流
- 任务提醒、早间计划提醒、晚间复盘提醒
- App 图标、启动页和应用商城截图草案
- 首次使用 checklist 和 setup 状态持久化

## 本地运行

```bash
npm install
npm run web
```

打开 Expo 输出的本地地址即可预览 Web 版。移动端可以用 Expo Go 扫码调试。

提交前检查：

```bash
npm run check
```

## DeepSeek Key

本项目不内置统一模型密钥。用户需要在 App 设置页填入自己的 DeepSeek API Key。

- iOS 使用 Keychain 保存。
- Android 使用系统安全存储保存。
- Web 开发预览使用 localStorage 兜底。

聊天接口会要求模型返回结构化 JSON：

```json
{
  "reply": "给用户的自然语言回复",
  "tasks": [
    {
      "title": "待办标题",
      "description": "待办说明"
    }
  ],
  "memories": [
    {
      "title": "记忆标题",
      "content": "值得长期记住的信息"
    }
  ]
}
```

前端会把 `tasks` 和 `memories` 自动写入本地数据。

## AI 工作流

工作流页当前支持：

- 每日计划：读取任务、记忆和最近聊天，生成三个重点、时间块和风险提醒。
- 晚间复盘：读取任务状态，生成完成、卡点和明天第一步。
- 项目拆解：读取项目目标、任务、记忆和最近聊天，生成目标定义、里程碑、风险和下一批任务。

如果用户已配置 DeepSeek Key，工作流会调用 `deepseek-v4-pro`。如果没有 Key，则使用本地兜底结果，方便离线预览和开发。

工作流结果可以：

- 写入聊天记录。
- 把建议任务加入任务页。

## 数据控制

设置页支持：

- 导出任务、记忆和聊天记录为 JSON。
- 清空任务、记忆、聊天记录和 DeepSeek API Key。
- 查看隐私政策、用户协议和 AI 内容说明。
- 设置任务提醒、每天 9 点计划提醒、每天 21 点复盘提醒。

首页会显示首次使用 checklist，帮助用户完成 DeepSeek Key、第一批任务和第一次工作流。

正式上架前，请把 `docs/` 里的合规文档补齐开发者联系邮箱、真实开源仓库地址和应用商城要求的固定链接。

## 上架素材

项目内已生成基础素材：

- `assets/icon.png`
- `assets/adaptive-icon.png`
- `assets/splash.png`
- `assets/favicon.png`
- `docs/store-screenshots/01-home.png`
- `docs/store-screenshots/02-workflows.png`
- `docs/store-screenshots/03-settings.png`
- `docs/app-store-listing.md`
- `docs/device-test-plan.md`
- `docs/release-checklist.md`
- `docs/github-publish.md`

重新生成图标和启动页：

```bash
npm run assets
```

## 真机和构建

项目包含基础 `eas.json`：

- `development`：开发构建
- `preview`：内部测试
- `production`：生产构建

真机测试前请阅读：

- `docs/device-test-plan.md`
- `docs/release-checklist.md`

## 开源协作

- `CONTRIBUTING.md`：贡献流程
- `SECURITY.md`：安全策略
- `SUPPORT.md`：支持范围
- `ROADMAP.md`：路线图
- `CHANGELOG.md`：版本记录
- `.github/ISSUE_TEMPLATE/`：Issue 模板
- `.github/PULL_REQUEST_TEMPLATE.md`：PR 模板
- `.github/workflows/check.yml`：PR / main 分支基础检查

## 开源协议

代码使用 Apache-2.0 协议。

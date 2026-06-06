# 贡献指南

欢迎贡献伴办。第一阶段优先接收这些方向：

- DeepSeek 调用稳定性
- 本地记忆和任务体验
- 移动端界面细节
- App Store / Google Play 合规材料
- 多语言文案

## 开发流程

1. Fork 仓库。
2. 新建功能分支。
3. 提交前运行 `npm run check`。
4. 发起 Pull Request，并说明改动动机和测试方式。

请不要提交 API Key、测试账号密码或任何私人数据。

## 本地检查

```bash
npm run check
```

这个命令会运行 TypeScript 检查，并确认 Expo 依赖版本匹配当前 SDK。

## 安全和隐私

- 不要提交 `.env` 文件。
- 不要提交 DeepSeek API Key。
- 不要把真实聊天记录、任务、记忆或导出的 JSON 放进 Issue 或 PR。
- 任何涉及 API Key 存储、本地数据清空、数据导出、通知权限的改动，都需要在 PR 里说明测试方式。

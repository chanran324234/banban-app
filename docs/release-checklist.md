# 伴办发布前检查表

更新日期：2026-06-06

## 代码

- `npm run typecheck` 通过。
- `npx expo install --check` 通过。
- `npx expo config --type public` 通过。
- 没有提交 `.env` 或 API Key。
- `README.md`、`LICENSE`、`CONTRIBUTING.md` 存在。
- GitHub Actions `Check` 工作流已启用。

## 配置

- iOS bundle identifier 已确认。
- Android package 已确认。
- App 图标已配置。
- 启动页已配置。
- Android notification icon 已配置。
- Android `POST_NOTIFICATIONS` 权限已配置。
- EAS `development`、`preview`、`production` profile 已配置。

## 合规

- 隐私政策已补真实 URL。
- 用户协议已补真实 URL。
- AI 内容说明已补真实 URL 或在 App 内可访问。
- 设置页支持删除 DeepSeek Key。
- 设置页支持导出本地数据。
- 设置页支持清空本地数据。
- 审核备注说明应用不提供成人陪聊、陌生人社交或虚拟恋人服务。

## 素材

- App Store 截图使用真机或模拟器重新导出。
- Google Play 截图使用真机或模拟器重新导出。
- 应用名称、副标题、长描述、关键词已确认。
- 支持邮箱已确认。
- 开源仓库 URL 已确认。
- GitHub Security Advisory URL 已从占位地址替换为真实仓库地址。

## 真机

- iOS 真机测试通过。
- Android 真机测试通过。
- 通知权限测试通过。
- DeepSeek Key 安全存储测试通过。
- 离线 / 无 Key 本地兜底测试通过。

## 构建命令

开发构建：

```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

内测构建：

```bash
eas build --profile preview --platform android
eas build --profile preview --platform ios
```

生产构建：

```bash
eas build --profile production --platform all
```

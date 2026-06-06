# 伴办应用商城提交指南

更新日期：2026-06-06

这份清单用于把当前开源 MVP 推进到 App Store / Google Play 内测或正式提交。

## 当前状态

- GitHub 仓库：https://github.com/chanran324234/banban-app
- Release：https://github.com/chanran324234/banban-app/releases/tag/v0.1.0
- App 版本：0.1.1
- Bundle ID / Android package：`app.banban.opensource`
- 模型：用户自带 DeepSeek API Key，应用不内置共享密钥。
- 数据：任务、记忆、聊天记录默认本地保存。
- 已配置：Expo app config、EAS profiles、图标、启动页、基础截图、隐私政策、用户协议、AI 内容说明、设备测试计划。
- 没有 Android 真机时，可以先使用 Web 预览和 GitHub Pages 验证基础流程。

## 提交前必须补齐

- 真实公开支持邮箱。
- App Store Connect 开发者账号。
- Google Play Console 开发者账号。
- Expo/EAS 登录状态。
- iOS 真机或模拟器截图。
- Android 真机或模拟器截图。
- 真机通知测试结果。
- 生产环境隐私政策固定 URL。

## EAS 登录和检查

```bash
npm run eas:login
npm run eas:whoami
npm run check
```

## Web 预览

本地预览：

```bash
npm run web
```

静态导出：

```bash
npm run web:export
```

`main` 分支推送后，GitHub Actions 会自动把 `dist/` 部署到 GitHub Pages。Web 版用于早期体验和分享，不替代 iOS / Android 真机审核测试。

如果首次把项目连接到 Expo，请运行：

```bash
npx eas init
```

完成后 `app.json` 通常会出现 `extra.eas.projectId`，请提交该变更。

## 内测构建

Android APK 内测包：

```bash
npm run build:preview:android
```

iOS 开发构建可从 EAS 交互流程里选择设备和证书。没有 Apple Developer Program 时，只能做 Expo Go / 模拟器层面的预览，不能提交 App Store。

## 生产构建

Android：

```bash
npm run build:production:android
```

iOS：

```bash
npm run build:production:ios
```

生产构建会触发 EAS 证书、keystore、Apple Team、bundle identifier、version code/build number 等交互配置。不要把私钥、证书密码或账号密码写进仓库。

## 商店提交

Android：

```bash
npm run submit:android
```

iOS：

```bash
npm run submit:ios
```

提交时使用 `docs/app-store-listing.md`、`docs/privacy-policy.md`、`docs/terms.md`、`docs/ai-content-policy.md` 和 `docs/store-screenshots/` 作为基础材料。

## 审核备注重点

- 伴办是效率工具，不是成人陪聊、陌生人社交或虚拟恋人服务。
- 用户自行配置 DeepSeek API Key。
- 应用不托管用户账号，不提供云同步。
- 用户可以删除 Key、导出本地数据、清空本地数据。
- AI 输出用于计划、任务拆解、复盘和工作流辅助。

# GitHub 发布步骤

更新日期：2026-06-06

## 本地仓库

当前项目可以作为 GitHub 开源仓库发布。

建议仓库名：

```text
banban-app
```

建议可见性：

```text
Public
```

## 发布前替换占位

创建真实仓库后，替换这些占位：

- `SECURITY.md` 中的 `https://github.com/your-org/banban-app/security/advisories/new`
- `.github/ISSUE_TEMPLATE/config.yml` 中的 `https://github.com/your-org/banban-app/security/advisories/new`
- `docs/app-store-listing.md` 中的开源仓库 URL
- `docs/privacy-policy.md` 中的开发者联系邮箱和仓库地址

## 使用 GitHub CLI

如果已经登录 `gh`：

```bash
gh repo create banban-app --public --source=. --remote=origin --push
```

## 手动创建远程仓库

1. 在 GitHub 创建 public 仓库 `banban-app`。
2. 回到本地项目目录。
3. 添加远程地址。

```bash
git remote add origin git@github.com:<your-org-or-user>/banban-app.git
git push -u origin main
```

## 发布后检查

- GitHub Actions `Check` 是否通过。
- README 图片和链接是否可访问。
- Security Advisory 地址是否已替换。
- App Store / Google Play 文案里的仓库地址是否已替换。
- 不要公开任何 DeepSeek API Key、测试账号密码、真实聊天记录或导出的个人数据。

## 一日清单（One Day Todos）

用于演示 Google OAuth 登录流程的静态站点。仓库会按照功能拆分目录，目前包含：

- `index.html`：项目主页，介绍场景、提供隐私权政策链接。
- `privacy.html`：隐私权政策，部署在与主页同域（`github.io`）下。
- `todos/`：一日清单示例应用，演示 Google 身份服务登录 + 浏览器本地待办。

### 本地预览

```bash
npx serve .
```

或通过任意静态服务器托管根目录。

### 配置 Google OAuth Client ID

1. 在 Google Cloud Console 创建网页应用的 OAuth 客户端。
2. 将 `todos/config.js` 中的 `googleClientId` 替换成真实 ID。
3. 将 `https://asjqkkkk.github.io/auth/todos/`（或你的 GitHub Pages 域名）添加到「已获授权的 JavaScript 来源」。

### 部署

仓库包含 GitHub Actions 工作流，会在 `main` 分支变更后自动构建并部署静态文件到 GitHub Pages。*** End Patch

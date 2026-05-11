# 游戏邀请 Netlify 版

这个版本不使用 Google Sheet，不使用 Google Apps Script。

## 功能

- 首页填写名字
- 参加：保存记录后跳转到 https://revelation.framer.ai/
- 不参加：保存记录后显示“谢谢你，希望下次见到你。”
- 我在想想：填写联系方式后保存
- /admin 后台：显示人数、具体时间、名单、联系方式
- 后台可一键清空记录
- 默认后台密码：0712

## 部署方法

推荐用 GitHub + Netlify：

1. 把这个文件夹上传到一个 GitHub 仓库。
2. 打开 Netlify。
3. Add new site → Import an existing project。
4. 选择这个 GitHub 仓库。
5. Build command 留空。
6. Publish directory 留空或填 `.`。
7. Deploy。
8. 发布完成后打开 Netlify 给的网址。

## 后台

打开：

`你的Netlify网址/admin`

默认密码：

`0712`

## 修改后台密码

在 Netlify 后台设置环境变量：

- Key: `ADMIN_PASSWORD`
- Value: 你想要的密码

设置后重新 Deploy。

## 数据存在哪里

数据保存在 Netlify Blobs，项目里没有 Google 依赖。

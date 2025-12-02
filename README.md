```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Lint with [ESLint](https://eslint.org/)

```
遇到的问题：
1.homePage里list只能直接赋值，用json-server从db.json中获取数据后，id全变成了字符串  ----解决：不用json-server,改成用node写后端就没有问题了
2.响应拦截器好像不起作用，身份认证失败时没有进入拦截器，【待改】  --已解决，原因：el-uploads文件的发送是直接走原生XML的,没有经过拦截器,使用http-request取复用拦截器就好
```

```
待优化：
1.菜单面板扩展收缩时有点卡顿
2.后续在首页增加登录跳转按钮  ---已完成
3.要增加用户注销功能，注销用户的同时删除该用户所有文章
4.在用户面显示该用户发布过的文章，可以进行修改和删除  --已完成
6.修复图片校验功能  --已完成
7.token无感刷新 --已完成
8.大文件上传  --已完成
9.管理员可观察用户使用占比--echars  --已完成
10.使用webWorker优化计算  --已完成
11.加一个文件拖拽上传
12.加一个虚拟列表
```

# vue_frame

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

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
1.并没有实现无限滚动，没搞分页，只是普通的图片懒加载
```

```
遇到的问题：
1.homePage里list只能直接赋值，用json-server从db.json中获取数据后，id全变成了字符串  ----解决：不用json-server,改成用node写后端就没有问题了
2.响应式布局问题，窗口放大缩小页面会乱
3.用上ts后经常会有很多类型报错，有些复杂的难看懂
4.想让http在返回时就指定类型，但是不清楚怎么封装，有空在改吧
5.响应拦截器好像不起作用，身份认证失败时没有进入拦截器，【待改】  --已解决，原因：el-uploads文件的发送是直接走原生XML的,没有经过拦截器,使用http-request取复用拦截器就好
```

```
待优化：
1.菜单面板扩展收缩时有卡顿
2.后续在首页增加登录跳转按钮  ---已完成
3.要增加用户注销功能，注销用户的同时删除该用户所有文章
4.在用户面显示该用户发布过的文章，可以进行修改和删除  --已完成
6.修复图片校验功能  --已完成
7.token无感刷新
8.大文件上传  --已完成
9.管理员可观察用户使用占比--echars
```

```
已实现功能：
文章用户添加，登录注册,搜索
```

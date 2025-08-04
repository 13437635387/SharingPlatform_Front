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
```

8.4

```
login的tab有问题
```

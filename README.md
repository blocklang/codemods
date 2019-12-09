# codemods

[![npm version](https://badge.fury.io/js/codemods.svg)](https://badge.fury.io/js/codemods)
[![Build Status](https://travis-ci.org/blocklang/codemods.svg?branch=master)](https://travis-ci.org/blocklang/codemods)
[![codecov](https://codecov.io/gh/blocklang/codemods/branch/master/graph/badge.svg)](https://codecov.io/gh/blocklang/codemods)

[Block Lang](https://blocklang.com) 客户端代码生成工具。

## 如何使用

全局安装：

```sh
npm install codemods -g
```

生成 dojo app：

```sh
codemods --library dojo --modelDir ./your/model/dir
```

## 往 npm 发布

使用以下命令导航到 src 文件夹下

```sh
cd dist/src
```

然后使用 `npm login` 和 `npm publish` 命令发布。

## 运行测试

```sh
npx intern
```

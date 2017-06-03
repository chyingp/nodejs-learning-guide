## N-API简介

Node.js 8.0 在2017年6月份发布，升级的特性中，包含了N-API。编写过或者使用过 node扩展的同学，不少都遇到过升级node版本，node扩展编译失败的情况。因为node扩展严重依赖于V8暴露的API，而node不同版本依赖的V8版本可能不同，一旦升级node版本，原先运行正常的node扩展就编译失败了。

这种情况对node生态圈无疑是不利的，N-API的引入正是试图改善这种情况的一种尝试。它跟底层JS引擎无关，只要N-API暴露的API足够稳定，那么node扩展的编写者就不用过分担忧node的升级问题。

## 如何使用N-API

先强调一点，N-API并不是对原有node扩展实现方式的替代，它只是提供了一系列底层无关的API，来帮助开发者编写跨版本的node扩展。至于如何编写、编译、使用扩展，跟原来的差不多。

本文会从一个超级简单的例子，简单介绍N-API的使用，包括环境准备、编写扩展、编译、运行几个步骤。

>备注：当前N-API还处于试验阶段，官方文档提供的例子都是有问题的，如用于生产环境需格外谨慎。

## 1、环境准备

首先，N-API是8.0版本引入的，首先确保本地安装了8.0版本。笔者用的是`nvm`，读者可自行选择安装方式。

```bash
nvm i 8.0
nvm use 8.0
```

然后，安装`node-gyp`，编译扩展会用到。

```bash
npm install -g node-gyp
```

创建项目目录，并初始化`package.json`。

```bash
mkdir hello & cd hello # 目录名随便起
npm init -f
```


## 2、编写扩展

创建`hello.cc`作为扩展的源文件。

```bash
mkdir src
touch src/hello.cc
```

编辑`hello.cc`，输入如下内容。

```c
#include <node_api.h>

// 实际暴露的方法，这里只是简单返回一个字符串
napi_value HelloMethod (napi_env env, napi_callback_info info) {
    napi_value world;
    napi_create_string_utf8(env, "world", 5, &world);
    return world;
}

// 扩展的初始化方法，其中 
// env：环境变量
// exports、module：node模块中对外暴露的对象
void Init (napi_env env, napi_value exports, napi_value module, void* priv) {
    // napi_property_descriptor 为结构体，作用是描述扩展暴露的 属性/方法 的描述
    napi_property_descriptor desc = { "hello", 0, HelloMethod, 0, 0, 0, napi_default, 0 };
    napi_define_properties(env, exports, 1, &desc);  // 定义暴露的方法
}

NAPI_MODULE(hello, Init);  // 注册扩展，扩展名叫做hello，Init为扩展的初始化方法
```

## 3、编译扩展

首先，创建编译描述文件`binding.gyp`。

```json
{
  "targets": [
    {
      "target_name": "hello",
      "sources": [ "./src/hello.cc" ]
    }
  ]
}
```

然后，运行如下命令进行编译。

```bash
node-gyp rebuild
```

## 4、调用扩展

未方便调用扩展，先安装`bindings`。

```bash
npm install --save bindings
```

然后，创建`app.js`，调用刚编译的扩展。

```javascript
var addon = require('bindings')('hello');

console.log( addon.hello() );  // world
```

运行代码，由于N-API当前尚处于Experimental阶段，记得加上`--napi-modules`标记。

```bash
node --napi-modules app.js
```

输出如下

```bash
{"path":"/data/github/abi-stable-node-addon-examples/1_hello_world/napi/build/Release/hello.node"}
world
(node:6500) Warning: N-API is an experimental feature and could change at any time.
```

## 相关链接

N-API：https://nodejs.org/api/n-api.html

C++ Addons：https://nodejs.org/api/addons.html
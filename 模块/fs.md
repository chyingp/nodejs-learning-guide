## 文件读取

### 普通读取

同步读取

```javascript
var fs = require('fs');
var data;

try{
    data = fs.readFileSync('./fileForRead.txt', 'utf8');
    console.log('文件内容: ' + data);
}catch(err){
    console.error('读取文件出错: ' + err.message);
}
```

输出如下：

```powershell
/usr/local/bin/node readFileSync.js
文件内容: hello world
```

异步读取

```javascript
var fs = require('fs');

fs.readFile('./fileForRead.txt', 'utf8', function(err, data){
    if(err){
        return console.error('读取文件出错: ' + err.message);
    }
    console.log('文件内容: ' + data);
});
```

输出如下

```powershell
/usr/local/bin/node readFile.js
文件内容: hello world
```

### 通过文件流读取

适合读取大文件

```javascript
var fs = require('fs');
var readStream = fs.createReadStream('./fileForRead.txt', 'utf8');

readStream
    .on('data', function(chunk) {
        console.log('读取数据: ' + chunk);
    })
    .on('error', function(err){
        console.log('出错: ' + err.message);
    })
    .on('end', function(){  // 没有数据了
        console.log('没有数据了');
    })
    .on('close', function(){  // 已经关闭，不会再有事件抛出
        console.log('已经关闭');
    });
```

输出如下

```powershell
/usr/local/bin/node createReadStream.js
读取数据: hello world
没有数据了
已经关闭
``` 

## 文件写入

备注：以下代码，如果文件不存在，则创建文件；如果文件存在，则覆盖文件内容；

异步写入

```javascript
var fs = require('fs');

fs.writeFile('./fileForWrite.txt', 'hello world', 'utf8', function(err){
    if(err) throw err;
    console.log('文件写入成功');
});
```

同步写入

```javascript
var fs = require('fs');

try{
    fs.writeFileSync('./fileForWrite1.txt', 'hello world', 'utf8');
    console.log('文件写入成功');
}catch(err){
    throw err;
}
```

### 通过文件流写入

```javascript
var fs = require('fs');
var writeStream = fs.createWriteStream('./fileForWrite1.txt', 'utf8');

writeStream
    .on('close', function(){  // 已经关闭，不会再有事件抛出
        console.log('已经关闭');
    });

writeStream.write('hello');
writeStream.write('world');
writeStream.end('');
```

### 相对底层的接口

>fs.write(fd, buffer, offset, length[, position], callback)
>fs.write(fd, data[, position[, encoding]], callback)
>fs.writeSync(fd, buffer, offset, length[, position])
>fs.writeSync(fd, data[, position[, encoding]])

* fd：写入的文件句柄。
* buffer：写入的内容。
* offset：将buffer从offset位置开始，长度为length的内容写入。
* length：写入的buffer内容的长度。
* position：从打开文件的position处写入。
* callback：参数为 `(err, written, buffer)`。`written`表示有xx字节的buffer被写入。

备注：`fs.write(fd, buffer, offset, length[, position], callback)`跟`fs.write(fd, data[, position[, encoding]], callback)`的区别在于：后面的只能把所有的data写入，而前面的可以写入指定的data子串？

## 文件是否存在

`fs.exists()`已经是`deprecated`状态，现在可以通过下面代码判断文件是否存在。

```javascript
var fs = require('fs');

fs.access('./fileForRead.txt', function(err){
    if(err) throw err;
    console.log('fileForRead.txt存在');
});

fs.access('./fileForRead2.txt', function(err){
    if(err) throw err;
    console.log('fileForRead2.txt存在');
});
```

`fs.access()`除了判断文件是否存在（默认模式），还可以用来判断文件的权限。

备忘：`fs.constants.F_OK`等常量无法获取（node v6.1，mac 10.11.4下，`fs.constants`是`undefined`）

## 创建目录

异步版本（如果目录已存在，会报错）

```javascript
var fs = require('fs');

fs.mkdir('./hello', function(err){
    if(err) throw err;
    console.log('目录创建成功');
});
```

同步版本

```javascript
var fs = require('fs');

fs.mkdirSync('./hello');
```

## 删除文件

```javascript
var fs = require('fs');

fs.unlink('./fileForUnlink.txt', function(err){
    if(err) throw err;
    console.log('文件删除成功');
});
```

```javascript
var fs = require('fs');

fs.unlinkSync('./fileForUnlink.txt');
```

## 创建目录

```javascript
// fs.mkdir(path[, mode], callback)
var fs = require('fs');

fs.mkdir('sub', function(err){
    if(err) throw err;
    console.log('创建目录成功');
});
```

```javascript
// fs.mkdirSync(path[, mode])
var fs = require('fs');

try{
    fs.mkdirSync('hello');
    console.log('创建目录成功');
}catch(e){
    throw e;
}
```

## 遍历目录

同步版本，注意：`fs.readdirSync()`只会读一层，所以需要判断文件类型是否目录，如果是，则进行递归遍历。

```javascript
// fs.readdirSync(path[, options])

var fs = require('fs');
var path = require('path');

var getFilesInDir = function(dir){

    var results = [ path.resolve(dir) ];
    var files = fs.readdirSync(dir, 'utf8');

    files.forEach(function(file){

        file = path.resolve(dir, file);

        var stats = fs.statSync(file);

        if(stats.isFile()){
            results.push(file);
        }else if(stats.isDirectory()){
            results = results.concat( getFilesInDir(file) );
        }
    });

    return results;
};

var files = getFilesInDir('../');
console.log(files);
```

异步版本：（TODO）

```javascript

```

## 文件重命名

```javascript
// fs.rename(oldPath, newPath, callback)
var fs = require('fs');

fs.rename('./hello', './world', function(err){
    if(err) throw err;
    console.log('重命名成功');
});
```

```javascript
fs.renameSync(oldPath, newPath)
var fs = require('fs');

fs.renameSync('./world', './hello');
```

## 监听文件修改

`fs.watch()`比`fs.watchFile()`高效很多（why）

### fs.watchFile()

实现原理：轮询。每隔一段时间检查文件是否发生变化。所以在不同平台上表现基本是一致的。

```javascript
var fs = require('fs');

var options = {
    persistent: true,  // 默认就是true
    interval: 2000  // 多久检查一次
};

// curr, prev 是被监听文件的状态, fs.Stat实例
// 可以通过 fs.unwatch() 移除监听
fs.watchFile('./fileForWatch.txt', options, function(curr, prev){
    console.log('修改时间为: ' + curr.mtime);
});
```

修改`fileForWatch.txt`，可以看到控制台下打印出日志

```powershell
/usr/local/bin/node watchFile.js
修改时间为: Sat Jul 16 2016 19:03:57 GMT+0800 (CST)
修改时间为: Sat Jul 16 2016 19:04:05 GMT+0800 (CST)
```

为啥子？莫非单纯访问文件也会触发回调？

>If you want to be notified when the file was modified, not just accessed, you need to compare curr.mtime and prev.mtime.

在 **v0.10** 之后的改动。如果监听的文件不存在，会怎么处理。如下

>Note: when an fs.watchFile operation results in an ENOENT error, it will invoke the listener once, with all the fields zeroed (or, for dates, the Unix Epoch). In Windows, blksize and blocks fields will be undefined, instead of zero. If the file is created later on, the listener will be called again, with the latest stat objects. This is a change in functionality since v0.10.

### fs.watch()

>fs.watch(filename[, options][, listener])
>fs.unwatchFile(filename[, listener])

这接口非常不靠谱（当前测试用的v6.1.0），参考 https://github.com/nodejs/node/issues/7420

>fs.watch(filename[, options][, listener])#

注意：`fs.watch()`这个接口并不是在所有的平台行为都一致，并且在某些情况下是不可用的。`recursive`这个选项只在`mac`、`windows`下可用。

问题来了：

1. 不一致的表现。
2. 不可用的场景。
3. linux上要recursive咋整。

>The fs.watch API is not 100% consistent across platforms, and is unavailable in some situations.
>The recursive option is only supported on OS X and Windows.

备忘，不可用的场景。比如网络文件系统等。

>For example, watching files or directories can be unreliable, and in some cases impossible, on network file systems (NFS, SMB, etc), or host file systems when using virtualization software such as Vagrant, Docker, etc.

另外，listener回调有两个参数，分别是`event`、`filename`。其中，`filename`仅在linux、windows上会提供，并且不是100%提供，所以，尽量不要依赖`filename`。

在linux、osx上，`fs.watch()`监听的是inode。如果文件被删除，并重新创建，那么删除事件会触发。同时，`fs.watch()`监听的还是最初的inode。（API的设计就是这样的）

结论：怎么看都感觉这个API很不靠谱，虽然性能比fs.watchFile()要高很多。

先来个例子，在osx下测试了一下，简直令人绝望。。。无论是创建、修改、删除文件，`evt`都是`rename`。。。

```javascript
var fs = require('fs');

var options = {
    persistent: true,
    recursive: true,
    encoding: 'utf8'
};

fs.watch('../', options, function(event, filename){
    console.log('触发事件:' + event);
    if(filename){
        console.log('文件名是: ' + filename);
    }else{
        console.log('文件名是没有提供');
    }
});
```

修改下`fileForWatch.txt`，看到下面输出。。。感觉打死也不想用这个API。。。

贴下环境：osx 10.11.4, node v6.1.0。

```powershell
触发事件:rename
文件名是: fs/fileForWatch.txt___jb_bak___
触发事件:rename
文件名是: fs/fileForWatch.txt
触发事件:rename
文件名是: fs/fileForWatch.txt___jb_old___
触发事件:rename
文件名是: .idea/workspace.xml___jb_bak___
触发事件:rename
文件名是: .idea/workspace.xml
触发事件:rename
文件名是: .idea/workspace.xml___jb_old___
```

## 修改所有者

参考linux命令行，不举例子了。。。

>fs.chown(path, uid, gid, callback)
>fs.chownSync(path, uid, gid)
>fs.fchown(fd, uid, gid, callback)
>fs.fchownSync(fd, uid, gid)

## 修改权限

可以用`fs.chmod()`，也可以用`fs.fchmod()`。两者的区别在于，前面传的是文件路径，后面传的的文件句柄。

1. `fs.chmod)`、`fs.fchmod()`区别：传的是文件路径，还是文件句柄。
2. `fs.chmod()`、`fs.lchmod()`区别：如果文件是软连接，那么`fs.chmod()`修改的是软连接指向的目标文件；`fs.lchmod()`修改的是软连接。

>fs.chmod(path, mode, callback)
>fs.chmodSync(path, mode)

>fs.fchmod(fd, mode, callback)
>fs.fchmodSync(fd, mode)

>fs.lchmod(path, mode, callback)#
>fs.lchmodSync(path, mode)


例子：

```javascript
var fs = require('fs');

fs.chmod('./fileForChown.txt', '777', function(err){
    if(err) console.log(err);
    console.log('权限修改成功');
});
```

同步版本：

```
var fs = require('fs');

fs.chmodSync('./fileForChown.txt', '777');
```

## 获取文件状态

区别：

* `fs.stat()` vs `fs.fstat()`：传文件路径 vs 文件句柄。
* `fs.stat()` vs `fs.lstat()`：如果文件是软链接，那么`fs.stat()`返回目标文件的状态，`fs.lstat()`返回软链接本身的状态。

>fs.stat(path, callback)
>fs.statSync(path)

>fs.fstat(fd, callback)
>fs.fstatSync(fd)

>fs.lstat(path, callback)
>fs.lstatSync(path)

主要关注`Class: fs.Stats`。

首先是方法

* stats.isFile()  -- 是否文件
* stats.isDirectory() -- 是否目录
* stats.isBlockDevice() -- 什么鬼
* stats.isCharacterDevice() -- 什么鬼
* stats.isSymbolicLink() (only valid with fs.lstat()) -- 什么鬼
* stats.isFIFO() -- 什么鬼
* stats.isSocket() -- 是不是socket文件

官网例子：

```javascript
{
  dev: 2114,
  ino: 48064969,
  mode: 33188,
  nlink: 1,
  uid: 85,
  gid: 100,
  rdev: 0,
  size: 527,
  blksize: 4096,
  blocks: 8,
  atime: Mon, 10 Oct 2011 23:24:11 GMT, // 访问时间
  mtime: Mon, 10 Oct 2011 23:24:11 GMT,  // 文件内容修改时间
  ctime: Mon, 10 Oct 2011 23:24:11 GMT,  // 文件状态修改时间
  birthtime: Mon, 10 Oct 2011 23:24:11 GMT  // 创建时间
}
```

  * atime：Access Time // 访问时间
  * mtime:: Modified Time  // 文件内容修改时间
  * ctime: Changed Time.  // 文件状态修改时间，比如修改文件所有者、修改权限、重命名等
  * birthtime: Birth Time // 创建时间。在某些系统上是不可靠的，因为拿不到。

例子：

```javascript
var fs = require('fs');

var getTimeDesc = function(d){
    return [d.getFullYear(), d.getMonth()+1, d.getDate()].join('-') + ' ' + [d.getHours(), d.getMinutes(), d.getSeconds()].join(':');
};

fs.stat('./fileForStat.txt', function(err, stats){
    console.log('文件大小: ' + stats.size);
    console.log('创建时间: ' + getTimeDesc(stats.birthtime));
    console.log('访问时间: ' + getTimeDesc(stats.atime));
    console.log('修改时间: ' + getTimeDesc(stats.mtime));
});
```

输出如下：

```powershell
/usr/local/bin/node stat.js
文件大小: 3613
创建时间: 2016-7-16 12:40:49
访问时间: 2016-7-16 12:40:49
修改时间: 2016-7-16 12:40:49

Process finished with exit code 0
```

同步的例子：

```javascript
var fs = require('fs');

var getTimeDesc = function(d){
    return [d.getFullYear(), d.getMonth()+1, d.getDate()].join('-') + ' ' + [d.getHours(), d.getMinutes(), d.getSeconds()].join(':');
};

var stats = fs.statSync('./fileForStat.txt');

console.log('文件大小: ' + stats.size);
console.log('创建时间: ' + getTimeDesc(stats.birthtime));
console.log('访问时间: ' + getTimeDesc(stats.atime));
console.log('修改时间: ' + getTimeDesc(stats.mtime));
```

## 访问/权限检测

例子：

```javascript
// fs.access(path[, mode], callback)
var fs = require('fs');

fs.access('./fileForAccess.txt', function(err){
    if(err) throw err;
    console.log('可以访问');
});
```

同步版本：

```javascript
// fs.accessSync(path[, mode])
var fs = require('fs');

// 如果成功，则返回undefined，如果失败，则抛出错误（什么鬼）
try{
    fs.accessSync('./fileForAccess.txt');
}catch(e){
    throw(e);
}
```

## 文件打开/关闭

比较底层的接口，实际需要用到的机会不多。需要用到的时候看下[文档](https://nodejs.org/api/fs.html#fs_fs_open_path_flags_mode_callback)就行。

* flags：文件打开模式，比如`r`、`r+`、`w`、`w+`等。可选模式非常多。
* mode：默认是`666`，可读+可写。

>fs.open(path, flags[, mode], callback)
>fs.openSync(path, flags[, mode])
>fs.close(fd, callback)
>fs.closeSync(fd)

## 文件读取（底层）

相对底层的读取接口，参数如下

* fd：文件句柄。
* buffer：将读取的文件内容写到buffer里。
* offset：buffer开始写入的位置。（在offset开始写入，还是offset+1？）
* length：要读取的字节数。
* position：文件从哪个位置开始读取。如果是null，那么就从当前位置开始读取。（读取操作会记录下上一个位置）

此外，`callback`的回调参数为`(err, bytesRead, buffer)`

>fs.read(fd, buffer, offset, length, position, callback)


## 追加文件内容

>fs.appendFile(file, data[, options], callback)

* file：可以是文件路径，也可以是文件句柄。（还可以是buffer？）
* data：要追加的内容。string或者buffer。
* options
    * encoding：编码，默认是`utf8`
    * mode：默认是`0o666`
    * flag：默认是`a`

注意：如果`file`是文件句柄，那么

* 开始追加数据前，file需要已经打开。
* file需要手动关闭。

```javascript
var fs = require('fs');

fs.appendFile('./extra/fileForAppend.txt', 'hello', 'utf8', function(err){
    if(err) throw err;
    console.log('append成功');
});
```

## 文件内容截取

>fs.truncate(path, len, callback)
>fs.truncateSync(path, len)
>
>fs.ftruncate(fd, len, callback)
>fs.ftruncateSync(fd, len)

用途参考[linux说明文档](http://man7.org/linux/man-pages/man2/ftruncate.2.html)。

要点：

* `offset`不会变化。比如通过`fs.read()`读取文件内容，就需要特别注意。
* 如果`len`小于文件内容长度，剩余文件内容部分会丢失；如果`len`大于文件内容长度，那么超出的部分，会用`\0`进行填充。
* 如果传的是文件路径，需要确保文件是可写的；如果传的是文件句柄，需要确保文件句柄已经打开并且可写入。

>The truncate() and ftruncate() functions cause the regular file named
by path or referenced by fd to be truncated to a size of precisely
length bytes.

>If the file previously was larger than this size, the extra data is
lost.  If the file previously was shorter, it is extended, and the
extended part reads as null bytes ('\0').

>The file offset is not changed.

> With ftruncate(), the file must be open for writing; with truncate(), the file must be writable.

## 修改文件属性（时间）

* path/fd：文件路径/文件句柄
* atime：Access Time。上一次访问文件数据的时间。
* mtime：Modified Time。修改时间。

>fs.utimes(path, atime, mtime, callback)
>fs.utimesSync(path, atime, mtime)

>fs.futimes(fd, atime, mtime, callback)
>fs.futimesSync(fd, atime, mtime)

备注，在命令行下可以

* 通过`stat`查看文件的状态信息，包括了上面的atime、mtime。
* 通过`touch`修改这几个时间。

## 创建文件链接

>fs.symlink(target, path[, type], callback)
>fs.symlinkSync(target, path[, type])
>
>fs.link(srcpath, dstpath, callback)
>fs.linkSync(srcpath, dstpath)

>  link() creates a new link (also known as a hard link) to an existing file.
       
软链接、硬链接区别：[参考](https://www.ibm.com/developerworks/cn/linux/l-cn-hardandsymb-links/) 或者 [这个]。(http://www.cnblogs.com/itech/archive/2009/04/10/1433052.html)

* 硬链接：inode相同，多个别名。删除一个硬链接文件，不会影响其他有相同inode的文件。
* 软链接：有自己的inode，用户数据块存放指向文件的inode。
       
参考[这里](http://man7.org/linux/man-pages/man2/link.2.html)。

## 创建临时目录

>fs.mkdtemp(prefix, callback)
>fs.mkdtempSync(prefix)

备忘：跟普通的随便找个目录，创建个随机名字的文件夹，有什么区别？

代码示例如下：

```javascript
var fs = require('fs');

fs.mkdtemp('/tmp/', function(err, folder){
    if(err) throw err;
    console.log('创建临时目录: ' + folder);
});
```

输出如下：

```powershell
/usr/local/bin/node mkdtemp.js
创建临时目录: /tmp/Cxw51O
```

## 找出软连接指向的真实路径

>fs.readlink(path[, options], callback)
>fs.readlinkSync(path[, options])

如下面例子，创建了个软链接指向`fileForReadLink.txt`，通过`fs.readlink()`就可以找出原始的路径。

```javascript
var fs = require('fs');
var randomFileName = './extra/fileForReadLink-' + String(Math.random()).slice(2, 6) + '.txt';

fs.symlinkSync('./extra/fileForReadLink.txt', randomFileName);
fs.readlink(randomFileName, 'utf8', function(err, linkString){
    if(err) throw err;
    console.log('链接文件内容: ' + linkString);
});
```

类似终端下直接运行`readlink`。对于软链接文件，效果同上面代码。对于硬链接，没有输出。

```powershell
➜  extra git:(master) ✗ readlink fileForReadLink-9827.txt
./extra/fileForReadLink.txt
➜  extra git:(master) ✗ readlink fileForLinkHard.txt 
➜  extra git:(master) ✗ readlink fileForLinkSoft.txt
./extra/fileForLink.txt
```

## 真实路径

>fs.realpath(path[, options], callback)
>fs.realpathSync(path[, options])

例子：（不能作用于软链接？）

```javascript
var fs = require('fs');
var path = require('path');

// fileForRealPath1.txt 是普通文件,正常运行
fs.realpath('./extra/inner/fileForRealPath1.txt', function(err, resolvedPath){
    if(err) throw err;
    console.log('fs.realpath: ' + resolvedPath);
});

// fileForRealPath.txt 是软链接, 会报错,提示找不到文件
fs.realpath('./extra/inner/fileForRealPath.txt', function(err, resolvedPath){
    if(err) throw err;
    console.log('fs.realpath: ' + resolvedPath);
});

console.log( 'path.resolve: ' + path.resolve('./extra/inner/fileForRealpath.txt') );
```

输出如下：

```powershell
path.resolve: /Users/a/Documents/git-code/git-blog/demo/2015.05.21-node-basic/fs/extra/inner/fileForRealpath.txt
fs.realpath: /Users/a/Documents/git-code/git-blog/demo/2015.05.21-node-basic/fs/extra/inner/fileForRealPath1.txt
/Users/a/Documents/git-code/git-blog/demo/2015.05.21-node-basic/fs/realpath.js:12
    if(err) throw err;
            ^

Error: ENOENT: no such file or directory, realpath './extra/inner/fileForRealPath.txt'
    at Error (native)

Process finished with exit code 1
```

## 删除目录

>fs.rmdir(path, callback)
>fs.rmdirSync(path)

例子如下：
```javascript
var fs = require('fs');

fs.rmdir('./dirForRemove', function(err){
    if(err) throw err;
    console.log('目录删除成功');
});
```

## 不常用

### 缓冲区内容写到磁盘

>fs.fdatasync(fd, callback)
>fs.fdatasyncSync(fd)

可以参考这里：

>1、sync函数
sync函数只是将所有修改过的块缓冲区排入写队列，然后就返回，它并不等待实际写磁盘操作结束。
通常称为update的系统守护进程会周期性地（一般每隔30秒）调用sync函数。这就保证了定期冲洗内核的块缓冲区。命令sync(1)也调用sync函数。
2、fsync函数
fsync函数只对由文件描述符filedes指定的单一文件起作用，并且等待写磁盘操作结束，然后返回。
fsync可用于数据库这样的应用程序，这种应用程序需要确保将修改过的块立即写到磁盘上。
3、fdatasync函数
fdatasync函数类似于fsync，但它只影响文件的数据部分。而除数据外，fsync还会同步更新文件的属性。
对于提供事务支持的数据库，在事务提交时，都要确保事务日志（包含该事务所有的修改操作以及一个提交记录）完全写到硬盘上，才认定事务提交成功并返回给应用层。

## 待确认

1. 通篇的`mode`，待确认。
2. fs.access()更多用法（涉及 fs.constants.F_OK等权限）

## 写在前面

## 入门基础

* domain：cookie属于哪个域，如果不显示声明，则限制只有当前域可以访问。比如当前域名为id.qq.com，那么默认当前域下的cookie www.qq.com无法访问。如果某个cookie申明domain为qq.com，那么，只要是qq.com域下，都可以访问该cookie。
* path：cookie所属的路径，比如声明path＝/，那么，所有路径下的页面都可以访问该cookie。如果声明cookie所属的path为/test，那么/test/sub-test/下的页面也可以访问该cookie，而/hello下的页面则无法访问该cookie。
* httpOnly：页面的js无法读写该cookie。
* secure：该cookie只能在https环境下使用。
* expires：过期时间
* maxAge：

## 相关链接
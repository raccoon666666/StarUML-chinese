#### StartUML汉化版



#### 介绍

1. 对官方版StartUML进行了一定程度的汉化
2. 通过修改一些文件, 使license不再弹出

#### 起源

本汉化包在  [这篇博客](https://blog.csdn.net/weixin_50964512/article/details/124365042)  发布的汉化包的基础上增加了大量汉化, 汉化方法也是从这里学习的

#### 汉化效果

<img src=".\README.assets\image-20220606171036252.png" alt="image-20220606171036252" style="zoom:80%;" />

<img src=".\README.assets\image-20220606171107821.png" alt="image-20220606171107821" style="zoom:80%;" /><img src=".\README.assets\image-20220606171126125.png" alt="image-20220606171126125" style="zoom:80%;" /><img src=".\README.assets\image-20220606171156558.png" alt="image-20220606171156558" style="zoom:80%;" />

#### 如何汉化

> 由于我只汉化了一部分, 所以需要自行汉化需要汉化的地方

##### 1. 找到安装路径

​	默认在C:\Program Files\StarUML

##### 2. 安装node.js

​	[下载](http://nodejs.cn/download/)windows64位即可

##### 3. 修改Path

​	将node的安装路径添加到PATH中, 使得输入`node -v`有正确输出, 具体方法自行百度

##### 4. 下载asar包

​	使用`npm install asar -g`下载, 这个东西可以对`app.asar`文件进行解压和打包

##### 5. 解压app.asar

 	1. 将`C:\Program Files\StarUML\resources`中的`app.asar`移动到其他地方
 	2. 管理员权限打开cmd, 进入到移动后的路径, 使用`asar extract app.asar app`解压
 	3. 若不识别asar, 则将`‪D:\Program Files\nodejs\node_global`添加到Path
 	4. 解压后获得app文件夹, 里面包含了一些配置文件夹, 要汉化的文件就在其中

##### 6. 用VsCode打开app文件夹

​	直接搜索要汉化的文本, 将其汉化, 记得保存

![image-20220606172520194](.\README.assets\image-20220606172520194.png)

##### 7.重写打包

	1. 汉化好之后, 使用`asar pack app app.asar`打包得到app.asar文件
	1. 然后将`app.asar`文件放到StartUML的安装路径, 替换原来的即可


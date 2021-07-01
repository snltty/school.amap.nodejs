# school.amap.nodejs
使用nodejs读取高德地图学校数据，共 “高等院校，中学，小学，幼儿园，成人教育，职业技术学校” 6个分类信息，共全国2498个地区

### 准备高德地图api权限ak
1. 在高德地图开放平台创建应用
2. 给应用添加key
3. 服务平台选 web服务
4. ip白名单留空

### 准备环境
安装最新nodejs环境

### 安装依赖
```
npm install
```

### 运行
```
node index.js
```

### 转化数据为sql
```
node parser.js
```

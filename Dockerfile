# 第一阶段：构建阶段
FROM node:18-alpine AS build

# 设置工作目录
WORKDIR /app

# 复制项目的 package.json 和 yarn.lock (如果使用 yarn)
COPY package.json yarn.lock ./

# 安装依赖
RUN yarn install

# 复制其余的项目文件
COPY . .

# 构建生产版本
RUN yarn build

# 第二阶段：运行阶段
FROM node:18-alpine

# 安装 serve
RUN yarn global add serve

# 设置工作目录
WORKDIR /app

# 复制第一阶段构建的产物到第二阶段
COPY --from=build /app/dist /app

# 暴露前端应用使用的端口
EXPOSE 80

# 启动 serve 来提供静态文件
CMD ["serve", "-s", ".", "-l", "80", "-n"]


# PRD-003: 社交与动态系统

## 1. 概述
构建社区互动的核心功能，允许用户发布动态（帖子），展示烹饪成果或生活点滴。
支持图片上传、关联食谱、隐私设置以及评论互动。首页将展示推荐流。

## 2. 用户故事
- **发布动态**：
  - 用户可以发布一段文字，配上 1-9 张图片。
  - 用户可以选择关联一个现有的食谱（“我做了这道菜”）。
  - 用户可以选择可见性：公开 或 仅自己可见。
- **浏览动态 (Feed)**：
  - 首页显示公开的动态流（推荐算法初期为按时间倒序）。
  - 用户点击动态进入详情页，查看完整内容和评论。
- **互动**：
  - 用户可以对动态进行评论。
  - 用户可以回复他人的评论。

## 3. 核心功能

### 3.1 帖子 (Post)
- **内容**：文本内容。
- **媒体**：图片列表（Dev 环境存储在本地，Prod 存 OSS）。
- **关联**：可选关联 Recipe ID。
- **隐私**：`visibility` 字段 (PUBLIC, PRIVATE)。
- **元数据**：作者、发布时间、点赞数（预留）、评论数。

### 3.2 评论 (Comment)
- **层级**：支持两级评论（评论帖子 + 回复评论）。
- **内容**：纯文本。

### 3.3 图片上传
- **Dev 实现**：
  - API 接收 `multipart/form-data`。
  - 保存文件到 `server/uploads/` 目录。
  - 返回静态资源 URL（如 `http://localhost:3000/uploads/xxx.jpg`）。

## 4. API 接口设计

### 4.1 帖子接口
- `GET /social/feed` - 获取首页流 (query: `cursor`, `limit`)
- `GET /social/posts/:id` - 帖子详情
- `POST /social/posts` - 发布帖子
  - Body: `{ content, images[], recipeId?, visibility }`
- `DELETE /social/posts/:id` - 删除帖子

### 4.2 评论接口
- `GET /social/posts/:id/comments` - 获取评论列表
- `POST /social/posts/:id/comments` - 发表评论
  - Body: `{ content, parentId? }`

### 4.3 上传接口
- `POST /upload` - 上传图片

## 5. 数据库设计 (Prisma)

### Post
```prisma
model Post {
  id          Int      @id @default(autoincrement())
  content     String?
  images      String   // JSON string: ["url1", "url2"]
  visibility  String   @default("PUBLIC") // PUBLIC, PRIVATE

  authorId    Int
  author      User     @relation(fields: [authorId], references: [id])

  recipeId    Int?
  recipe      Recipe?  @relation(fields: [recipeId], references: [id])

  comments    Comment[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Comment
```prisma
model Comment {
  id        Int      @id @default(autoincrement())
  content   String

  postId    Int
  post      Post     @relation(fields: [postId], references: [id])

  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])

  parentId  Int?     // For nested replies
  parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```


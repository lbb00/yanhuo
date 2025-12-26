# PRD-004: 用户主页与成长体系

## 1. 概述
用户个人主页是展示用户烹饪成就的核心页面。
包含类似 GitHub Contribution Graph 的“烹饪热力图”，直观展示用户做饭频率。
同时展示关注、粉丝列表，以及用户发布的动态和食谱。

## 2. 用户故事
- **查看个人主页**：
  - 我可以查看自己的主页，看到头像、昵称、简介。
  - 我可以看到我的“烹饪热力图”，了解过去一年的活跃度。
  - 我可以查看我发布的帖子和食谱列表。
- **查看他人主页**：
  - 我可以查看其他用户的主页。
  - 我可以关注/取消关注该用户。
- **国际化**：App 界面支持多语言切换（中/英）。

## 3. 核心功能

### 3.1 烹饪热力图 (Cooking Graph)
- **数据源**：基于用户发布的 Post (且关联了 Recipe) 或单独的 Check-in 记录。
- **展示**：按天显示的方块矩阵，颜色深浅代表当日做饭次数。
- **API**：返回过去 365 天每一天的计数。

### 3.2 关注系统 (Follow)
- **关系**：用户 A 关注 用户 B。
- **列表**：粉丝列表 (Followers)、关注列表 (Following)。

### 3.3 国际化 (i18n)
- 支持 `zh-CN` (默认) 和 `en-US`。
- 切换语言后，界面文案实时更新。

## 4. API 接口设计

### 4.1 用户接口 (扩展)
- `GET /users/:id/profile` - 获取用户基本信息 + 统计数据 (关注数/粉丝数)
- `GET /users/:id/activity` - 获取热力图数据
  - Response: `{ "2023-01-01": 1, "2023-01-02": 5, ... }`
- `GET /users/:id/posts` - 获取该用户的动态列表

### 4.2 关注接口
- `POST /users/:id/follow` - 关注
- `DELETE /users/:id/follow` - 取消关注
- `GET /users/:id/followers` - 粉丝列表
- `GET /users/:id/following` - 关注列表

## 5. 数据库设计 (Prisma)

### Follows
```prisma
model Follows {
  followerId  Int
  followingId Int
  follower    User @relation("follower", fields: [followerId], references: [id])
  following   User @relation("following", fields: [followingId], references: [id])

  @@id([followerId, followingId])
}
```
*需要在 User 模型中添加反向关系。*


# PRD-001: 身份验证与用户身份

## 1. 概述
本模块处理通过手机号进行的用户注册和登录。
在初期开发阶段（Dev），我们将使用 **Mock SMS** 提供商。
在生产环境（Production）中，这将替换为真实的 SMS 服务（例如：阿里云）。

## 2. 用户故事
- **注册**：作为新用户，我可以使用手机号和验证码注册。
- **登录**：作为现有用户，我可以使用手机号和验证码登录。
- **退出**：作为已登录用户，我可以退出登录。
- **我的**：作为已登录用户，我可以获取我自己的个人资料信息。

## 3. API 端点

### 3.1 发送验证码
- **POST** `/auth/send-code`
- **Body**: `{ "phone": "13800138000" }`
- **Response**: `{ "success": true, "message": "Code sent" }`
- **逻辑 (Dev)**:
  - 生成一个 4 位验证码（例如：1234 或随机）。
  - 将验证码记录到服务器控制台。
  - 将验证码存储在内存或数据库中，并设置过期时间（5 分钟）。

### 3.2 登录 / 注册
- **POST** `/auth/login`
- **Body**: `{ "phone": "13800138000", "code": "1234" }`
- **Response**:
  ```json
  {
    "token": "jwt_token_here",
    "user": {
      "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      "phone": "13800138000",
      "nickname": "User_1380"
    }
  }
  ```
- **逻辑**:
  - 验证验证码。
  - 如果用户存在 -> 返回 Token + User。
  - 如果用户不存在 -> 创建用户 (使用 ULID 作为 ID) -> 返回 Token + User。

### 3.3 获取当前用户
- **GET** `/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User 对象。

## 4. 数据库 Schema (Prisma)
ID 字段使用 **ULID** (String) 而非自增 Int。

```prisma
model User {
  id        String   @id // ULID
  phone     String   @unique
  nickname  String?
  avatar    String?
  bio       String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 5. 安全
- 使用 **JWT** (JSON Web Tokens) 进行会话管理。
- 密钥应存储在 `.env` 中。

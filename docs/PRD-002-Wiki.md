# PRD-002: 食材与食谱 Wiki 系统

## 1. 概述
构建一个通用、可扩展的食材和食谱资料库。采用类似 Wiki 的设计，允许数据版本管理（初期简化为单一版本，预留字段）。
目标是成为用户查询“怎么吃”、“有什么营养”的权威来源。

## 2. 用户故事
- **查看食材**：用户可以搜索食材（如“番茄”），查看其营养成分、选购指南、适宜人群等。
- **查看食谱**：用户可以浏览食谱详情，包括所需食材、步骤、烹饪技巧。
- **关联数据**：食谱中的食材可以点击跳转到对应的食材详情页。
- **创建/编辑**（未来）：用户可以提交新的食材或食谱（初期仅管理员或种子数据）。

## 3. 核心功能

### 3.1 食材 (Ingredients)
- **基础信息**：名称、别名、分类（蔬菜/肉类/调料等）、封面图。
- **详细信息**：描述、营养成分（卡路里/蛋白质等）、挑选指南、储存方法。
- **扩展性**：支持 Tag 标签系统。

### 3.2 食谱 (Recipes)
- **基础信息**：标题、简介、封面图、作者（用户ID）。
- **制作详情**：
  - **食材清单**：关联食材ID + 用量（如：番茄 2个）。
  - **步骤**：步骤文本 + 图片。
  - **标签**：#快手菜 #减脂。

## 4. API 接口设计

### 4.1 食材接口
- `GET /wiki/ingredients` - 列表/搜索 (query params: `q`, `category`)
- `GET /wiki/ingredients/:id` - 详情
- `POST /wiki/ingredients` - 创建 (Admin)
- `PUT /wiki/ingredients/:id` - 更新 (Admin)

### 4.2 食谱接口
- `GET /wiki/recipes` - 列表/搜索
- `GET /wiki/recipes/:id` - 详情
- `POST /wiki/recipes` - 创建
- `PUT /wiki/recipes/:id` - 更新

## 5. 数据库设计 (Prisma)

### Ingredient (食材)
```prisma
model Ingredient {
  id          Int      @id @default(autoincrement())
  name        String
  category    String?  // e.g. "蔬菜", "肉类"
  description String?
  image       String?
  nutrition   String?  // JSON string or relation
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  recipeItems RecipeItem[]
}
```

### Recipe (食谱)
```prisma
model Recipe {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  image       String?
  authorId    Int
  author      User     @relation(fields: [authorId], references: [id])
  steps       String   // JSON string: [{step: 1, text: "...", img: "..."}]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  ingredients RecipeItem[]
}
```

### RecipeItem (食谱关联食材)
```prisma
model RecipeItem {
  id           Int        @id @default(autoincrement())
  recipeId     Int
  recipe       Recipe     @relation(fields: [recipeId], references: [id])
  ingredientId Int
  ingredient   Ingredient @relation(fields: [ingredientId], references: [id])
  amount       String     // e.g. "200g", "1勺"
}
```


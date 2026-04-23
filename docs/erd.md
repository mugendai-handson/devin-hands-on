# ER図（Entity Relationship Diagram）

`prisma/schema.prisma` に基づくデータベース構造の視覚化。

```mermaid
erDiagram
    users {
        String id PK "cuid"
        String email UK "ユニーク"
        String name
        String password "bcrypt ハッシュ"
        String avatarUrl "nullable"
        UserRole role "ADMIN / MEMBER"
        String locale "default: ja"
        Theme theme "LIGHT / DARK / SYSTEM"
        DateTime createdAt
        DateTime updatedAt
    }

    projects {
        String id PK "cuid"
        String name
        String description "nullable"
        String key "プロジェクトキー"
        String ownerId FK "users.id"
        DateTime createdAt
        DateTime updatedAt
    }

    project_members {
        String id PK "cuid"
        String projectId FK "projects.id"
        String userId FK "users.id"
        ProjectMemberRole role "OWNER / ADMIN / MEMBER / VIEWER"
        DateTime createdAt
        DateTime updatedAt
    }

    tasks {
        String id PK "cuid"
        Int taskNumber "プロジェクト内連番"
        String title
        String description "nullable, Markdown"
        TaskStatus status "BACKLOG / TODO / IN_PROGRESS / IN_REVIEW / DONE"
        TaskPriority priority "URGENT / HIGH / MEDIUM / LOW / NONE"
        String projectId FK "projects.id"
        String assigneeId FK "nullable, users.id"
        String reporterId FK "users.id"
        String parentTaskId FK "nullable, tasks.id"
        DateTime dueDate "nullable"
        DateTime startDate "nullable"
        Float estimatedHours "nullable"
        Float actualHours "nullable"
        Int sortOrder "default: 0"
        DateTime createdAt
        DateTime updatedAt
    }

    categories {
        String id PK "cuid"
        String name
        String color "OKLCH カラー"
        String projectId FK "projects.id"
    }

    task_categories {
        String taskId PK_FK "tasks.id"
        String categoryId PK_FK "categories.id"
    }

    comments {
        String id PK "cuid"
        String content "Markdown"
        String taskId FK "tasks.id"
        String authorId FK "users.id"
        DateTime createdAt
        DateTime updatedAt
    }

    attachments {
        String id PK "cuid"
        String fileName
        String fileUrl
        Int fileSize "バイト"
        String mimeType
        String taskId FK "tasks.id"
        String uploaderId FK "users.id"
        DateTime createdAt
    }

    activity_logs {
        String id PK "cuid"
        ActivityAction action "CREATED / UPDATED / DELETED / ..."
        String entityType "task / comment / project 等"
        String entityId
        String userId FK "users.id"
        String projectId FK "projects.id"
        Json oldValue "nullable"
        Json newValue "nullable"
        DateTime createdAt
    }

    notifications {
        String id PK "cuid"
        NotificationType type "TASK_ASSIGNED / TASK_COMMENTED / ..."
        String title
        String message
        Boolean isRead "default: false"
        String userId FK "users.id"
        String linkUrl "nullable"
        DateTime createdAt
    }

    audit_logs {
        String id PK "cuid"
        String action
        String userId FK "users.id"
        String ipAddress "nullable"
        String userAgent "nullable"
        String resource
        String resourceId
        Json details "nullable"
        DateTime createdAt
    }

    %% === リレーション ===

    %% users - projects: オーナー（1:N）
    users ||--o{ projects : "owns"

    %% users - project_members / projects - project_members（N:N）
    users ||--o{ project_members : "belongs to"
    projects ||--o{ project_members : "has"

    %% users - tasks（reporter: 1:N, assignee: 0..1:N）
    users ||--o{ tasks : "reports"
    users o|--o{ tasks : "assigned to"

    %% projects - tasks（1:N）
    projects ||--o{ tasks : "contains"

    %% tasks 自己参照（サブタスク: 0..1:N）
    tasks o|--o{ tasks : "subtasks"

    %% tasks - categories（N:N via task_categories）
    tasks ||--o{ task_categories : "tagged"
    categories ||--o{ task_categories : "applied to"

    %% projects - categories（1:N）
    projects ||--o{ categories : "defines"

    %% tasks - comments（1:N）
    tasks ||--o{ comments : "has"
    users ||--o{ comments : "writes"

    %% tasks - attachments（1:N）
    tasks ||--o{ attachments : "has"
    users ||--o{ attachments : "uploads"

    %% activity_logs
    users ||--o{ activity_logs : "performs"
    projects ||--o{ activity_logs : "logged in"

    %% notifications
    users ||--o{ notifications : "receives"

    %% audit_logs
    users ||--o{ audit_logs : "audited"
```

## テーブル一覧

| # | テーブル名 | 説明 |
|---|-----------|------|
| 1 | `users` | ユーザーアカウント |
| 2 | `projects` | プロジェクト |
| 3 | `project_members` | プロジェクトメンバー（users ↔ projects の中間テーブル） |
| 4 | `tasks` | タスク（サブタスクは自己参照） |
| 5 | `categories` | カテゴリ（プロジェクト単位） |
| 6 | `task_categories` | タスク ↔ カテゴリの中間テーブル |
| 7 | `comments` | タスクへのコメント |
| 8 | `attachments` | タスクへの添付ファイル |
| 9 | `activity_logs` | アクティビティログ |
| 10 | `notifications` | 通知 |
| 11 | `audit_logs` | 監査ログ |

## リレーション概要

| リレーション | 種別 | 説明 |
|-------------|------|------|
| `users` → `projects` | 1:N | プロジェクトオーナー |
| `users` ↔ `projects` | N:N | `project_members` 経由のメンバーシップ |
| `users` → `tasks` | 1:N | reporter（起票者） |
| `users` → `tasks` | 0..1:N | assignee（担当者、nullable） |
| `projects` → `tasks` | 1:N | プロジェクトに属するタスク |
| `tasks` → `tasks` | 0..1:N | サブタスク（自己参照） |
| `tasks` ↔ `categories` | N:N | `task_categories` 経由 |
| `projects` → `categories` | 1:N | プロジェクト固有カテゴリ |
| `tasks` → `comments` | 1:N | タスクのコメント |
| `users` → `comments` | 1:N | コメント投稿者 |
| `tasks` → `attachments` | 1:N | 添付ファイル |
| `users` → `attachments` | 1:N | アップロード者 |
| `users` → `activity_logs` | 1:N | 操作者 |
| `projects` → `activity_logs` | 1:N | 対象プロジェクト |
| `users` → `notifications` | 1:N | 通知受信者 |
| `users` → `audit_logs` | 1:N | 監査対象ユーザー |

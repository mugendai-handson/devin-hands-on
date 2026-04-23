# ER図（Entity Relationship Diagram）

Prisma スキーマ（`prisma/schema.prisma`）に基づく全11テーブルの ER 図。

```mermaid
erDiagram
    users {
        String id PK "cuid"
        String email UK
        String name
        String password
        String avatarUrl "nullable"
        UserRole role "ADMIN | MEMBER"
        String locale "default: ja"
        Theme theme "LIGHT | DARK | SYSTEM"
        DateTime createdAt
        DateTime updatedAt
    }

    projects {
        String id PK "cuid"
        String name
        String description "nullable"
        String key
        String ownerId FK "→ users.id"
        DateTime createdAt
        DateTime updatedAt
    }

    project_members {
        String id PK "cuid"
        String projectId FK "→ projects.id"
        String userId FK "→ users.id"
        ProjectMemberRole role "OWNER | ADMIN | MEMBER | VIEWER"
        DateTime createdAt
        DateTime updatedAt
    }

    tasks {
        String id PK "cuid"
        Int taskNumber "プロジェクト内連番"
        String title
        String description "nullable, Markdown"
        TaskStatus status "BACKLOG | TODO | IN_PROGRESS | IN_REVIEW | DONE"
        TaskPriority priority "URGENT | HIGH | MEDIUM | LOW | NONE"
        String projectId FK "→ projects.id"
        String assigneeId FK "nullable → users.id"
        String reporterId FK "→ users.id"
        String parentTaskId FK "nullable → tasks.id"
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
        String color "OKLCH"
        String projectId FK "→ projects.id"
    }

    task_categories {
        String taskId PK_FK "→ tasks.id"
        String categoryId PK_FK "→ categories.id"
    }

    comments {
        String id PK "cuid"
        String content "Markdown"
        String taskId FK "→ tasks.id"
        String authorId FK "→ users.id"
        DateTime createdAt
        DateTime updatedAt
    }

    attachments {
        String id PK "cuid"
        String fileName
        String fileUrl
        Int fileSize
        String mimeType
        String taskId FK "→ tasks.id"
        String uploaderId FK "→ users.id"
        DateTime createdAt
    }

    activity_logs {
        String id PK "cuid"
        ActivityAction action "CREATED | UPDATED | DELETED | STATUS_CHANGED | ASSIGNED | COMMENTED | ATTACHED"
        String entityType "task, comment, project 等"
        String entityId
        String userId FK "→ users.id"
        String projectId FK "→ projects.id"
        Json oldValue "nullable"
        Json newValue "nullable"
        DateTime createdAt
    }

    notifications {
        String id PK "cuid"
        NotificationType type "TASK_ASSIGNED | TASK_COMMENTED | TASK_STATUS_CHANGED | TASK_DUE_SOON | MENTIONED"
        String title
        String message
        Boolean isRead "default: false"
        String userId FK "→ users.id"
        String linkUrl "nullable"
        DateTime createdAt
    }

    audit_logs {
        String id PK "cuid"
        String action
        String userId FK "→ users.id"
        String ipAddress "nullable"
        String userAgent "nullable"
        String resource
        String resourceId
        Json details "nullable"
        DateTime createdAt
    }

    %% === リレーション ===

    %% users - projects（オーナー）
    users ||--o{ projects : "owns"

    %% users - project_members
    users ||--o{ project_members : "belongs to"
    projects ||--o{ project_members : "has"

    %% users - tasks
    users ||--o{ tasks : "reports"
    users ||--o{ tasks : "assigned to"

    %% projects - tasks
    projects ||--o{ tasks : "has"

    %% tasks - tasks（サブタスク）
    tasks ||--o{ tasks : "has subtasks"

    %% projects - categories
    projects ||--o{ categories : "has"

    %% tasks - task_categories - categories（多対多）
    tasks ||--o{ task_categories : "has"
    categories ||--o{ task_categories : "has"

    %% tasks - comments
    tasks ||--o{ comments : "has"
    users ||--o{ comments : "writes"

    %% tasks - attachments
    tasks ||--o{ attachments : "has"
    users ||--o{ attachments : "uploads"

    %% activity_logs
    users ||--o{ activity_logs : "performs"
    projects ||--o{ activity_logs : "has"

    %% notifications
    users ||--o{ notifications : "receives"

    %% audit_logs
    users ||--o{ audit_logs : "performs"
```

## テーブル一覧

| # | テーブル名 | 説明 |
|---|-----------|------|
| 1 | `users` | ユーザー（認証・プロフィール） |
| 2 | `projects` | プロジェクト |
| 3 | `project_members` | プロジェクトメンバー（中間テーブル） |
| 4 | `tasks` | タスク |
| 5 | `categories` | カテゴリ（プロジェクト単位） |
| 6 | `task_categories` | タスク×カテゴリ（多対多の中間テーブル） |
| 7 | `comments` | コメント |
| 8 | `attachments` | 添付ファイル |
| 9 | `activity_logs` | アクティビティログ |
| 10 | `notifications` | 通知 |
| 11 | `audit_logs` | 監査ログ |

## リレーション概要

```
users ─┬─< projects（owner）
       ├─< project_members >── projects
       ├─< tasks（reporter）
       ├─< tasks（assignee）
       ├─< comments
       ├─< attachments
       ├─< activity_logs
       ├─< notifications
       └─< audit_logs

projects ─┬─< tasks
           ├─< categories
           └─< activity_logs

tasks ─┬─< tasks（subtasks: parentTaskId）
       ├─< task_categories >── categories
       ├─< comments
       └─< attachments
```

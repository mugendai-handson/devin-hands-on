# ER図（Entity Relationship Diagram）

Prisma スキーマ（`prisma/schema.prisma`）に基づく全 11 テーブルの ER 図。

```mermaid
erDiagram
    users {
        String id PK "cuid"
        String email UK "ユニーク"
        String name "表示名"
        String password "bcrypt ハッシュ"
        String avatarUrl "プロフィール画像URL（nullable）"
        UserRole role "ADMIN / MEMBER"
        String locale "デフォルト: ja"
        Theme theme "LIGHT / DARK / SYSTEM"
        DateTime createdAt
        DateTime updatedAt
    }

    projects {
        String id PK "cuid"
        String name "プロジェクト名"
        String description "説明（nullable）"
        String key "プロジェクトキー（例: DTB）"
        String ownerId FK "→ users"
        DateTime createdAt
        DateTime updatedAt
    }

    project_members {
        String id PK "cuid"
        String projectId FK "→ projects"
        String userId FK "→ users"
        ProjectMemberRole role "OWNER / ADMIN / MEMBER / VIEWER"
        DateTime createdAt
        DateTime updatedAt
    }

    tasks {
        String id PK "cuid"
        Int taskNumber "プロジェクト内連番"
        String title "タイトル"
        String description "Markdown（nullable）"
        TaskStatus status "BACKLOG / TODO / IN_PROGRESS / IN_REVIEW / DONE"
        TaskPriority priority "URGENT / HIGH / MEDIUM / LOW / NONE"
        String projectId FK "→ projects"
        String assigneeId FK "→ users（nullable）"
        String reporterId FK "→ users"
        String parentTaskId FK "→ tasks（nullable）"
        DateTime dueDate "期限（nullable）"
        DateTime startDate "開始日（nullable）"
        Float estimatedHours "見積もり工数（nullable）"
        Float actualHours "実績工数（nullable）"
        Int sortOrder "カンバン内並び順"
        DateTime createdAt
        DateTime updatedAt
    }

    categories {
        String id PK "cuid"
        String name "カテゴリ名"
        String color "OKLCH カラー値"
        String projectId FK "→ projects"
    }

    task_categories {
        String taskId FK,PK "→ tasks"
        String categoryId FK,PK "→ categories"
    }

    comments {
        String id PK "cuid"
        String content "Markdown"
        String taskId FK "→ tasks"
        String authorId FK "→ users"
        DateTime createdAt
        DateTime updatedAt
    }

    attachments {
        String id PK "cuid"
        String fileName "ファイル名"
        String fileUrl "ストレージURL"
        Int fileSize "バイト数"
        String mimeType "MIMEタイプ"
        String taskId FK "→ tasks"
        String uploaderId FK "→ users"
        DateTime createdAt
    }

    activity_logs {
        String id PK "cuid"
        ActivityAction action "CREATED / UPDATED / DELETED / etc."
        String entityType "task / comment / project 等"
        String entityId "対象ID"
        String userId FK "→ users"
        String projectId FK "→ projects"
        Json oldValue "変更前（nullable）"
        Json newValue "変更後（nullable）"
        DateTime createdAt
    }

    notifications {
        String id PK "cuid"
        NotificationType type "TASK_ASSIGNED / TASK_COMMENTED / etc."
        String title
        String message
        Boolean isRead "既読フラグ"
        String userId FK "→ users"
        String linkUrl "遷移先URL（nullable）"
        DateTime createdAt
    }

    audit_logs {
        String id PK "cuid"
        String action "操作内容"
        String userId FK "→ users"
        String ipAddress "nullable"
        String userAgent "nullable"
        String resource "対象リソース"
        String resourceId "対象ID"
        Json details "詳細情報（nullable）"
        DateTime createdAt
    }

    %% === リレーション ===

    %% users - projects（1:N / オーナー）
    users ||--o{ projects : "owns"

    %% users - project_members（1:N）
    users ||--o{ project_members : "has"
    %% projects - project_members（1:N）
    projects ||--o{ project_members : "has"

    %% projects - tasks（1:N）
    projects ||--o{ tasks : "contains"
    %% users - tasks（1:N / reporter）
    users ||--o{ tasks : "reports"
    %% users - tasks（1:N / assignee）
    users ||--o{ tasks : "assigned to"
    %% tasks - tasks（自己参照 / サブタスク）
    tasks ||--o{ tasks : "subtasks"

    %% projects - categories（1:N）
    projects ||--o{ categories : "has"

    %% tasks - task_categories（1:N）
    tasks ||--o{ task_categories : "tagged"
    %% categories - task_categories（1:N）
    categories ||--o{ task_categories : "tagged"

    %% tasks - comments（1:N）
    tasks ||--o{ comments : "has"
    %% users - comments（1:N）
    users ||--o{ comments : "writes"

    %% tasks - attachments（1:N）
    tasks ||--o{ attachments : "has"
    %% users - attachments（1:N）
    users ||--o{ attachments : "uploads"

    %% users - activity_logs（1:N）
    users ||--o{ activity_logs : "performs"
    %% projects - activity_logs（1:N）
    projects ||--o{ activity_logs : "has"

    %% users - notifications（1:N）
    users ||--o{ notifications : "receives"

    %% users - audit_logs（1:N）
    users ||--o{ audit_logs : "triggers"
```

## テーブル一覧

| # | テーブル名 | 説明 |
|---|-----------|------|
| 1 | users | ユーザー（認証・プロフィール） |
| 2 | projects | プロジェクト |
| 3 | project_members | プロジェクトメンバー（多対多の中間テーブル） |
| 4 | tasks | タスク |
| 5 | categories | カテゴリ / ラベル |
| 6 | task_categories | タスク×カテゴリ（多対多の中間テーブル） |
| 7 | comments | コメント |
| 8 | attachments | ファイル添付 |
| 9 | activity_logs | アクティビティログ |
| 10 | notifications | 通知 |
| 11 | audit_logs | 監査ログ |

## リレーション概要

- **users ↔ projects**: 1:N（オーナー）
- **users ↔ projects**: N:N（project_members 経由）
- **projects → tasks**: 1:N
- **users → tasks**: 1:N（reporter / assignee）
- **tasks → tasks**: 自己参照 1:N（サブタスク）
- **tasks ↔ categories**: N:N（task_categories 経由）
- **tasks → comments**: 1:N
- **tasks → attachments**: 1:N
- **users / projects → activity_logs**: 1:N
- **users → notifications**: 1:N
- **users → audit_logs**: 1:N

# ERD図（Entity Relationship Diagram）

```mermaid
erDiagram
    users {
        String id PK "cuid"
        String email UK "ユニーク"
        String name "表示名"
        String password "bcryptハッシュ"
        String avatarUrl "プロフィール画像URL（任意）"
        UserRole role "ADMIN / MEMBER"
        String locale "言語設定（デフォルト: ja）"
        Theme theme "LIGHT / DARK / SYSTEM"
        DateTime createdAt
        DateTime updatedAt
    }

    projects {
        String id PK "cuid"
        String name "プロジェクト名"
        String description "説明（任意）"
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
        String description "Markdown対応（任意）"
        TaskStatus status "BACKLOG / TODO / IN_PROGRESS / IN_REVIEW / DONE"
        TaskPriority priority "URGENT / HIGH / MEDIUM / LOW / NONE"
        String projectId FK "→ projects"
        String assigneeId FK "→ users（任意）"
        String reporterId FK "→ users"
        String parentTaskId FK "→ tasks（サブタスク、任意）"
        DateTime dueDate "期限（任意）"
        DateTime startDate "開始日（任意）"
        Float estimatedHours "見積もり工数（任意）"
        Float actualHours "実績工数（任意）"
        Int sortOrder "カンバン内並び順"
        DateTime createdAt
        DateTime updatedAt
    }

    categories {
        String id PK "cuid"
        String name "カテゴリ名"
        String color "OKLCHカラー値"
        String projectId FK "→ projects"
    }

    task_categories {
        String taskId FK "→ tasks"
        String categoryId FK "→ categories"
    }

    comments {
        String id PK "cuid"
        String content "Markdown対応"
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
        ActivityAction action "CREATED / UPDATED / DELETED / STATUS_CHANGED / ASSIGNED / COMMENTED / ATTACHED"
        String entityType "task / comment / project 等"
        String entityId "対象ID"
        String userId FK "→ users"
        String projectId FK "→ projects"
        Json oldValue "変更前（任意）"
        Json newValue "変更後（任意）"
        DateTime createdAt
    }

    notifications {
        String id PK "cuid"
        NotificationType type "TASK_ASSIGNED / TASK_COMMENTED / TASK_STATUS_CHANGED / TASK_DUE_SOON / MENTIONED"
        String title
        String message
        Boolean isRead "既読フラグ"
        String userId FK "→ users（受信者）"
        String linkUrl "遷移先URL（任意）"
        DateTime createdAt
    }

    audit_logs {
        String id PK "cuid"
        String action "操作内容"
        String userId FK "→ users"
        String ipAddress "（任意）"
        String userAgent "（任意）"
        String resource "対象リソース"
        String resourceId "対象ID"
        Json details "詳細情報（任意）"
        DateTime createdAt
    }

    %% リレーション

    users ||--o{ projects : "owns"
    users ||--o{ project_members : "belongs to"
    users ||--o{ tasks : "reports"
    users ||--o{ tasks : "is assigned"
    users ||--o{ comments : "writes"
    users ||--o{ attachments : "uploads"
    users ||--o{ activity_logs : "performs"
    users ||--o{ notifications : "receives"
    users ||--o{ audit_logs : "triggers"

    projects ||--o{ project_members : "has"
    projects ||--o{ tasks : "contains"
    projects ||--o{ categories : "defines"
    projects ||--o{ activity_logs : "tracks"

    project_members }o--|| users : "references"
    project_members }o--|| projects : "references"

    tasks ||--o{ task_categories : "tagged with"
    tasks ||--o{ comments : "has"
    tasks ||--o{ attachments : "has"
    tasks ||--o{ tasks : "has subtasks"

    categories ||--o{ task_categories : "applied to"

    task_categories }o--|| tasks : "references"
    task_categories }o--|| categories : "references"
```

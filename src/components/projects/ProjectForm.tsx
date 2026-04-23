"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { createProject } from "@/lib/actions/project";
import { generateProjectKey } from "@/lib/utils/project";

import type { ProjectFormState } from "@/lib/actions/project";

export const ProjectForm = () => {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ProjectFormState, FormData>(
    createProject,
    null,
  );
  const [key, setKey] = useState("");
  const [keyManuallyEdited, setKeyManuallyEdited] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!keyManuallyEdited) {
      setKey(generateProjectKey(e.target.value));
    }
  };

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
    if (state?.success) {
      toast.success("プロジェクトを作成しました");
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      {/* プロジェクト名 */}
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium text-foreground"
        >
          プロジェクト名 <span className="text-danger">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          onChange={handleNameChange}
          placeholder="例: Devin Task Board"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {state?.fieldErrors?.name && (
          <p className="text-sm text-danger">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      {/* 説明 */}
      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium text-foreground"
        >
          説明
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="プロジェクトの説明を入力..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* プロジェクトキー */}
      <div className="space-y-2">
        <label
          htmlFor="key"
          className="text-sm font-medium text-foreground"
        >
          プロジェクトキー <span className="text-danger">*</span>
        </label>
        <input
          id="key"
          name="key"
          type="text"
          required
          value={key}
          onChange={(e) => {
            setKey(e.target.value.toUpperCase());
            setKeyManuallyEdited(true);
          }}
          placeholder="例: DTB"
          maxLength={5}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm uppercase text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground">
          タスク番号のプレフィックスに使用されます（例: {key || "DTB"}-1）
        </p>
        {state?.fieldErrors?.key && (
          <p className="text-sm text-danger">{state.fieldErrors.key[0]}</p>
        )}
      </div>

      {/* アクション */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "作成中..." : "プロジェクトを作成"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/projects")}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
};

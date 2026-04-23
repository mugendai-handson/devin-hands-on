"use client";

import { useActionState, useEffect } from "react";

import { toast } from "sonner";

import { updateProject } from "@/lib/actions/project";

import type { ProjectFormState } from "@/lib/actions/project";

interface ProjectSettingsFormProps {
  projectId: string;
  defaultValues: {
    name: string;
    description: string | null;
    key: string;
  };
}

export const ProjectSettingsForm = ({
  projectId,
  defaultValues,
}: ProjectSettingsFormProps) => {
  const updateWithId = updateProject.bind(null, projectId);
  const [state, formAction, isPending] = useActionState<ProjectFormState, FormData>(
    updateWithId,
    null,
  );

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
    if (state?.success) {
      toast.success("プロジェクト情報を更新しました");
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
          defaultValue={defaultValues.name}
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
          defaultValue={defaultValues.description ?? ""}
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
          defaultValue={defaultValues.key}
          maxLength={5}
          onChange={(e) => {
            e.target.value = e.target.value.toUpperCase();
          }}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm uppercase text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground">
          タスク番号のプレフィックスに使用されます
        </p>
        {state?.fieldErrors?.key && (
          <p className="text-sm text-danger">{state.fieldErrors.key[0]}</p>
        )}
      </div>

      {/* 保存ボタン */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "保存中..." : "変更を保存"}
        </button>
      </div>
    </form>
  );
};

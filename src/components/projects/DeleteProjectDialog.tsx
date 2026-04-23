"use client";

import { useState } from "react";

import { toast } from "sonner";
import { Trash2, AlertTriangle } from "lucide-react";

import { deleteProject } from "@/lib/actions/project";

interface DeleteProjectDialogProps {
  projectId: string;
  projectName: string;
}

export const DeleteProjectDialog = ({
  projectId,
  projectName,
}: DeleteProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteProject(projectId);
      if (result?.error) {
        toast.error(result.error);
        setIsDeleting(false);
      }
    } catch {
      toast.error("プロジェクトの削除に失敗しました");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => { setConfirmText(""); setOpen(true); }}
        className="inline-flex items-center gap-2 rounded-md border border-danger/30 bg-danger/10 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/20"
      >
        <Trash2 size={16} />
        プロジェクトを削除
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !isDeleting && setOpen(false)}
          />

          {/* Dialog */}
          <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10">
                <AlertTriangle size={20} className="text-danger" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  プロジェクトを削除
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  この操作は取り消せません。プロジェクト内の全タスク、コメント、添付ファイルも削除されます。
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium text-foreground">
                確認のため、プロジェクト名{" "}
                <span className="font-bold text-danger">{projectName}</span>{" "}
                を入力してください
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={projectName}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isDeleting}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={confirmText !== projectName || isDeleting}
                className="inline-flex items-center gap-2 rounded-md bg-danger px-4 py-2 text-sm font-medium text-danger-foreground transition-colors hover:bg-danger/90 disabled:opacity-50"
              >
                {isDeleting ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

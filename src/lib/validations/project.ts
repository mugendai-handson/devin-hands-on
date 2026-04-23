import { z } from "zod";

const projectKeySchema = z
  .string()
  .min(1, "プロジェクトキーは必須です")
  .max(10, "プロジェクトキーは10文字以内で入力してください")
  .regex(/^[A-Z0-9]+$/, "プロジェクトキーは英大文字と数字のみ使用できます");

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "プロジェクト名は必須です")
    .max(100, "プロジェクト名は100文字以内で入力してください"),
  description: z.string().max(1000).optional().nullable(),
  key: projectKeySchema.optional(),
});

export const updateProjectSchema = z
  .object({
    name: z
      .string()
      .min(1, "プロジェクト名は必須です")
      .max(100, "プロジェクト名は100文字以内で入力してください")
      .optional(),
    description: z.string().max(1000).optional().nullable(),
    key: projectKeySchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "更新項目が指定されていません",
  });

export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

/**
 * プロジェクト名からプロジェクトキーを生成する。
 * 例: "Devin Task Board" → "DTB"、"マイアプリ" → "MYAPP"、
 * 英数字を含まない場合はハッシュ的にフォールバックする。
 */
export const generateProjectKey = (name: string): string => {
  const ascii = name.replace(/[^A-Za-z0-9\s]/g, "").trim();
  if (ascii.length > 0) {
    const words = ascii.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      const initials = words
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join("");
      return initials.slice(0, 10) || "PROJ";
    }
    return words[0].slice(0, 10).toUpperCase();
  }

  const fallback = name
    .replace(/\s+/g, "")
    .slice(0, 10)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return fallback || "PROJ";
};

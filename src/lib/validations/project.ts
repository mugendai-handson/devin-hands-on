import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "プロジェクト名は必須です"),
  description: z.string().optional(),
  key: z
    .string()
    .min(2, "キーは2文字以上で入力してください")
    .max(5, "キーは5文字以下で入力してください")
    .regex(/^[A-Z0-9]+$/, "キーは大文字英数字のみ使用できます"),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, "プロジェクト名は必須です").optional(),
  description: z.string().optional(),
  key: z
    .string()
    .min(2, "キーは2文字以上で入力してください")
    .max(5, "キーは5文字以下で入力してください")
    .regex(/^[A-Z0-9]+$/, "キーは大文字英数字のみ使用できます")
    .optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

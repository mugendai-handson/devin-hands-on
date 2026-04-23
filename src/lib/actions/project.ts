"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  createProjectSchema,
  updateProjectSchema,
} from "@/lib/validations/project";

export type ProjectFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
} | null;

export const createProject = async (
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "認証が必要です" };
  }

  const raw = {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    key: formData.get("key"),
  };

  const parsed = createProjectSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existingProject = await prisma.project.findFirst({
    where: { key: parsed.data.key },
  });
  if (existingProject) {
    return { fieldErrors: { key: ["このキーは既に使用されています"] } };
  }

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      key: parsed.data.key,
      ownerId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role: "OWNER",
        },
      },
    },
  });

  revalidatePath("/projects");
  redirect(`/projects/${project.id}/board`);
};

export const updateProject = async (
  projectId: string,
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "認証が必要です" };
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId: session.user.id },
    },
  });
  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    return { error: "プロジェクトを編集する権限がありません" };
  }

  const raw = {
    name: formData.get("name") || undefined,
    description: formData.get("description") || undefined,
    key: formData.get("key") || undefined,
  };

  const parsed = updateProjectSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  if (parsed.data.key) {
    const existingProject = await prisma.project.findFirst({
      where: { key: parsed.data.key, id: { not: projectId } },
    });
    if (existingProject) {
      return { fieldErrors: { key: ["このキーは既に使用されています"] } };
    }
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(parsed.data.name && { name: parsed.data.name }),
      description: parsed.data.description ?? null,
      ...(parsed.data.key && { key: parsed.data.key }),
    },
  });

  revalidatePath(`/projects/${projectId}/settings`);
  revalidatePath("/projects");
  return { success: true };
};

export const deleteProject = async (
  projectId: string,
): Promise<ProjectFormState> => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "認証が必要です" };
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId: session.user.id },
    },
  });
  if (!member || member.role !== "OWNER") {
    return { error: "プロジェクトを削除する権限がありません" };
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  revalidatePath("/projects");
  redirect("/projects");
};

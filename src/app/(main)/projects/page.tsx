import Link from "next/link";
import { FolderKanban, Plus, Users, ListTodo, Settings } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

import type { ProjectMemberRole } from "@prisma/client";

const roleLabel: Record<ProjectMemberRole, string> = {
  OWNER: "オーナー",
  ADMIN: "管理者",
  MEMBER: "メンバー",
  VIEWER: "閲覧者",
};

const ProjectsPage = async () => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const memberships = await prisma.projectMember.findMany({
    where: { userId: session.user.id },
    include: {
      project: {
        include: {
          _count: { select: { tasks: true, members: true } },
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">プロジェクト</h1>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={16} />
          新規作成
        </Link>
      </div>

      {memberships.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FolderKanban size={32} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-card-foreground">
              参加中のプロジェクトはありません
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              新しいプロジェクトを作成して始めましょう
            </p>
          </div>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus size={16} />
            プロジェクトを作成
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {memberships.map(({ project, role }) => (
            <div
              key={project.id}
              className="group relative rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
            >
              <Link
                href={`/projects/${project.id}/board`}
                className="block p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <FolderKanban size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-card-foreground">
                      {project.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {project.key}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    {roleLabel[role]}
                  </span>
                </div>

                {project.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                )}

                <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ListTodo size={14} />
                    タスク {project._count.tasks}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    メンバー {project._count.members}
                  </span>
                </div>
              </Link>

              {(role === "OWNER" || role === "ADMIN") && (
                <Link
                  href={`/projects/${project.id}/settings`}
                  className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
                  aria-label="プロジェクト設定"
                >
                  <Settings size={16} />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ProjectsPage;

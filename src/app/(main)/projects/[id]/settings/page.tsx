import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProjectSettingsForm } from "@/components/projects/ProjectSettingsForm";
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog";

type Props = {
  params: Promise<{ id: string }>;
};

const ProjectSettingsPage = async ({ params }: Props) => {
  const { id: projectId } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: { userId: session.user.id },
        select: { role: true },
      },
    },
  });

  if (!project) notFound();

  const currentMember = project.members[0];
  if (!currentMember) notFound();

  const isOwner = currentMember.role === "OWNER";
  const canEdit = isOwner || currentMember.role === "ADMIN";

  if (!canEdit) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <Link
          href={`/projects/${projectId}/board`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          ボードに戻る
        </Link>
        <h1 className="text-2xl font-bold text-foreground">プロジェクト設定</h1>
        <p className="text-sm text-muted-foreground">
          プロジェクトの基本情報を編集できます
        </p>
      </div>

      {/* 基本情報 */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-card-foreground">
          基本情報
        </h2>
        <ProjectSettingsForm
          projectId={projectId}
          defaultValues={{
            name: project.name,
            description: project.description,
            key: project.key,
          }}
        />
      </div>

      {/* 危険ゾーン（OWNER のみ） */}
      {isOwner && (
        <div className="rounded-lg border border-danger/30 bg-card p-6">
          <h2 className="mb-2 text-lg font-semibold text-danger">
            危険ゾーン
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            プロジェクトを削除すると、すべてのタスク、コメント、添付ファイルが完全に削除されます。この操作は取り消せません。
          </p>
          <DeleteProjectDialog
            projectId={projectId}
            projectName={project.name}
          />
        </div>
      )}
    </div>
  );
};
export default ProjectSettingsPage;

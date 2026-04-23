import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ProjectForm } from "@/components/projects/ProjectForm";

const NewProjectPage = () => {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          プロジェクト一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          新しいプロジェクトを作成
        </h1>
        <p className="text-sm text-muted-foreground">
          プロジェクトの基本情報を入力してください
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <ProjectForm />
      </div>
    </div>
  );
};
export default NewProjectPage;

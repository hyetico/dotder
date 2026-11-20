"use client";

import { useRouter } from "next/navigation";

import { AppIcon, Folder, Plus } from "@/components/ui/icon";

import PageInset from "@/components/layout/pages/Page/PageInset";
import PrimaryButton from "@/components/ui/button/PrimaryButton";

export default function CreateProjectPrompt() {
  const router = useRouter();

  return (
    <PageInset
      top="none"
      bottom={false}
      className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-16"
    >
      <div className="max-w-md text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
          <AppIcon icon={Folder} size="xl" />
        </span>

        <h2 className="text-page-title mt-5 text-[var(--color-text)]">프로젝트를 만들어주세요</h2>

        <div className="text-body-sm mt-3 space-y-1 text-[var(--color-text-secondary)]">
          <p>아직 프로젝트가 없습니다.</p>
          <p>프로젝트를 만들면 메인 프로젝트로 설정할 수 있습니다.</p>
        </div>

        <PrimaryButton
          icon={<AppIcon icon={Plus} size="md" />}
          onClick={() => router.push("/projects/new")}
          className="mx-auto mt-6 !text-white"
          size="md"
        >
          새 프로젝트 만들기
        </PrimaryButton>
      </div>
    </PageInset>
  );
}

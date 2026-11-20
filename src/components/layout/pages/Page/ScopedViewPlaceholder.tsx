import PageInset from "@/components/layout/pages/Page/PageInset";

type ScopedViewPlaceholderProps = {
  title: string;
};

export default function ScopedViewPlaceholder({ title }: ScopedViewPlaceholderProps) {
  return (
    <PageInset>
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]">
        <p className="text-body text-[var(--color-text-secondary)]">{title} — coming soon</p>
      </div>
    </PageInset>
  );
}

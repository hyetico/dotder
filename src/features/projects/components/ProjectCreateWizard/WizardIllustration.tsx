import ProjectFolder from "@/features/projects/components/ProjectFolder";

const calendarDayKeys = Array.from({ length: 12 }, (_, index) => index);

const calendarTodayIndex = 5;

/**
 * IllustrationBurst
 *
 * 그림 오른쪽 위에 반짝이는 느낌을 주는 짧은 선 세 개입니다.
 */
function IllustrationBurst() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="absolute -top-5 -right-5 h-7 w-7 text-[var(--color-text-secondary)]"
    >
      <path d="M4 8 L8 12" />
      <path d="M14 2 L14 8" />
      <path d="M24 10 L19 12" />
    </svg>
  );
}

/**
 * IllustrationGround
 *
 * 그림 아래에 깔리는 옅은 바닥 그림자입니다.
 */
function IllustrationGround() {
  return (
    <div
      aria-hidden
      className="mx-auto mt-4 h-2.5 w-28 rounded-full bg-[var(--color-hover)] blur-[2px]"
    />
  );
}

/**
 * FolderIllustration
 *
 * 기본 정보 단계 왼쪽에 보여주는 폴더 그림입니다. 고른 프로젝트 색이 폴더에 옅게 반영됩니다.
 *
 * @param props - FolderIllustration 컴포넌트 Props
 * @param props.color - 고른 프로젝트 색. 없으면 회색 폴더
 */
export function FolderIllustration({ color }: { color: string | null }) {
  return (
    <div aria-hidden>
      <div className="relative">
        <IllustrationBurst />

        <ProjectFolder color={color} className="w-[132px]">
          <div className="flex h-[84px] flex-col justify-end gap-1.5 p-4">
            <span className="h-1.5 w-12 rounded-full bg-[var(--color-hover)]" />
            <span className="h-1.5 w-8 rounded-full bg-[var(--color-hover)]" />
          </div>
        </ProjectFolder>
      </div>

      <IllustrationGround />
    </div>
  );
}

/**
 * CalendarIllustration
 *
 * 일정 및 상태 단계 왼쪽에 보여주는 달력 그림입니다.
 */
export function CalendarIllustration() {
  return (
    <div aria-hidden>
      <div className="relative">
        <IllustrationBurst />

        <div className="relative w-[132px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="h-6 border-b border-[var(--color-border)] bg-[var(--color-muted)]" />

          <div className="grid grid-cols-4 gap-x-3 gap-y-2.5 px-4 py-4">
            {calendarDayKeys.map((key) => (
              <span
                key={key}
                className={`h-1.5 w-1.5 rounded-full ${
                  key === calendarTodayIndex ? "bg-[var(--color-primary)]" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        <span className="absolute top-[-5px] left-5 h-3 w-1 rounded-full bg-[var(--color-text-secondary)]" />

        <span className="absolute top-[-5px] right-5 h-3 w-1 rounded-full bg-[var(--color-text-secondary)]" />
      </div>

      <IllustrationGround />
    </div>
  );
}

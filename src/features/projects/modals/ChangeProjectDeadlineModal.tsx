"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

import { useQuery } from "@tanstack/react-query";

import Badge from "@/components/ui/badge/Badge";
import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import DatePicker from "@/components/ui/date-picker/DatePicker";
import { fieldPaddingClassName } from "@/components/ui/fieldControl";
import FieldNotice from "@/components/ui/FieldNotice";
import {
  AppIcon,
  Calendar,
  ChevronDown,
  Info,
  ListTodo,
  Link2,
  Target,
  type LucideIcon,
} from "@/components/ui/icon";
import InfoTooltip from "@/components/ui/InfoTooltip";
import Textarea from "@/components/ui/input/Textarea";
import Modal, { modalSidePaddingClassName } from "@/components/ui/modal/Modal";

import { getGoals } from "@/features/goals/api/goals";
import DelayIssueBadge from "@/features/projects/components/DelayIssueBadge";
import { getTasks } from "@/features/tasks/api/tasks";

import { formatDate, formatMonthDay, getDayDelta, toDateKey } from "@/lib/date";
import { goalQueryKeys, taskQueryKeys } from "@/lib/queryKeys";

const REASON_LIMIT = 200;
const LINKED_LIST_LIMIT = 3;

type LinkedScheduleItem = {
  id: number;
  title: string;
};

type ChangeProjectDeadlineModalProps = {
  isOpen: boolean;
  title: string;
  icon: LucideIcon;
  projectId?: number;
  currentDate: string;
  minDate: string;
  delayDays: number;
  onClose: () => void;
  onSubmit: (endDate: string, reason: string) => void;
};

/**
 * deadlineShiftSentence
 *
 * 새 마감일의 연장·단축과 오늘부터 남은 날을 한 문장으로 만듭니다.
 *
 * @param currentDate - 지금 저장된 마감일
 * @param nextDate - 고른 새 마감일
 * @param includeBaseline - 기존 마감일과 비교하는 말을 앞에 붙일지 여부
 * @returns 연장과 남은 날을 잇는 문장
 */
function deadlineShiftSentence(currentDate: string, nextDate: string, includeBaseline: boolean) {
  const remain = getDayDelta(toDateKey(new Date()), nextDate);

  const remainText =
    remain > 0
      ? `오늘부터 ${remain}일 남음`
      : remain === 0
        ? "오늘이 마감입니다"
        : `오늘부터 ${Math.abs(remain)}일 지남`;

  if (!currentDate) {
    return remainText;
  }

  const shifted = getDayDelta(currentDate, nextDate);

  if (shifted === 0) {
    const same = includeBaseline ? "기존 마감일과 같습니다" : "마감일이 같습니다";

    return `${same} · ${remainText}`;
  }

  const amount = `${Math.abs(shifted)}일 ${shifted > 0 ? "연장" : "단축"}`;

  const shiftText = includeBaseline ? `기존보다 ${amount}` : amount;

  return `${shiftText} · ${remainText}`;
}

/**
 * useWideDeadlineLayout
 *
 * 마감일 변경 모달이 넓은 화면 배치인지 확인합니다.
 *
 * @returns 768px 이상이면 true
 */
function useWideDeadlineLayout() {
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");

    const apply = () => {
      setWide(query.matches);
    };

    apply();
    query.addEventListener("change", apply);

    return () => {
      query.removeEventListener("change", apply);
    };
  }, []);

  return wide;
}

/**
 * DeadlineFieldLabel
 *
 * 마감일 변경 모달의 입력 이름입니다.
 *
 * @param props - DeadlineFieldLabel 컴포넌트 Props
 * @param props.label - 입력 이름
 * @param props.required - 필수 표시 여부
 * @param props.counter - 제목 오른쪽에 둘 글자 수
 * @param props.accessory - 제목 옆에 둘 정보 툴팁
 */
function DeadlineFieldLabel({
  label,
  required = false,
  counter,
  accessory,
}: {
  label: string;
  required?: boolean;
  counter?: string;
  accessory?: ReactNode;
}) {
  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-1">
        <p className="text-body font-medium text-[var(--color-text)]">
          {label}

          {required ? <span className="ml-0.5 text-[var(--color-field-error)]">*</span> : null}
        </p>

        {accessory}
      </div>

      {counter ? (
        <span className="text-caption shrink-0 text-[var(--color-text-muted)]">{counter}</span>
      ) : null}
    </div>
  );
}

/**
 * ReadOnlyDateField
 *
 * 고른 마감일을 달력 아이콘이 있는 입력칸처럼 보여 줍니다.
 *
 * @param props - ReadOnlyDateField 컴포넌트 Props
 * @param props.value - 표시할 날짜. 비어 있으면 안내 문구를 보여 줍니다
 * @param props.placeholder - 날짜가 없을 때 보여 줄 문구
 */
function ReadOnlyDateField({ value, placeholder }: { value: string; placeholder: string }) {
  const label = value ? formatDate(value) : "";

  return (
    <div
      className={`text-body flex h-10 w-full items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-field-border)] bg-[var(--color-field)] lg:h-11 ${fieldPaddingClassName} text-[var(--color-field-text)]`}
    >
      <span className={label ? "truncate" : "truncate text-[var(--color-field-placeholder)]"}>
        {label || placeholder}
      </span>

      <AppIcon icon={Calendar} size="md" className="shrink-0 text-[var(--color-text-muted)]" />
    </div>
  );
}

/**
 * CurrentDeadlineDisplay
 *
 * 현재 마감일과 지연 일수를 보여 줍니다.
 * 좁은 화면은 제목 오른쪽에 날짜와 지연 뱃지를 나란히 두고, 넓은 화면은 날짜를 아래에 둡니다.
 *
 * @param props - CurrentDeadlineDisplay 컴포넌트 Props
 * @param props.date - 지금 저장된 마감일
 * @param props.delayDays - 지연 일수. 0이면 지연 표시를 숨깁니다
 */
function CurrentDeadlineDisplay({ date, delayDays }: { date: string; delayDays: number }) {
  const label = formatDate(date);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-body shrink-0 text-[var(--color-text-muted)]">현재 마감일</p>

        <div className="flex min-w-0 items-center justify-end gap-1.5 md:hidden">
          <span className="text-body truncate text-[var(--color-text)] tabular-nums">{label}</span>

          {delayDays > 0 ? <DelayIssueBadge days={delayDays} size="sm" /> : null}
        </div>
      </div>

      <div className="hidden items-center gap-2 md:flex">
        <p className="text-section-title text-[var(--color-text)] tabular-nums">{label}</p>

        {delayDays > 0 ? <DelayIssueBadge days={delayDays} /> : null}
      </div>
    </div>
  );
}

/**
 * DeadlineShiftSummary
 *
 * 새 마감일이 기존보다 얼마나 달라졌는지와 오늘 기준 남은 날을 보여 줍니다.
 *
 * @param props - DeadlineShiftSummary 컴포넌트 Props
 * @param props.currentDate - 지금 저장된 마감일
 * @param props.nextDate - 고른 새 마감일
 * @param props.placement - 넓은 화면 상자 또는 좁은 화면 가운데 정렬
 */
function DeadlineShiftSummary({
  currentDate,
  nextDate,
  placement,
}: {
  currentDate: string;
  nextDate: string;
  placement: "box" | "center";
}) {
  const sentence = deadlineShiftSentence(currentDate, nextDate, placement === "box");

  const basis = `${formatDate(toDateKey(new Date()))} 기준`;

  if (placement === "center") {
    return (
      <div className="rounded-[var(--radius-sm)] bg-[var(--color-hover-soft)] px-3 py-2.5 text-center md:hidden">
        <p className="text-caption font-semibold text-[var(--color-text)]">{sentence}</p>

        <p className="text-caption mt-0.5 text-[var(--color-text-muted)]">{basis}</p>
      </div>
    );
  }

  return (
    <div className="hidden rounded-[var(--radius-sm)] bg-[var(--color-hover-soft)] px-3 py-3 md:block">
      <p className="text-body font-medium text-[var(--color-text)]">{sentence}</p>

      <p className="text-caption mt-1 text-[var(--color-text-muted)]">{basis}</p>
    </div>
  );
}

/**
 * LinkedScheduleBullets
 *
 * 연결 일정에 새 마감일이 적용되는 범위를 목록으로 보여 줍니다.
 *
 * @param props - LinkedScheduleBullets 컴포넌트 Props
 * @param props.nextDate - 고른 새 마감일. 없으면 날짜 대신 새 마감일이라고 적습니다
 * @param props.className - 목록에 더할 클래스
 */
function LinkedScheduleBullets({
  nextDate,
  className = "",
}: {
  nextDate: string;
  className?: string;
}) {
  const when = nextDate ? formatMonthDay(nextDate) : "새 마감일";

  return (
    <ul className={`text-caption list-disc space-y-1 pl-5 text-[var(--color-text)] ${className} `}>
      <li>프로젝트 소속 미완료 항목의 마감일이 {when}로 변경됩니다.</li>
      <li>목표에 연결되지 않은 태스크도 포함됩니다.</li>
      <li>완료 항목의 완료 상태·완료일과 보류 상태는 유지됩니다.</li>
    </ul>
  );
}

/**
 * LinkedCountBadge
 *
 * 연결된 미완료 항목의 전체 개수를 뱃지로 보여 줍니다.
 *
 * @param props - LinkedCountBadge 컴포넌트 Props
 * @param props.title - 뱃지가 세는 항목 이름
 * @param props.count - 전체 개수
 */
function LinkedCountBadge({ title, count }: { title: string; count: number }) {
  const label = `${title} ${count}개`;

  return (
    <Badge
      className="border border-[var(--color-border-strong)] bg-[var(--color-hover)] font-medium text-[var(--color-text-secondary)]"
      title={label}
      ariaLabel={label}
    >
      {count}
    </Badge>
  );
}

/**
 * LinkedItemList
 *
 * 마감일이 함께 바뀌는 목표나 태스크 이름을 보여 줍니다.
 * 목록은 3개까지 보여주고, 나머지는 외 몇 개로 적습니다.
 *
 * @param props - LinkedItemList 컴포넌트 Props
 * @param props.items - 보여줄 항목
 * @param props.empty - 항목이 없을 때 문구
 * @param props.icon - 이름 앞에 둘 아이콘
 */
function LinkedItemList({
  items,
  empty,
  icon,
}: {
  items: LinkedScheduleItem[];
  empty: string;
  icon: LucideIcon;
}) {
  if (items.length === 0) {
    return <p className="text-caption text-[var(--color-text-muted)]">{empty}</p>;
  }

  const visible = items.slice(0, LINKED_LIST_LIMIT);
  const hidden = items.length - visible.length;

  return (
    <div>
      <ul className="space-y-1">
        {visible.map((item) => (
          <li
            key={item.id}
            className="text-caption flex min-w-0 items-center gap-1.5 text-[var(--color-text)]"
          >
            <AppIcon
              icon={icon}
              size="sm"
              className="shrink-0 text-[var(--color-text-secondary)]"
            />
            <span className="min-w-0">{item.title}</span>
          </li>
        ))}
      </ul>

      {hidden > 0 ? (
        <p className="text-caption mt-1 text-[var(--color-text-muted)]">외 {hidden}개</p>
      ) : null}
    </div>
  );
}

/**
 * LinkedCountCard
 *
 * 미완료 목표 또는 태스크 개수와 이름을 보여 줍니다.
 *
 * @param props - LinkedCountCard 컴포넌트 Props
 * @param props.icon - 목록 이름 앞에 둘 아이콘
 * @param props.title - 항목 이름
 * @param props.count - 전체 개수
 * @param props.items - 함께 바꿀 항목
 * @param props.empty - 항목이 없을 때 문구
 */
function LinkedCountCard({
  icon,
  title,
  count,
  items,
  empty,
}: {
  icon: LucideIcon;
  title: string;
  count: number;
  items: LinkedScheduleItem[];
  empty: string;
}) {
  return (
    <div className="min-w-0 rounded-[var(--radius-sm)] bg-[var(--color-hover-soft)] px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="text-body min-w-0 truncate !font-bold text-[var(--color-text)]">
          {title}
        </span>

        <LinkedCountBadge title={title} count={count} />
      </div>

      <div className="mt-2">
        <LinkedItemList items={items} empty={empty} icon={icon} />
      </div>
    </div>
  );
}

/**
 * LinkedScheduleSection
 *
 * 이 프로젝트에 연결된 미완료 목표와 태스크, 그리고 마감일이 어떻게 적용되는지 보여 줍니다.
 *
 * @param props - LinkedScheduleSection 컴포넌트 Props
 * @param props.nextDate - 고른 새 마감일
 * @param props.goals - 마감일을 함께 바꿀 미완료 목표
 * @param props.tasks - 마감일을 함께 바꿀 미완료 태스크
 * @param props.isPending - 연결 일정을 아직 불러오는 중인지 여부
 * @param props.detailsOpen - 좁은 화면에서 연결 일정을 펼쳤는지 여부
 * @param props.onToggleDetails - 연결 일정을 펼치거나 접을 때 실행되는 함수
 */
function LinkedScheduleSection({
  nextDate,
  goals,
  tasks,
  isPending,
  detailsOpen,
  onToggleDetails,
}: {
  nextDate: string;
  goals: LinkedScheduleItem[];
  tasks: LinkedScheduleItem[];
  isPending: boolean;
  detailsOpen: boolean;
  onToggleDetails: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
      <div className="p-3 md:p-4">
        <div className="hidden items-center gap-1.5 md:flex">
          <AppIcon icon={Link2} size="sm" className="shrink-0 text-[var(--color-text-secondary)]" />
          <p className="text-body min-w-0 truncate font-semibold text-[var(--color-text)]">
            연결 일정 자동 변경
          </p>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 text-left md:hidden"
          aria-expanded={detailsOpen}
          onClick={onToggleDetails}
        >
          <span className="text-body inline-flex min-w-0 items-center gap-1.5 font-semibold text-[var(--color-text)]">
            <AppIcon
              icon={Link2}
              size="sm"
              className="shrink-0 text-[var(--color-text-secondary)]"
            />
            <span className="truncate">연결 일정 자동 변경</span>
          </span>

          <AppIcon
            icon={ChevronDown}
            size="sm"
            className={`shrink-0 text-[var(--color-text-secondary)] transition-transform ${
              detailsOpen ? "rotate-180" : ""
            } `}
          />
        </button>

        <div className={detailsOpen ? undefined : "hidden md:block"}>
          {isPending ? (
            <p className="text-caption mt-3 text-[var(--color-text-muted)]">
              연결 일정을 확인하고 있습니다.
            </p>
          ) : (
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <LinkedCountCard
                icon={Target}
                title="미완료 목표"
                count={goals.length}
                items={goals}
                empty="미완료 목표가 없습니다."
              />
              <LinkedCountCard
                icon={ListTodo}
                title="미완료 태스크"
                count={tasks.length}
                items={tasks}
                empty="미완료 태스크가 없습니다."
              />
            </div>
          )}

          <LinkedScheduleBullets nextDate={nextDate} className="mt-3" />

          <div className="mt-3 hidden items-start gap-2 rounded-[var(--radius-sm)] bg-[var(--color-hover-soft)] px-3 py-2.5 md:flex">
            <AppIcon
              icon={Info}
              size="sm"
              className="mt-0.5 shrink-0 text-[var(--color-text-muted)]"
            />

            <p className="text-caption text-[var(--color-text-secondary)]">
              새 마감일 기준으로 지연 여부를 다시 계산합니다.
              <span className="mt-0.5 block">진행·보류 상태를 일괄 변경하지 않습니다.</span>
            </p>
          </div>

          <p className="text-caption mt-3 flex items-start gap-1.5 text-[var(--color-text-secondary)] md:hidden">
            <AppIcon
              icon={Info}
              size="sm"
              className="mt-0.5 shrink-0 text-[var(--color-text-muted)]"
            />
            <span>지연 여부는 새 마감일 기준으로 다시 계산됩니다.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * ChangeProjectDeadlineModal
 *
 * 새 마감일과 변경 사유를 받고, 연결 일정에 적용되는 범위를 확인한 뒤 변경을 적용합니다.
 *
 * @param props - ChangeProjectDeadlineModal 컴포넌트 Props
 * @param props.isOpen - 모달이 열려 있는지 여부
 * @param props.title - 모달 제목. 이 모달을 연 버튼 제목
 * @param props.icon - 모달 헤더 아이콘. 이 모달을 연 버튼 아이콘
 * @param props.projectId - 연결 일정을 불러올 프로젝트 번호
 * @param props.currentDate - 지금 저장된 마감일
 * @param props.minDate - 새 마감일로 고를 수 있는 가장 이른 날
 * @param props.delayDays - 지연 일수. 0이면 지연 안내를 숨깁니다
 * @param props.onClose - 모달을 닫을 때 실행되는 함수
 * @param props.onSubmit - 날짜와 사유를 적용할 때 실행되는 함수
 */
export default function ChangeProjectDeadlineModal({
  isOpen,
  title,
  icon,
  projectId,
  currentDate,
  minDate,
  delayDays,
  onClose,
  onSubmit,
}: ChangeProjectDeadlineModalProps) {
  const titleId = useId();
  const wide = useWideDeadlineLayout();

  const [nextDate, setNextDate] = useState("");

  const [reason, setReason] = useState("");

  const [dateError, setDateError] = useState("");

  const [reasonError, setReasonError] = useState("");

  const [detailsOpen, setDetailsOpen] = useState(false);

  // 닫히면 입력값과 오류를 처음으로 돌린다.
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (!isOpen) {
      setNextDate("");
      setReason("");
      setDateError("");
      setReasonError("");
      setDetailsOpen(false);
    }
  }

  const canLoadLinked = isOpen && projectId != null;

  const goalsQuery = useQuery({
    queryKey: projectId == null ? goalQueryKeys.list("all") : goalQueryKeys.list(projectId),
    queryFn: () => getGoals(projectId ?? 0),
    enabled: canLoadLinked,
  });

  const tasksQuery = useQuery({
    queryKey: projectId == null ? taskQueryKeys.list("all") : taskQueryKeys.list(projectId),
    queryFn: () => getTasks(projectId ?? 0),
    enabled: canLoadLinked,
  });

  const openGoals = (goalsQuery.data ?? [])
    .filter((goal) => goal.status !== "COMPLETED")
    .map((goal) => ({
      id: goal.id,
      title: goal.title,
    }));

  const openTasks = (tasksQuery.data ?? [])
    .filter((task) => task.status !== "DONE")
    .map((task) => ({
      id: task.id,
      title: task.title,
    }));

  const isLinkedPending = canLoadLinked && (goalsQuery.isLoading || tasksQuery.isLoading);

  const reasonPlaceholder = wide
    ? "일정을 변경하는 이유와 추가로 필요한 작업을 입력해주세요."
    : "일정을 변경하는 이유를 입력해주세요.";

  const handleSubmit = () => {
    const trimmedReason = reason.trim();

    const nextDateError = nextDate
      ? nextDate < minDate
        ? "오늘 이후의 날짜만 선택할 수 있습니다."
        : ""
      : "새로운 마감일을 선택해주세요.";

    const nextReasonError = trimmedReason ? "" : "변경 사유를 입력해주세요.";

    setDateError(nextDateError);
    setReasonError(nextReasonError);

    if (nextDateError || nextReasonError) {
      return;
    }

    onSubmit(nextDate, trimmedReason);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      labelledBy={titleId}
      padded={false}
      maxHeightClassName="max-h-[min(920px,calc(100dvh-2rem))]"
    >
      <Modal.Header
        id={titleId}
        title={title}
        description="변경할 날짜와 연결 항목의 변경 범위를 확인해주세요."
        descriptionClassName="max-md:hidden"
        onClose={onClose}
        icon={<AppIcon icon={icon} size="sm" />}
      />

      <Modal.Body>
        <div className={` ${modalSidePaddingClassName} flex flex-col gap-5 py-4 md:py-5`}>
          <div className="grid gap-4 md:grid-cols-2 md:items-start md:gap-6">
            <div className="order-2 md:order-1">
              <DatePicker
                variant="inline"
                value={nextDate}
                onChange={(value) => {
                  setNextDate(value);
                  setDateError("");
                }}
                min={minDate}
              />
            </div>

            <div className="order-1 flex min-w-0 flex-col gap-4 md:order-2">
              <CurrentDeadlineDisplay date={currentDate} delayDays={delayDays} />

              <div>
                <DeadlineFieldLabel label="새 마감일" required />

                <ReadOnlyDateField value={nextDate} placeholder="날짜를 선택해주세요." />

                {dateError ? <FieldNotice tone="danger">{dateError}</FieldNotice> : null}
              </div>

              {nextDate ? (
                <DeadlineShiftSummary
                  currentDate={currentDate}
                  nextDate={nextDate}
                  placement="box"
                />
              ) : null}
            </div>
          </div>

          {nextDate ? (
            <DeadlineShiftSummary
              currentDate={currentDate}
              nextDate={nextDate}
              placement="center"
            />
          ) : null}

          <LinkedScheduleSection
            nextDate={nextDate}
            goals={openGoals}
            tasks={openTasks}
            isPending={isLinkedPending}
            detailsOpen={detailsOpen}
            onToggleDetails={() => {
              setDetailsOpen((open) => !open);
            }}
          />

          <div>
            <DeadlineFieldLabel
              label="변경 사유"
              required
              counter={`${reason.length}/${REASON_LIMIT}`}
              accessory={
                <InfoTooltip
                  title="변경 사유"
                  description="변경 사유와 적용 내역이 이력에 기록됩니다."
                />
              }
            />

            <Textarea
              value={reason}
              maxLength={REASON_LIMIT}
              rows={4}
              placeholder={reasonPlaceholder}
              onChange={(event) => {
                setReason(event.target.value);
                setReasonError("");
              }}
            />

            {reasonError ? <FieldNotice tone="danger">{reasonError}</FieldNotice> : null}

            <p className="text-caption mt-2 hidden text-[var(--color-text-muted)] md:block">
              변경 전후 날짜·사유·영향받은 항목 수가 변경 이력에 기록됩니다.
            </p>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
          <p className="text-caption text-center text-[var(--color-text-muted)] md:min-w-0 md:flex-1 md:text-left">
            <span className="md:hidden">적용 후 프로젝트 화면에서 저장해주세요.</span>
            <span className="hidden md:inline">
              적용 후 프로젝트 화면에서 변경사항을 저장해주세요.
            </span>
          </p>

          <div className="grid grid-cols-2 gap-2 md:flex md:shrink-0">
            <SecondaryButton
              size="modal"
              onClick={onClose}
              className="w-full justify-center md:w-auto md:min-w-[96px]"
            >
              취소
            </SecondaryButton>

            <PrimaryButton
              size="modal"
              onClick={handleSubmit}
              className="w-full justify-center md:w-auto md:min-w-[112px]"
            >
              변경 적용
            </PrimaryButton>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

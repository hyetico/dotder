"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import Badge from "@/components/ui/badge/Badge";
import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import { AppIcon, RotateCcw, Search, UserRound, Users, X } from "@/components/ui/icon";
import SearchInput from "@/components/ui/input/SearchInput";
import List from "@/components/ui/list/List";
import MemberAvatar from "@/components/ui/MemberAvatar";
import Modal, { modalSidePaddingClassName } from "@/components/ui/modal/Modal";
import LineTabMenu, { type TabMenuItem } from "@/components/ui/tab/LineTabMenu";

import {
  PROJECT_TEAM_NONE,
  PROJECT_TEAM_PERSONAL,
  type ProjectTeamOption,
} from "@/features/projects/utils/projectTeam";

import { getMemberInitial, getTeamMembers, type TeamMember } from "@/lib/mock/teamMembers";

import type { ListColumn, ListRow } from "@/components/ui/list/List";

type TeamCategory = "team" | "member";

type TeamScopeModalBase = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  icon: ReactNode;
  options: ProjectTeamOption[];
  teamValue: string;
};

type TeamScopeModalProps = TeamScopeModalBase &
  (
    | {
        mode: "team";
        onConfirm: (value: string) => void;
      }
    | {
        mode: "admin";
        selectedMemberId?: number;
        onConfirm: (member: TeamMember) => void;
      }
  );

const categoryMeta: Record<
  TeamCategory,
  {
    label: string;
    placeholder: string;
    empty: string;
  }
> = {
  team: {
    label: "팀",
    placeholder: "팀 이름으로 검색",
    empty: "팀이 없습니다.",
  },
  member: {
    label: "멤버",
    placeholder: "이름, 역할, 이메일로 검색해보세요...",
    empty: "멤버가 없습니다.",
  },
};

const memberListColumns: ListColumn[] = [
  {
    id: "name",
    header: "이름",
    width: 36,
    headerWidth: 36,
    align: "start",
    mobile: "title",
  },
  {
    id: "role",
    header: "역할",
    width: 28,
    headerWidth: 28,
    align: "start",
    mobile: "meta",
  },
  {
    id: "email",
    header: "이메일",
    width: 36,
    headerWidth: 36,
    align: "start",
    mobile: "meta",
  },
];

const radioColumn: ListColumn = {
  id: "pick",
  header: "",
  width: 8,
  headerWidth: 8,
  align: "center",
  headerAlign: "center",
  mobile: "hidden",
};

const memberPickColumns: ListColumn[] = [
  radioColumn,
  {
    ...memberListColumns[0],
    width: 34,
    headerWidth: 34,
  },
  {
    ...memberListColumns[1],
    width: 28,
    headerWidth: 28,
  },
  {
    ...memberListColumns[2],
    width: 30,
    headerWidth: 30,
  },
];

const teamListColumns: ListColumn[] = [
  radioColumn,
  {
    id: "name",
    header: "팀 이름",
    width: 64,
    headerWidth: 64,
    align: "start",
    mobile: "title",
  },
  {
    id: "count",
    header: "멤버 수",
    width: 28,
    headerWidth: 28,
    align: "center",
    textAlign: "center",
    mobile: "meta",
  },
];

const selectedRowClassName = "bg-[var(--color-hover-strong)]";

const scopeListHeaderClassName = "bg-[#f7f8fa]";

const scopeListRowHeight = 48;

const scopeListHeaderHeight = 40;

/**
 * 팀 6줄, 또는 관리자 변경의 비교 칸과 멤버 5줄이
 * 푸터 바로 위까지 보이도록 높이를 고정합니다.
 */
const teamScopeModalPanelClassName = `
  h-[min(39rem,calc(100dvh-2rem))]
  min-h-[min(39rem,calc(100dvh-2rem))]
`;

const noLinkedTeamLabel = "연결된 팀이 없습니다.";

/**
 * includesQuery
 *
 * 검색어가 비어 있거나 글자에 포함되면 참으로 봅니다.
 *
 * @param value - 비교할 글자
 * @param query - 사용자가 입력한 검색어
 * @returns 검색 결과에 포함할지 여부
 */
function includesQuery(value: string, query: string) {
  if (!query) {
    return true;
  }

  return value.toLowerCase().includes(query);
}

/**
 * ScopeRadio
 *
 * 팀이나 멤버를 하나만 고르는 라디오입니다.
 *
 * @param props - ScopeRadio 컴포넌트 Props
 * @param props.selected - 현재 고른 항목인지 여부
 * @param props.label - 버튼 접근 이름
 * @param props.onSelect - 항목을 고르면 실행되는 함수
 */
function ScopeRadio({
  selected,
  label,
  onSelect,
}: {
  selected: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      className="inline-flex h-8 w-full items-center justify-center"
    >
      <svg
        aria-hidden
        viewBox="0 0 22 22"
        overflow="visible"
        className="size-[22px] shrink-0 overflow-visible"
      >
        <circle cx="11" cy="11" r="10" fill="#ffffff" />
        {selected ? (
          <>
            <circle cx="11" cy="11" r="10" fill="none" stroke="#111111" strokeWidth="2" />
            <circle cx="11" cy="11" r="4.5" fill="#111111" />
          </>
        ) : (
          <circle cx="11" cy="11" r="10" fill="none" stroke="#c6c6cb" strokeWidth="1.5" />
        )}
      </svg>
    </button>
  );
}

/**
 * ScopeLabel
 *
 * 아이콘이나 이니셜 옆에 이름을 한 줄로 보여 줍니다.
 *
 * @param props - ScopeLabel 컴포넌트 Props
 * @param props.mark - 이름 앞에 둘 아이콘이나 이니셜
 * @param props.label - 표시할 이름
 */
function ScopeLabel({ mark, label }: { mark: ReactNode; label: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {mark}

      <span className="min-w-0 truncate font-semibold text-[var(--color-text)]">{label}</span>
    </span>
  );
}

/**
 * TeamMemberSearchButton
 *
 * 팀 목록에서 그 팀의 멤버 목록으로 이동하는 버튼입니다.
 *
 * @param props - TeamMemberSearchButton 컴포넌트 Props
 * @param props.label - 버튼 접근 이름
 * @param props.onClick - 멤버 목록으로 이동할 때 실행되는 함수
 */
function TeamMemberSearchButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
    >
      <AppIcon icon={Search} size="md" />
    </button>
  );
}

/**
 * CurrentMemberBadge
 *
 * 관리자 변경을 열었을 때의 관리자 옆에 현재 표시를 붙입니다.
 */
function CurrentMemberBadge() {
  return (
    <Badge size="sm" className="bg-[#eceff3] font-medium text-[var(--color-text-secondary)]">
      현재
    </Badge>
  );
}

/**
 * AdminHandoffSide
 *
 * 관리자 변경의 이전 값이나 고른 값을 한 칸으로 보여 줍니다.
 *
 * @param props - AdminHandoffSide 컴포넌트 Props
 * @param props.label - 칸 이름
 * @param props.member - 그 칸에 보여줄 멤버. 없으면 비움
 * @param props.muted - 왼쪽 이전 값 칸인지 여부
 */
function AdminHandoffSide({
  label,
  member,
  muted = false,
}: {
  label: string;
  member: TeamMember | null;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 px-3 py-2 ${
        muted ? "bg-[#f4f5f7]" : `border-l border-[var(--color-border)] bg-[var(--color-surface)]`
      } `}
    >
      <span className="text-caption shrink-0 rounded-[6px] bg-[#e6e8ec] px-1.5 py-0.5 font-medium text-[var(--color-text-secondary)]">
        {label}
      </span>

      {member ? (
        <ScopeLabel
          label={member.name}
          mark={
            <MemberAvatar
              label={getMemberInitial(member.name)}
              title={member.name}
              bordered={false}
            />
          }
        />
      ) : (
        <span className="text-caption text-[var(--color-text-muted)]">없음</span>
      )}
    </div>
  );
}

/**
 * AdminHandoff
 *
 * 관리자 변경에서 바꾸기 전과 고른 멤버를 나란히 보여 줍니다.
 *
 * @param props - AdminHandoff 컴포넌트 Props
 * @param props.before - 창을 열었을 때의 관리자
 * @param props.after - 지금 고른 멤버
 */
function AdminHandoff({ before, after }: { before: TeamMember | null; after: TeamMember | null }) {
  return (
    <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
      <AdminHandoffSide label="변경 전" member={before} muted />
      <AdminHandoffSide label="변경 후" member={after} />
    </div>
  );
}

/**
 * findMember
 *
 * 멤버 아이디로 목록에서 한 명을 찾습니다.
 *
 * @param members - 찾을 멤버 목록
 * @param memberId - 찾을 멤버 아이디
 * @returns 멤버. 없으면 null
 */
function findMember(members: TeamMember[], memberId?: number) {
  if (memberId == null) {
    return null;
  }

  return members.find((member) => member.id === memberId) ?? null;
}

/**
 * teamMemberCount
 *
 * 팀에 속한 멤버 수를 셉니다.
 *
 * @param value - 팀 아이디 문자열
 * @returns 멤버 수
 */
function teamMemberCount(value: string) {
  const teamId = Number(value);

  if (!Number.isInteger(teamId) || teamId <= 0) {
    return 0;
  }

  return getTeamMembers(teamId).length;
}

/**
 * memberIdentity
 *
 * 멤버 이니셜과 이름을 리스트 칸에 맞춥니다.
 *
 * @param member - 표시할 멤버
 * @returns 이름 칸에 넣을 내용
 */
function memberIdentity(member: TeamMember) {
  return (
    <ScopeLabel
      label={member.name}
      mark={
        <MemberAvatar label={getMemberInitial(member.name)} title={member.name} bordered={false} />
      }
    />
  );
}

/**
 * memberListRows
 *
 * 선택한 팀의 멤버를 이름, 역할, 이메일 순으로 리스트 행에 담습니다.
 * 관리자를 고를 때는 각 줄 앞에 라디오를 붙입니다.
 *
 * @param members - 표시할 멤버
 * @param selection - 관리자 한 명을 고를 때 쓰는 선택 상태
 * @param selection.selectedId - 현재 고른 멤버 아이디
 * @param selection.currentId - 창을 열었을 때의 관리자 아이디
 * @param selection.onSelect - 멤버를 고르면 실행되는 함수
 * @returns 공용 리스트에 넣을 행
 */
function memberListRows(
  members: TeamMember[],
  selection?: {
    selectedId?: number;
    currentId?: number;
    onSelect: (memberId: number) => void;
  },
): ListRow[] {
  return members.map((member) => {
    const selected = selection?.selectedId === member.id;
    const current = selection?.currentId === member.id;

    return {
      id: String(member.id),
      className: selected ? selectedRowClassName : undefined,
      onClick: selection ? () => selection.onSelect(member.id) : undefined,
      cells: {
        pick: selection ? (
          <ScopeRadio
            selected={selected}
            label={selected ? `${member.name} 선택됨` : `${member.name} 선택`}
            onSelect={() => selection.onSelect(member.id)}
          />
        ) : undefined,
        name: memberIdentity(member),
        role: (
          <span className="flex w-full min-w-0 items-center gap-1.5">
            <span className="min-w-0 truncate text-[var(--color-text-secondary)]">
              {member.role}
            </span>
            {current ? <CurrentMemberBadge /> : null}
          </span>
        ),
        email: (
          <span title={member.email} className="text-[var(--color-text-secondary)]">
            {member.email}
          </span>
        ),
      },
    };
  });
}

/**
 * teamListRows
 *
 * 팀 이름, 멤버 수, 라디오, 멤버 보기 버튼을 리스트 행에 담습니다.
 *
 * @param teams - 표시할 팀
 * @param selectedValue - 현재 고른 팀 값
 * @param onSelect - 팀을 고르면 실행되는 함수
 * @param onSearchMembers - 그 팀 멤버를 볼 때 실행되는 함수
 * @returns 공용 리스트에 넣을 행
 */
function teamListRows(
  teams: ProjectTeamOption[],
  selectedValue: string,
  onSelect: (value: string) => void,
  onSearchMembers: (value: string) => void,
): ListRow[] {
  return teams.map((option) => {
    const selected = option.value === selectedValue;

    return {
      id: option.value,
      className: selected ? selectedRowClassName : undefined,
      onClick: () => onSelect(option.value),
      cells: {
        pick: (
          <ScopeRadio
            selected={selected}
            label={selected ? `${option.label} 선택됨` : `${option.label} 선택`}
            onSelect={() => onSelect(option.value)}
          />
        ),
        name: (
          <ScopeLabel
            label={option.label}
            mark={<span className="shrink-0 text-lg leading-none">{option.icon}</span>}
          />
        ),
        count: (
          <span className="text-[var(--color-text-secondary)] tabular-nums">
            {teamMemberCount(option.value)}명
          </span>
        ),
      },
      action: (
        <TeamMemberSearchButton
          label={`${option.label} 멤버 보기`}
          onClick={() => onSearchMembers(option.value)}
        />
      ),
    };
  });
}

/**
 * ScopeList
 *
 * 팀 선택 창에서 쓰는 고정 높이 리스트입니다.
 * 고르는 목록이면 라디오 그룹으로 읽힙니다.
 *
 * @param props - ScopeList 컴포넌트 Props
 * @param props.columns - 리스트 열
 * @param props.rows - 리스트 행
 * @param props.groupLabel - 라디오 그룹 접근 이름. 없으면 그룹으로 읽지 않음
 * @param props.showAction - 오른쪽 버튼 칸을 둘지 여부
 */
function ScopeList({
  columns,
  rows,
  groupLabel,
  showAction = false,
}: {
  columns: ListColumn[];
  rows: ListRow[];
  groupLabel?: string;
  showAction?: boolean;
}) {
  const list = (
    <List
      columns={columns}
      rows={rows}
      headerPaddingLeft={12}
      headerPaddingRight={12}
      headerHeight={scopeListHeaderHeight}
      rowHeight={scopeListRowHeight}
      minWidth={0}
      stackOnMobile={false}
      showAction={showAction}
      headerClassName={scopeListHeaderClassName}
      actionGap={4}
    />
  );

  if (!groupLabel) {
    return list;
  }

  return (
    <div role="radiogroup" aria-label={groupLabel}>
      {list}
    </div>
  );
}

/**
 * TeamScopeModal
 *
 * 팀 변경과 관리자 변경이 함께 쓰는 선택 창입니다.
 * 관리자 변경은 연결된 팀의 멤버 탭으로 열리고, 그 팀 멤버 한 명을 고릅니다.
 *
 * @param props - TeamScopeModal 컴포넌트 Props
 * @param props.isOpen - 선택 창이 열려 있는지 여부
 * @param props.onClose - 선택 창을 닫을 때 실행되는 함수
 * @param props.title - 선택 창 제목
 * @param props.closeLabel - 닫기 버튼 접근 이름
 * @param props.icon - 제목 옆에 둘 아이콘
 * @param props.options - 고를 수 있는 팀 목록
 * @param props.teamValue - 현재 연결된 팀 값
 * @param props.mode - 팀 변경인지 관리자 변경인지
 * @param props.onConfirm - 고른 팀 또는 멤버를 확정할 때 실행되는 함수
 * @param props.selectedMemberId - 관리자 변경에서 현재 관리자의 멤버 아이디
 */
export default function TeamScopeModal(props: TeamScopeModalProps) {
  const { isOpen, onClose, title, closeLabel, icon, options, teamValue, mode } = props;

  const selectedMemberId = props.mode === "admin" ? props.selectedMemberId : undefined;

  const titleId = useId();

  const searchInputRef = useRef<HTMLInputElement>(null);

  const [wasOpen, setWasOpen] = useState(false);

  const [draft, setDraft] = useState(teamValue);

  const [memberDraft, setMemberDraft] = useState(selectedMemberId);

  const [openedMemberId, setOpenedMemberId] = useState(selectedMemberId);

  const [query, setQuery] = useState("");

  const [category, setCategory] = useState<TeamCategory>(mode === "admin" ? "member" : "team");

  if (!isOpen && wasOpen) {
    setWasOpen(false);
  }

  if (isOpen && !wasOpen) {
    setWasOpen(true);
    setDraft(teamValue);
    setMemberDraft(selectedMemberId);
    setOpenedMemberId(selectedMemberId);
    setQuery("");
    setCategory(mode === "admin" ? "member" : "team");
  }

  const selectableOptions = options.filter((option) => option.value !== PROJECT_TEAM_NONE);

  const activeTeamValue = mode === "admin" ? teamValue : draft;

  const hasActiveTeam = selectableOptions.some((option) => option.value === activeTeamValue);

  const activeCategory: TeamCategory = mode === "team" && !hasActiveTeam ? "team" : category;

  const normalizedQuery = query.trim().toLowerCase();

  const activeOption = selectableOptions.find((option) => option.value === activeTeamValue);

  const teamPool =
    mode === "admin"
      ? selectableOptions.filter((option) => option.value === teamValue)
      : selectableOptions;

  const visibleTeams = teamPool.filter((option) => includesQuery(option.label, normalizedQuery));

  const selectedTeamId = Number(activeTeamValue);

  const members =
    hasActiveTeam && Number.isInteger(selectedTeamId) && selectedTeamId > 0
      ? getTeamMembers(selectedTeamId)
      : [];

  const visibleMembers = members.filter((member) =>
    [member.role, member.name, member.email].some((field) => includesQuery(field, normalizedQuery)),
  );

  const openedMember = findMember(members, openedMemberId);

  const draftMember = findMember(members, memberDraft);

  const canConfirmTeam =
    hasActiveTeam || draft === PROJECT_TEAM_NONE || draft === PROJECT_TEAM_PERSONAL;

  const canSubmit =
    mode === "admin" ? members.some((member) => member.id === memberDraft) : canConfirmTeam;

  const canReset =
    mode === "admin"
      ? query.trim() !== "" || memberDraft !== openedMemberId
      : hasActiveTeam || query.trim() !== "";

  const activeMeta = categoryMeta[activeCategory];

  const emptyLabel = normalizedQuery
    ? "검색 결과가 없습니다."
    : mode === "admin" && !hasActiveTeam
      ? noLinkedTeamLabel
      : activeMeta.empty;

  const categoryItems: TabMenuItem<TeamCategory>[] = [
    {
      id: "team",
      label: categoryMeta.team.label,
      icon: Users,
      disabled: mode === "admin",
      title: mode === "admin" ? "관리자 변경에서는 팀을 고를 수 없습니다." : undefined,
    },
    {
      id: "member",
      label: categoryMeta.member.label,
      icon: UserRound,
      disabled: mode === "team" && !hasActiveTeam,
      title:
        mode === "team" && !hasActiveTeam
          ? "팀을 선택하지 않으면 멤버를 볼 수 없습니다."
          : undefined,
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    searchInputRef.current?.focus();
  }, [isOpen, activeCategory]);

  const selectTeam = (nextValue: string) => {
    setDraft(nextValue);
  };

  const showTeamMembers = (nextValue: string) => {
    setDraft(nextValue);
    setQuery("");
    setCategory("member");
  };

  const leaveMembers = () => {
    setQuery("");
    setCategory("team");
  };

  const selectMember = (memberId: number) => {
    setMemberDraft(memberId);
  };

  const reset = () => {
    if (mode === "admin") {
      setMemberDraft(openedMemberId);
      setQuery("");
      setCategory("member");
      return;
    }

    setDraft(PROJECT_TEAM_NONE);
    setCategory("team");
    setQuery("");
  };

  const confirm = () => {
    if (props.mode === "admin") {
      const member = members.find((item) => item.id === memberDraft);

      if (!member) {
        return;
      }

      props.onConfirm(member);
      onClose();
      return;
    }

    if (!canConfirmTeam) {
      return;
    }

    props.onConfirm(hasActiveTeam ? draft : PROJECT_TEAM_NONE);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      padded={false}
      labelledBy={titleId}
      maxWidthClassName="max-w-[560px]"
      panelClassName={teamScopeModalPanelClassName}
    >
      <Modal.Header
        id={titleId}
        title={title}
        onClose={onClose}
        closeLabel={closeLabel}
        icon={icon}
      />

      <div className={`shrink-0 ${modalSidePaddingClassName} pt-4`}>
        <LineTabMenu
          ariaLabel={mode === "admin" ? "관리자 변경" : "팀 보기"}
          value={activeCategory}
          items={categoryItems}
          onChange={(next) => {
            setCategory(next);
            setQuery("");
          }}
        />

        <SearchInput
          className="mt-3"
          value={query}
          onChange={setQuery}
          placeholder={activeMeta.placeholder}
          ariaLabel={activeMeta.placeholder}
          inputRef={searchInputRef}
          leading={
            activeCategory === "member" && activeOption ? (
              <>
                <span
                  className={`inline-flex max-w-[11rem] shrink-0 items-center gap-1 rounded-full bg-[#f4f5f7] py-0.5 pl-1.5 ${
                    mode === "team" ? "pr-1" : "pr-1.5"
                  } `}
                >
                  <span className="text-xs leading-none">{activeOption.icon}</span>
                  <span className="text-caption min-w-0 truncate font-medium text-[var(--color-text)]">
                    {activeOption.label}
                  </span>
                  {mode === "team" ? (
                    <button
                      type="button"
                      aria-label={`${activeOption.label} 검색에서 빼기`}
                      onClick={leaveMembers}
                      className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                    >
                      <AppIcon icon={X} size="xs" />
                    </button>
                  ) : null}
                </span>
                <span aria-hidden className="mx-0.5 h-4 w-px shrink-0 bg-[var(--color-border)]" />
              </>
            ) : null
          }
        />

        {mode === "admin" ? <AdminHandoff before={openedMember} after={draftMember} /> : null}

        <p className="text-caption mt-3 text-right text-[var(--color-text-secondary)] tabular-nums">
          {activeCategory === "team"
            ? `총 ${visibleTeams.length}팀`
            : `총 ${visibleMembers.length}명`}
        </p>
      </div>

      <div
        className={`min-h-0 flex-1 overflow-y-auto overscroll-none ${modalSidePaddingClassName} pt-2 pb-3`}
      >
        {activeCategory === "team" ? (
          visibleTeams.length === 0 ? (
            <p className="text-caption px-2 py-10 text-center text-[var(--color-text-secondary)]">
              {emptyLabel}
            </p>
          ) : (
            <ScopeList
              columns={teamListColumns}
              rows={teamListRows(visibleTeams, activeTeamValue, selectTeam, showTeamMembers)}
              groupLabel="팀"
              showAction
            />
          )
        ) : visibleMembers.length === 0 ? (
          <p className="text-caption px-2 py-10 text-center text-[var(--color-text-secondary)]">
            {emptyLabel}
          </p>
        ) : (
          <ScopeList
            columns={mode === "admin" ? memberPickColumns : memberListColumns}
            rows={memberListRows(
              visibleMembers,
              mode === "admin"
                ? {
                    selectedId: memberDraft,
                    currentId: openedMemberId,
                    onSelect: selectMember,
                  }
                : undefined,
            )}
            groupLabel={mode === "admin" ? "멤버" : undefined}
          />
        )}
      </div>

      <Modal.Footer>
        <SecondaryButton
          size="modal"
          onClick={reset}
          disabled={!canReset}
          icon={<AppIcon icon={RotateCcw} size="sm" />}
          className="mr-auto"
        >
          초기화
        </SecondaryButton>

        <SecondaryButton size="modal" onClick={onClose}>
          취소
        </SecondaryButton>

        <PrimaryButton size="modal" onClick={confirm} disabled={!canSubmit}>
          {mode === "admin" ? "확인" : "설정"}
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  );
}

"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

import { AppIcon, ChevronDown } from "@/components/ui/icon";

/*
 * 펼침 리스트는 부모 너비의 100%다.
 * 열 너비는 리스트 100%에 대한 비율이다.
 * 헤더 글자는 가운데 맞추고, 칸 정렬은 열의 align을 따른다.
 * 상세가 있는 행은 오른쪽 화살표로 접고 펼친다.
 * 펼치면 요약 줄 아래에 상세 칸이 붙는다.
 * 768px 위에서는 minWidth보다 좁아지면 가로 스크롤이 생긴다.
 * 768px 아래에서는 헤더를 숨긴다.
 * title은 첫 줄에 이어 붙이고, aside는 그 줄 오른쪽에 둔다.
 * meta는 첫 줄 아래에 쌓고, 값 앞에 헤더 글자를 붙인다.
 * 펼친 상세는 요약 아래에 두고, 넓은 화면의 가로 배치는 세로로 쌓는다.
 */

export type ExpandableListAlign = "start" | "center" | "end";

/**
 * 768px 아래에서의 열 역할.
 * title은 첫 줄, aside는 첫 줄 오른쪽, meta는 그 아래, hidden은 숨긴다.
 */
export type ExpandableListMobileRole = "title" | "aside" | "meta" | "hidden";

export type ExpandableListColumn = {
  id: string;
  header: ReactNode;
  /** 리스트 너비 100%에 대한 열 비율 */
  width: number;
  /** 칸 내용 정렬. 없으면 가운데 */
  align?: ExpandableListAlign;
  /** 헤더 정렬. 없으면 가운데 */
  headerAlign?: ExpandableListAlign;
  /**
   * 768px 아래에서의 역할.
   * 없으면 첫 열은 title, 나머지는 meta다.
   */
  mobile?: ExpandableListMobileRole;
  /**
   * 768px 아래에서 메타 값 앞에 두는 표시.
   * 없으면 header가 글자일 때 그 글자를 둔다.
   * 빈 글자를 주면 표시를 두지 않는다.
   */
  mobileHeader?: ReactNode;
};

export type ExpandableListRow = {
  id: string;
  cells: Record<string, ReactNode>;
  /**
   * 펼치면 요약 줄 아래에 두는 내용.
   * 없으면 화살표를 두지 않는다.
   */
  detail?: ReactNode;
  /** 접기 버튼 이름. 없으면 "이 행" */
  label?: string;
};

type ExpandableListProps = {
  columns: ExpandableListColumn[];
  rows: ExpandableListRow[];
  /** 처음에 펼쳐 둘 행 id */
  defaultExpandedIds?: string[];
  /** 헤더와 행의 왼쪽 패딩(px) */
  headerPaddingLeft?: number;
  /** 헤더와 행의 오른쪽 패딩(px) */
  headerPaddingRight?: number;
  /**
   * 리스트 내용의 최소 너비(px).
   * 영역이 이보다 좁아지면 가로 스크롤이 생긴다.
   */
  minWidth?: number;
  className?: string;
  /**
   * 넓은 화면 요약 줄 클래스.
   * 없으면 한 줄 높이를 유지합니다.
   */
  summaryClassName?: string;
  /** 행이 없을 때 보여 주는 문구 */
  empty?: ReactNode;
  /** 펼친 상세 칸 클래스. 없으면 기본 배경을 씁니다 */
  detailClassName?: string;
};

const justifyClass: Record<ExpandableListAlign, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
};

const textAlignClass: Record<ExpandableListAlign, string> = {
  start: "text-left",
  center: "text-center",
  end: "text-right",
};

const chevronSlotWidth = 28;

/**
 * clampPercent
 *
 * 열 비율을 0에서 100 사이로 맞춥니다.
 *
 * @param value - 열 비율
 * @returns 0 이상 100 이하의 비율
 */
function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

/**
 * resolvePadding
 *
 * 패딩 값을 0 이상의 픽셀로 맞춥니다.
 *
 * @param value - 패딩(px)
 * @returns 0 이상의 패딩
 */
function resolvePadding(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

/**
 * isPlainText
 *
 * 말줄임을 걸 수 있는 글자인지 확인합니다.
 *
 * @param content - 칸에 넣은 내용
 * @returns 글자나 숫자면 true
 */
function isPlainText(content: ReactNode) {
  return (
    content == null ||
    typeof content === "string" ||
    typeof content === "number" ||
    typeof content === "boolean"
  );
}

/**
 * textTitle
 *
 * 글자 칸에 마우스를 올렸을 때 보여줄 전체 문구를 고릅니다.
 *
 * @param content - 칸에 넣은 내용
 * @returns 글자나 숫자면 그 문구. 아니면 undefined
 */
function textTitle(content: ReactNode) {
  if (typeof content === "string" || typeof content === "number") {
    return String(content);
  }

  return undefined;
}

/**
 * columnLabel
 *
 * 헤더가 글자면 그 글자를 돌려줍니다.
 *
 * @param header - 열 헤더
 * @returns 글자 헤더. 아니면 null
 */
function columnLabel(header: ReactNode) {
  if (typeof header === "string" || typeof header === "number") {
    return String(header);
  }

  return null;
}

/**
 * mobileMetaLabel
 *
 * 좁은 화면에서 값 앞에 둘 표시를 고릅니다.
 *
 * @param column - 열 정의
 * @returns 값 앞에 둘 표시. 없으면 null
 */
function mobileMetaLabel(column: ExpandableListColumn) {
  if (column.mobileHeader != null) {
    return column.mobileHeader;
  }

  return columnLabel(column.header);
}

/**
 * mobileRole
 *
 * 좁은 화면에서 열이 어디로 가는지 고릅니다.
 *
 * @param column - 열 정의
 * @param index - 열 순서
 * @returns 열 역할
 */
function mobileRole(column: ExpandableListColumn, index: number): ExpandableListMobileRole {
  return column.mobile ?? (index === 0 ? "title" : "meta");
}

/**
 * columnStyle
 *
 * 열 비율을 고정 너비 스타일로 바꿉니다.
 *
 * @param width - 리스트 너비 100%에 대한 비율
 * @returns 열 박스 스타일
 */
function columnStyle(width: number): CSSProperties {
  const percent = `${clampPercent(width)}%`;

  return {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: percent,
    width: percent,
    maxWidth: percent,
    minWidth: 0,
  };
}

/**
 * ExpandableListDetail
 *
 * 펼친 행 안에 제목, 본문, 오른쪽 부가 내용을 나란히 둡니다.
 *
 * @param props - ExpandableListDetail 컴포넌트 Props
 * @param props.icon - 제목 왼쪽 아이콘
 * @param props.label - 상세 제목
 * @param props.children - 상세 본문
 * @param props.asideLabel - 오른쪽 구역 제목
 * @param props.aside - 오른쪽 구역 내용
 */
export function ExpandableListDetail({
  icon,
  label,
  children,
  asideLabel,
  aside,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  asideLabel?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
      <div className="flex min-w-0 flex-1 gap-3">
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-indigo-50 text-indigo-500"
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-caption font-medium text-[var(--color-text-secondary)]">{label}</p>
          <div className="text-caption mt-1.5 leading-5 text-[var(--color-text-secondary)]">
            {children}
          </div>
        </div>
      </div>

      {aside ? (
        <div className="w-full shrink-0 lg:w-[240px]">
          {asideLabel ? (
            <p className="text-caption mb-2 flex items-center gap-1.5 text-[var(--color-text-muted)]">
              {asideLabel}
            </p>
          ) : null}
          {aside}
        </div>
      ) : null}
    </div>
  );
}

/**
 * ExpandableListCells
 *
 * 헤더나 행의 열을 같은 비율로 그립니다.
 *
 * @param props - ExpandableListCells 컴포넌트 Props
 * @param props.columns - 열 정의
 * @param props.cells - 행 칸. 없으면 헤더를 그린다
 * @param props.showChevron - 오른쪽 화살표 자리를 둘지
 */
function ExpandableListCells({
  columns,
  cells,
  showChevron,
  chevron,
}: {
  columns: ExpandableListColumn[];
  cells?: Record<string, ReactNode>;
  showChevron: boolean;
  chevron?: ReactNode;
}) {
  const isHeader = cells == null;

  return (
    <>
      <div className="flex h-full min-w-0 flex-1 items-center">
        {columns.map((column) => {
          const align = isHeader ? (column.headerAlign ?? "center") : (column.align ?? "center");
          const content = isHeader ? column.header : cells[column.id];

          return (
            <div
              key={column.id}
              role={isHeader ? "columnheader" : "cell"}
              className={`flex h-full min-w-0 items-center ${justifyClass[align]} ${
                isHeader
                  ? `text-caption font-medium text-[var(--color-text-secondary)]`
                  : `text-body text-[var(--color-text-secondary)] tabular-nums`
              } `}
              style={columnStyle(column.width)}
            >
              <div
                className={`max-w-full min-w-0 ${isPlainText(content) ? "truncate" : "w-full"} ${textAlignClass[align]} `}
                title={isHeader ? undefined : textTitle(content)}
              >
                {content}
              </div>
            </div>
          );
        })}
      </div>
      {showChevron ? (
        <span
          aria-hidden={chevron == null}
          className="flex shrink-0 items-center justify-center text-[var(--color-text-muted)]"
          style={{ width: chevronSlotWidth }}
        >
          {chevron}
        </span>
      ) : null}
    </>
  );
}

/**
 * ExpandChevron
 *
 * 행을 접고 펼치는 화살표를 그립니다.
 *
 * @param props - ExpandChevron 컴포넌트 Props
 * @param props.expanded - 행이 펼쳐져 있는지
 */
function ExpandChevron({ expanded }: { expanded: boolean }) {
  return (
    <AppIcon
      icon={ChevronDown}
      size="sm"
      className={`transition-transform ${expanded ? "rotate-180" : ""} `}
    />
  );
}

/**
 * ExpandableListMobileSummary
 *
 * 768px 아래에서 열을 첫 줄과 그 아래 줄로 쌓습니다.
 *
 * @param props - ExpandableListMobileSummary 컴포넌트 Props
 * @param props.columns - 열 정의
 * @param props.cells - 행 칸
 * @param props.showChevron - 화살표 자리를 둘지
 * @param props.expanded - 행이 펼쳐져 있는지
 */
function ExpandableListMobileSummary({
  columns,
  cells,
  showChevron,
  expanded,
}: {
  columns: ExpandableListColumn[];
  cells: Record<string, ReactNode>;
  showChevron: boolean;
  expanded: boolean;
}) {
  const grouped = columns.flatMap((column, index) => {
    const role = mobileRole(column, index);

    if (role === "hidden") {
      return [];
    }

    return [{ column, role }];
  });
  const titles = grouped.filter((item) => item.role === "title");
  const asides = grouped.filter((item) => item.role === "aside");
  const metas = grouped.filter((item) => item.role === "meta");

  return (
    <div className="flex min-h-[72px] w-full items-center gap-2 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <div className="text-body flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[var(--color-text-secondary)] tabular-nums">
            {titles.map(({ column }) => (
              <span key={column.id} className="max-w-full min-w-0">
                {cells[column.id]}
              </span>
            ))}
          </div>
          {asides.map(({ column }) => (
            <span key={column.id} className="text-body shrink-0 tabular-nums">
              {cells[column.id]}
            </span>
          ))}
        </div>

        {metas.length > 0 ? (
          <div className="mt-1.5 flex flex-col gap-1">
            {metas.map(({ column }) => {
              const label = mobileMetaLabel(column);

              return (
                <div
                  key={column.id}
                  className="text-caption flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1"
                >
                  {label ? (
                    <span className="shrink-0 text-[var(--color-text-muted)]">{label}</span>
                  ) : null}
                  <div className="min-w-0">{cells[column.id]}</div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {showChevron ? (
        <span
          aria-hidden
          className="flex w-7 shrink-0 items-center justify-center text-[var(--color-text-muted)]"
        >
          <ExpandChevron expanded={expanded} />
        </span>
      ) : null}
    </div>
  );
}

const summaryButtonClass = `
  w-full
  cursor-pointer

  bg-transparent

  text-left
  font-[inherit]

  transition-colors

  hover:bg-[var(--color-hover)]

  focus-visible:bg-[var(--color-hover)]
  focus-visible:outline
  focus-visible:outline-2
  focus-visible:-outline-offset-2
  focus-visible:outline-[var(--color-border-strong)]
`;

/**
 * ExpandableListEntry
 *
 * 요약 줄과, 펼쳐져 있으면 그 아래 상세를 그립니다.
 *
 * @param props - ExpandableListEntry 컴포넌트 Props
 * @param props.row - 행 데이터
 * @param props.expanded - 상세가 열려 있는지
 * @param props.detailId - 상세 영역의 id
 * @param props.insetStyle - 좌우 패딩
 * @param props.summaryClassName - 요약 줄 클래스
 * @param props.onToggle - 접고 펼칠 때 실행되는 함수
 * @param props.summary - 요약 줄 내용
 */
function ExpandableListEntry({
  row,
  expanded,
  detailId,
  insetStyle,
  summaryClassName,
  detailClassName,
  onToggle,
  summary,
}: {
  row: ExpandableListRow;
  expanded: boolean;
  detailId: string;
  insetStyle: CSSProperties;
  summaryClassName: string;
  detailClassName: string;
  onToggle: (id: string) => void;
  summary: ReactNode;
}) {
  const canExpand = row.detail != null;
  const rowLabel = row.label ?? "이 행";

  return (
    <div className="border-b border-[var(--color-border)] last:border-b-0">
      {canExpand ? (
        <button
          type="button"
          role="row"
          aria-expanded={expanded}
          aria-controls={detailId}
          onClick={() => onToggle(row.id)}
          className={` ${summaryButtonClass} ${summaryClassName} `}
          style={insetStyle}
        >
          {summary}
        </button>
      ) : (
        <div role="row" className={`w-full ${summaryClassName} `} style={insetStyle}>
          {summary}
        </div>
      )}

      {canExpand && expanded ? (
        <div
          id={detailId}
          role="region"
          aria-label={`${rowLabel} 상세`}
          className="pb-3"
          style={insetStyle}
        >
          <div
            className={`rounded-[var(--radius-md)] px-[10px] py-3 md:px-4 md:py-3.5 ${detailClassName} `}
          >
            {row.detail}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * ExpandableList
 *
 * 행을 펼치면 요약 줄 아래에 상세가 나오는 공용 리스트입니다.
 * 변경 이력처럼 한 줄 요약과 긴 내용을 같이 보여줄 때 씁니다.
 *
 * @param props - ExpandableList 컴포넌트 Props
 * @param props.columns - 열 정의
 * @param props.rows - 행 목록. detail이 있는 행만 펼친다
 * @param props.defaultExpandedIds - 처음에 펼쳐 둘 행 id
 * @param props.headerPaddingLeft - 왼쪽 패딩(px). 기본값은 20
 * @param props.headerPaddingRight - 오른쪽 패딩(px). 기본값은 20
 * @param props.minWidth - 가로 스크롤이 생기기 전 최소 너비(px). 기본값은 760
 * @param props.className - 리스트 박스에 더할 클래스
 * @param props.detailClassName - 펼친 상세 칸 클래스. 없으면 기본 배경
 * @param props.summaryClassName - 넓은 화면 요약 줄 클래스. 없으면 한 줄 높이
 * @param props.empty - 행이 없을 때 보여 주는 문구
 */
export default function ExpandableList({
  columns,
  rows,
  defaultExpandedIds = [],
  headerPaddingLeft = 20,
  headerPaddingRight = 20,
  minWidth = 760,
  className = "",
  detailClassName = "bg-[var(--color-hover-soft)]",
  summaryClassName = `
    flex
    h-[52px]
    items-center
  `,
  empty = "표시할 항목이 없습니다.",
}: ExpandableListProps) {
  const [expandedIds, setExpandedIds] = useState(() => new Set(defaultExpandedIds));
  const showChevron = rows.some((row) => row.detail != null);
  const paddingLeft = resolvePadding(headerPaddingLeft);
  const paddingRight = resolvePadding(headerPaddingRight);
  const insetStyle = {
    paddingLeft,
    paddingRight,
  };

  /**
   * toggleRow
   *
   * 행의 상세를 열거나 닫습니다.
   *
   * @param id - 행 id
   */
  function toggleRow(id: string) {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  const shellClass = `
    w-full
    min-w-0
    overflow-hidden

    rounded-[var(--radius-md)]

    border
    border-[var(--color-border)]

    bg-[var(--color-surface)]

    ${className}
  `;

  if (rows.length === 0) {
    return (
      <div className={shellClass}>
        <p className="text-caption px-5 py-8 text-center text-[var(--color-text-secondary)]">
          {empty}
        </p>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <div className="md:hidden">
        {rows.map((row) => {
          const expanded = expandedIds.has(row.id);

          return (
            <ExpandableListEntry
              key={row.id}
              row={row}
              expanded={expanded}
              detailId={`expandable-list-${row.id}-mobile`}
              insetStyle={insetStyle}
              summaryClassName=""
              detailClassName={detailClassName}
              onToggle={toggleRow}
              summary={
                <ExpandableListMobileSummary
                  columns={columns}
                  cells={row.cells}
                  showChevron={row.detail != null}
                  expanded={expanded}
                />
              }
            />
          );
        })}
      </div>

      <div role="table" className="hidden w-full overflow-x-auto md:block">
        <div
          className="w-full"
          style={{
            minWidth: resolvePadding(minWidth),
          }}
        >
          <div
            role="row"
            className="flex h-10 items-center border-b border-[var(--color-border)] bg-[var(--color-hover-soft)]"
            style={insetStyle}
          >
            <ExpandableListCells columns={columns} showChevron={showChevron} />
          </div>

          <div role="rowgroup">
            {rows.map((row) => {
              const expanded = expandedIds.has(row.id);
              const canExpand = row.detail != null;

              return (
                <ExpandableListEntry
                  key={row.id}
                  row={row}
                  expanded={expanded}
                  detailId={`expandable-list-${row.id}`}
                  insetStyle={insetStyle}
                  summaryClassName={summaryClassName}
                  detailClassName={detailClassName}
                  onToggle={toggleRow}
                  summary={
                    <ExpandableListCells
                      columns={columns}
                      cells={row.cells}
                      showChevron={showChevron}
                      chevron={canExpand ? <ExpandChevron expanded={expanded} /> : null}
                    />
                  }
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

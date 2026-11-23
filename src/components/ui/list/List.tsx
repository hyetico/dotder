import Link from "next/link";

import { AppIcon, ChevronRight } from "@/components/ui/icon";

import type { LucideIcon } from "@/components/ui/icon/icons";
import type { CSSProperties, ReactNode } from "react";

/*
 * 리스트는 부모 너비의 100%다.
 * 헤더 너비는 헤더 행 100%에 대한 비율이다.
 * 지정하지 않은 헤더는 남은 비율을 헤더 수로 균등하게 나눈다.
 * 헤더 높이는 headerHeight, 행 높이는 rowHeight로 고정된다.
 * 둘 다 상하 패딩으로 늘어나지 않는다.
 * 헤더 좌우 패딩은 헤더 전체를 감싼 박스에 한 번 적용된다.
 * 본문 열도 같은 패딩 안에서 비율을 잡아 헤더와 맞춘다.
 * 셀 안 내용 너비는 그 열의 100%에 대한 비율이다.
 * 내용이 그 너비를 넘으면 말줄임으로 자른다.
 * 헤더와 리스트 칸의 기본 정렬은 첫 열 왼쪽, 가운데 열 가운데, 마지막 열 오른쪽이다.
 * 오른쪽에 버튼이 있으면 그 옆 열은 헤더와 내용 모두 가운데가 기본이다.
 * 리스트를 minWidth보다 좁히면 목표 목록처럼 가로 스크롤이 생긴다.
 * 행에 버튼이 있으면 맨 오른쪽에 버튼 자리를 둔다.
 * detail이 있으면 고정 높이 아래에 펼친 내용을 붙인다.
 * 행 높이는 요약 줄만 고정하고, 펼친 내용은 그 높이 밖에 둔다.
 * 768px 아래에서는 헤더를 숨기고, 제목 열 아래에 나머지 값을 쌓는다.
 * 행의 expanded가 false면 모바일에서는 제목만 보인다. 펼치면 나머지 값을 쌓는다.
 * 메타 값 앞에는 헤더 글자가 붙는다. mobileHeader가 있으면 그 표시를 쓴다.
 * 1280px 아래 모바일과 태블릿의 좌우 패딩은 따로 줄 수 있다.
 * 없으면 헤더 패딩과 같다.
 * 1280px 이상은 헤더 패딩이다.
 */

export type ListAlign = "start" | "center" | "end";

/**
 * 좁은 화면에서의 열 역할.
 * title은 첫 줄, meta는 그 아래 작은 글자, hidden은 모바일에서 숨긴다.
 * 지정하지 않으면 첫 열은 title, 나머지는 meta다.
 */
export type ListMobileRole = "title" | "meta" | "hidden";

export type ListColumn = {
  id: string;
  header: ReactNode;
  /** 리스트 너비 100%에 대한 본문 열 비율 */
  width: number;
  /**
   * 헤더 행 100%에 대한 이 헤더의 비율.
   * 없으면 지정되지 않은 헤더끼리 남은 비율을 균등하게 나눈다.
   */
  headerWidth?: number;
  /**
   * 열 안쪽 내용 너비. 열 너비 100%에 대한 비율.
   * 셀에서 따로 주면 그 값이 우선한다.
   */
  contentWidth?: number;
  /**
   * 헤더와 칸의 justify-content.
   * 없으면 첫 열은 왼쪽, 가운데 열은 가운데, 마지막 열은 오른쪽.
   * 오른쪽에 버튼이 있으면 그 옆 열은 가운데.
   */
  align?: ListAlign;
  /**
   * 헤더만의 정렬.
   * 없으면 align과 같다.
   */
  headerAlign?: ListAlign;
  /**
   * 헤더와 내용의 글자 정렬.
   * 헤더에 headerAlign이 있으면 헤더는 그 정렬을 따른다.
   * 없으면 align과 같다.
   */
  textAlign?: ListAlign;
  /**
   * 768px 아래에서의 역할.
   * 없으면 첫 열은 title, 나머지는 meta다.
   */
  mobile?: ListMobileRole;
  /**
   * 768px 아래에서 값 앞에 두는 표시.
   * 없으면 header가 글자일 때 그 글자를 둔다.
   */
  mobileHeader?: ReactNode;
};

export type ListCell = {
  content: ReactNode;
  /** 이 셀만의 내용 너비. 열의 contentWidth보다 우선한다. */
  contentWidth?: number;
  /** 이 칸만의 내용 박스 정렬. 열의 align보다 우선한다. */
  align?: ListAlign;
  /** 이 칸만의 글자 정렬. 열의 textAlign보다 우선한다. */
  textAlign?: ListAlign;
  /**
   * 768px 아래에서 이 칸 앞에 두는 표시.
   * 있으면 열의 mobileHeader보다 우선한다.
   */
  mobileHeader?: ReactNode;
};

export type ListCellValue = ReactNode | ListCell;

export type ListRow = {
  id: string;
  cells: Record<string, ListCellValue>;
  /** 오른쪽 버튼 자리에 그대로 넣는다. detailHref보다 우선한다. */
  action?: ReactNode;
  /** 있으면 기본 상세 버튼을 오른쪽에 둔다. */
  detailHref?: string;
  /** 상세 버튼 이름. 없으면 "상세 보기". */
  actionLabel?: string;
  /**
   * 행 배경과 강조선.
   * 있으면 기본 hover 배경 대신 이 클래스를 쓴다.
   */
  className?: string;
  style?: CSSProperties;
  /** 행을 누르면 실행되는 함수 */
  onClick?: () => void;
  /** 있으면 요약 줄 아래에 펼친 내용을 붙인다. */
  detail?: ReactNode;
  /**
   * 펼친 영역 배경.
   * 없으면 회색이다.
   */
  detailClassName?: string;
  /**
   * 768px 아래에서 제목 아래 값을 보일지.
   * false면 접혀 제목만 보인다. 없으면 항상 보인다.
   */
  expanded?: boolean;
};

type ListProps = {
  columns: ListColumn[];
  rows: ListRow[];
  hideHeader?: boolean;
  /** 헤더 영역 왼쪽 패딩(px). 헤더 전체를 감싼 박스에 적용된다. */
  headerPaddingLeft?: number;
  /** 헤더 영역 오른쪽 패딩(px). 헤더 전체를 감싼 박스에 적용된다. */
  headerPaddingRight?: number;
  /**
   * 1280px 아래 왼쪽 패딩(px).
   * 모바일과 태블릿에 적용된다.
   * 없으면 헤더 왼쪽 패딩과 같다.
   */
  mobilePaddingLeft?: number;
  /**
   * 1280px 아래 오른쪽 패딩(px).
   * 모바일과 태블릿에 적용된다.
   * 없으면 헤더 오른쪽 패딩과 같다.
   */
  mobilePaddingRight?: number;
  /** 헤더 높이(px). 상하 패딩이 아니라 이 값으로 높이가 고정된다. */
  headerHeight?: number;
  /** 리스트 행 높이(px). 상하 패딩이 아니라 이 값으로 높이가 고정된다. */
  rowHeight?: number;
  /**
   * 리스트 내용의 최소 너비(px).
   * 영역이 이보다 좁아지면 가로 스크롤이 생긴다.
   */
  minWidth?: number;
  /**
   * 오른쪽 버튼 자리를 둘지.
   * 지정하지 않으면 버튼이 있는 행이 하나라도 있을 때 연다.
   */
  showAction?: boolean;
  /**
   * 768px 아래에서 헤더를 숨기고 제목 아래에 값을 쌓을지.
   * 없으면 쌓는다. 끄면 좁은 화면에서도 같은 열로 가로 스크롤한다.
   */
  stackOnMobile?: boolean;
  className?: string;
  /**
   * 헤더 행 배경.
   * 없으면 흰색이다.
   */
  headerClassName?: string;
  /**
   * 오른쪽 버튼 자리의 왼쪽 간격(px).
   * 버튼 크기는 그대로 두고 자리만 넓힌다.
   * 없으면 10.
   */
  actionGap?: number;
};

/*
 * 맨 오른쪽 버튼 자리.
 * 보조 버튼과 같은 36px 높이고, 행 높이와는 따로 둔다.
 */
const listActionGap = 10;
const listActionSize = 36;

const listDetailButtonClass = `
  inline-flex
  h-9
  w-9
  shrink-0
  cursor-pointer
  items-center
  justify-center

  rounded-[var(--radius-sm)]

  border
  border-[var(--color-border)]

  bg-white

  text-[var(--color-text)]

  transition-colors

  hover:bg-[var(--color-hover-soft)]

  disabled:cursor-default
  disabled:hover:bg-white
`;

export function ListDetailButton({
  href,
  label = "상세 보기",
  onClick,
  icon = ChevronRight,
  expanded,
  disabled = false,
}: {
  href?: string;
  label?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  expanded?: boolean;
  disabled?: boolean;
}) {
  const glyph = (
    <AppIcon
      icon={icon}
      size="sm"
      className={`transition-transform ${expanded ? "rotate-180" : ""} `}
    />
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} className={listDetailButtonClass}>
        {glyph}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={expanded}
      disabled={disabled}
      onClick={onClick}
      className={listDetailButtonClass}
    >
      {glyph}
    </button>
  );
}

function ListActionSlot({ children, gap = listActionGap }: { children?: ReactNode; gap?: number }) {
  return (
    <div
      className="flex h-full shrink-0 items-center justify-end"
      style={{
        width: gap + listActionSize,
        paddingLeft: gap,
      }}
    >
      {children}
    </div>
  );
}

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
 * mobileHeader가 있으면 그것을 쓰고, 없으면 헤더 글자를 씁니다.
 *
 * @param column - 열 정의
 * @returns 값 앞에 둘 표시. 없으면 null
 */
function mobileMetaLabel(column: ListColumn) {
  if (column.mobileHeader != null) {
    return column.mobileHeader;
  }

  return columnLabel(column.header);
}

function mobileRole(column: ListColumn, index: number): ListMobileRole {
  return column.mobile ?? (index === 0 ? "title" : "meta");
}

function splitMobileColumns(columns: ListColumn[]) {
  const visible = columns.flatMap((column, index) => {
    const role = mobileRole(column, index);

    if (role === "hidden") {
      return [];
    }

    return [{ column, role }];
  });
  const titles = visible.filter((item) => item.role === "title");
  const metas = visible.filter((item) => item.role === "meta");

  if (titles.length === 0 && metas.length > 0) {
    return {
      titles: metas.slice(0, 1),
      metas: metas.slice(1),
    };
  }

  return { titles, metas };
}

function rowHasAction(row: ListRow) {
  return row.action != null || Boolean(row.detailHref);
}

function renderRowAction(row: ListRow) {
  if (row.action != null) {
    return row.action;
  }

  if (row.detailHref) {
    return <ListDetailButton href={row.detailHref} label={row.actionLabel} />;
  }

  return null;
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

function resolveHeaderPadding(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

function resolveSize(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

/*
 * headerWidth를 준 열은 그 비율을 쓴다.
 * 없는 열은 100%에서 지정분을 뺀 나머지를 균등하게 나눈다.
 * 아무것도 없으면 헤더 수만큼 같은 비율이다.
 */
function resolveHeaderWidths(columns: ListColumn[]) {
  const count = columns.length;

  if (count === 0) {
    return [];
  }

  const specifiedSum = columns.reduce((sum, column) => sum + (column.headerWidth ?? 0), 0);
  const openCount = columns.filter((column) => column.headerWidth == null).length;
  const share = openCount > 0 ? Math.max(0, 100 - specifiedSum) / openCount : 0;

  return columns.map((column) => clampPercent(column.headerWidth ?? share));
}

function isListCell(value: ListCellValue | undefined): value is ListCell {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  if ("$$typeof" in value) {
    return false;
  }

  return "content" in value;
}

function resolveCell(value: ListCellValue | undefined): ListCell {
  if (isListCell(value)) {
    return value;
  }

  return {
    content: value ?? null,
  };
}

/*
 * 맨 오른쪽 열을 뺀 헤더와 리스트 칸의 오른쪽 간격.
 * 좌우가 아니라 오른쪽만이라 높이는 변하지 않는다.
 */
const columnPaddingRight = 10;

/*
 * 1280px 아래는 좁은 패딩, 그 이상은 헤더 패딩.
 * 값은 리스트 루트의 CSS 변수로 받는다.
 */
const listInsetClass = `
  pl-[var(--list-padding-left-phone)]
  pr-[var(--list-padding-right-phone)]

  md:pl-[var(--list-padding-left-narrow)]
  md:pr-[var(--list-padding-right-narrow)]

  xl:pl-[var(--list-padding-left)]
  xl:pr-[var(--list-padding-right)]
`;

function columnStyle(width: number, index: number, count: number): CSSProperties {
  const percent = `${clampPercent(width)}%`;

  return {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: percent,
    width: percent,
    maxWidth: percent,
    minWidth: 0,
    paddingRight: index < count - 1 ? columnPaddingRight : 0,
  };
}

const justifyClass: Record<ListAlign, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
};

const textAlignClass: Record<ListAlign, string> = {
  start: "text-left",
  center: "text-center",
  end: "text-right",
};

function defaultListAlign(index: number, count: number, besideAction: boolean): ListAlign {
  if (index >= count - 1) {
    if (besideAction) {
      return "center";
    }

    return index <= 0 ? "start" : "end";
  }

  if (index <= 0) {
    return "start";
  }

  return "center";
}

function textTitle(content: ReactNode) {
  if (typeof content === "string" || typeof content === "number") {
    return String(content);
  }

  return undefined;
}

function isPlainText(content: ReactNode) {
  return (
    content == null ||
    typeof content === "string" ||
    typeof content === "number" ||
    typeof content === "boolean"
  );
}

/**
 * ListRowDetail
 *
 * 펼친 행의 내용을 요약 줄 아래에 붙입니다.
 *
 * @param props - ListRowDetail 컴포넌트 Props
 * @param props.detail - 요약 줄 아래에 둘 내용. 없으면 그리지 않습니다
 * @param props.className - 펼친 영역 배경. 없으면 회색입니다
 * @param props.connected - 위 행과 붙여 그 사이 선을 숨길지
 */
function ListRowDetail({
  detail,
  className = "bg-[var(--color-hover)]",
  connected = false,
}: {
  detail?: ReactNode;
  className?: string;
  connected?: boolean;
}) {
  if (detail == null || detail === false) {
    return null;
  }

  return (
    <div
      className={` ${
        connected ? "" : `border-t border-[var(--color-border)]`
      } py-3 md:py-4 ${listInsetClass} ${className} `}
    >
      {detail}
    </div>
  );
}

function ListMobile({
  columns,
  rows,
  showActionColumn,
  actionGap,
}: {
  columns: ListColumn[];
  rows: ListRow[];
  showActionColumn: boolean;
  actionGap: number;
}) {
  const { titles, metas } = splitMobileColumns(columns);

  return (
    <div className="md:hidden" role="list">
      {rows.map((row) => (
        <div
          key={row.id}
          role="listitem"
          className={`border-b border-[var(--color-border)] last:border-b-0 ${
            row.expanded && row.detail ? "bg-[var(--color-hover)]" : ""
          } ${row.className ?? ""} `}
          style={row.style}
        >
          <div
            onClick={row.onClick}
            className={`flex items-center ${listInsetClass} ${row.onClick ? "cursor-pointer" : ""} ${
              row.expanded && row.detail
                ? "bg-[var(--color-hover)]"
                : row.className
                  ? ""
                  : "hover:bg-[var(--color-hover)]"
            } `}
          >
            <div className="min-w-0 flex-1 py-3">
              {titles.map(({ column }, index) => {
                const cell = resolveCell(row.cells[column.id]);

                if (isPlainText(cell.content)) {
                  return (
                    <p
                      key={column.id}
                      className={`text-body truncate font-medium text-[var(--color-text)] ${index > 0 ? "mt-0.5" : ""} `}
                      title={textTitle(cell.content)}
                    >
                      {cell.content}
                    </p>
                  );
                }

                return (
                  <div key={column.id} className={`min-w-0 ${index > 0 ? "mt-0.5" : ""} `}>
                    {cell.content}
                  </div>
                );
              })}
              {row.expanded === false
                ? null
                : metas.map(({ column }) => {
                    const cell = resolveCell(row.cells[column.id]);
                    const label = cell.mobileHeader ?? mobileMetaLabel(column);

                    if (isPlainText(cell.content)) {
                      return (
                        <p key={column.id} className="text-body-sm mt-1 flex min-w-0 gap-1.5">
                          {label ? (
                            <span className="shrink-0 text-[var(--color-text-muted)]">{label}</span>
                          ) : null}
                          <span
                            className="min-w-0 truncate text-[var(--color-text-secondary)]"
                            title={textTitle(cell.content)}
                          >
                            {cell.content}
                          </span>
                        </p>
                      );
                    }

                    return (
                      <div
                        key={column.id}
                        className="text-body-sm mt-2 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1"
                      >
                        {label ? (
                          <span className="shrink-0 text-[var(--color-text-muted)]">{label}</span>
                        ) : null}
                        <div className="max-w-full min-w-0">{cell.content}</div>
                      </div>
                    );
                  })}
            </div>
            {showActionColumn ? (
              <ListActionSlot gap={actionGap}>{renderRowAction(row)}</ListActionSlot>
            ) : null}
          </div>
          <ListRowDetail
            detail={row.detail}
            className={row.detailClassName}
            connected={Boolean(row.expanded && row.detail)}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * 열 너비를 맞춘 공용 리스트.
 * 넓은 화면에서는 헤더와 행이 같은 비율로 나뉘고,
 * 768px 아래에서는 제목 아래에 나머지 값을 쌓는다.
 */
export default function List({
  columns,
  rows,
  hideHeader = false,
  headerPaddingLeft = 16,
  headerPaddingRight = 16,
  mobilePaddingLeft,
  mobilePaddingRight,
  headerHeight = 40,
  rowHeight = 44,
  minWidth = 720,
  showAction,
  stackOnMobile = true,
  className = "",
  headerClassName = "bg-white",
  actionGap = listActionGap,
}: ListProps) {
  const showActionColumn = showAction ?? rows.some(rowHasAction);
  const headerWidths = resolveHeaderWidths(columns);
  const headerInset = {
    paddingLeft: resolveHeaderPadding(headerPaddingLeft),
    paddingRight: resolveHeaderPadding(headerPaddingRight),
  };
  const mobileInset = {
    paddingLeft: resolveHeaderPadding(mobilePaddingLeft ?? headerPaddingLeft),
    paddingRight: resolveHeaderPadding(mobilePaddingRight ?? headerPaddingRight),
  };

  const paddingVars = {
    "--list-padding-left": `${headerInset.paddingLeft}px`,
    "--list-padding-right": `${headerInset.paddingRight}px`,
    "--list-padding-left-narrow": `${mobileInset.paddingLeft}px`,
    "--list-padding-right-narrow": `${mobileInset.paddingRight}px`,
    "--list-padding-left-phone": `${mobileInset.paddingLeft}px`,
    "--list-padding-right-phone": `${mobileInset.paddingRight}px`,
  } as CSSProperties;

  return (
    <div
      className={`w-full min-w-0 overflow-y-hidden ${
        stackOnMobile ? "overflow-x-hidden md:overflow-x-auto" : "overflow-x-auto"
      } rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] ${className} `}
      style={paddingVars}
    >
      {stackOnMobile ? (
        <ListMobile
          columns={columns}
          rows={rows}
          showActionColumn={showActionColumn}
          actionGap={actionGap}
        />
      ) : null}
      <div
        role="table"
        className={stackOnMobile ? "hidden w-full md:block" : "w-full"}
        style={{
          minWidth: resolveSize(minWidth),
        }}
      >
        {hideHeader ? null : (
          <div
            role="row"
            className={`flex w-full overflow-hidden border-b border-[var(--color-border)] ${headerClassName} `}
            style={{
              height: resolveSize(headerHeight),
            }}
          >
            <div className={`flex h-full w-full min-w-0 ${listInsetClass} `}>
              <div className="flex h-full min-w-0 flex-1">
                {columns.map((column, index) => {
                  const columnAlign =
                    column.align ?? defaultListAlign(index, columns.length, showActionColumn);
                  const align = column.headerAlign ?? columnAlign;
                  const textAlign = column.headerAlign ?? column.textAlign ?? align;

                  return (
                    <div
                      key={column.id}
                      role="columnheader"
                      className={`text-caption flex h-full min-w-0 items-center ${justifyClass[align]} font-medium text-[var(--color-text-secondary)]`}
                      style={columnStyle(headerWidths[index] ?? 0, index, columns.length)}
                    >
                      <span className={`block w-full truncate ${textAlignClass[textAlign]} `}>
                        {column.header}
                      </span>
                    </div>
                  );
                })}
              </div>
              {showActionColumn ? <ListActionSlot gap={actionGap} /> : null}
            </div>
          </div>
        )}

        <div role="rowgroup">
          {rows.map((row) => (
            <div
              key={row.id}
              className={`w-full border-b border-[var(--color-border)] last:border-b-0 ${row.className ?? ""} `}
              style={row.style}
            >
              <div
                role="row"
                onClick={row.onClick}
                className={`w-full overflow-hidden ${row.onClick ? "cursor-pointer" : ""} ${
                  row.expanded && row.detail
                    ? "bg-[var(--color-hover)]"
                    : row.className
                      ? ""
                      : "hover:bg-[var(--color-hover)]"
                } `}
                style={{
                  height: resolveSize(rowHeight),
                }}
              >
                <div className={`flex h-full w-full min-w-0 ${listInsetClass} `}>
                  <div className="flex h-full min-w-0 flex-1">
                    {columns.map((column, index) => {
                      const cell = resolveCell(row.cells[column.id]);
                      const contentWidth = clampPercent(
                        cell.contentWidth ?? column.contentWidth ?? 100,
                      );
                      const align =
                        cell.align ??
                        column.align ??
                        defaultListAlign(index, columns.length, showActionColumn);
                      const textAlign = cell.textAlign ?? column.textAlign ?? align;

                      return (
                        <div
                          key={column.id}
                          role="cell"
                          className={`text-body flex h-full min-w-0 items-center ${justifyClass[align]} text-[var(--color-text)]`}
                          style={columnStyle(column.width, index, columns.length)}
                        >
                          <div
                            className={`max-w-full truncate ${textAlignClass[textAlign]} `}
                            style={{
                              width: `${contentWidth}%`,
                            }}
                            title={textTitle(cell.content)}
                          >
                            {cell.content}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {showActionColumn ? (
                    <ListActionSlot gap={actionGap}>{renderRowAction(row)}</ListActionSlot>
                  ) : null}
                </div>
              </div>
              <ListRowDetail
                detail={row.detail}
                className={row.detailClassName}
                connected={Boolean(row.expanded && row.detail)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import Kbd from "@/components/kit/Kbd";
import Modal from "@/components/kit/Modal";

// 보드 01-i 목록 그대로 [이름, 키들]
const GROUPS: { title: string; rows: [string, string[]][] }[] = [
  {
    title: "이동",
    rows: [
      ["통합 검색", ["⌘", "K"]],
      ["프로젝트 / 목표 / 태스크 / 메모", ["G", "→", "P", "/", "G", "/", "T", "/", "M"]],
      ["사이드바 접기", ["["]],
      ["단축키 보기", ["?"]],
    ],
  },
  {
    title: "만들기",
    rows: [
      ["새로 만들기 (지금 화면 기준)", ["N"]],
      ["빠른 메모", ["⇧", "N"]],
    ],
  },
  {
    title: "목록 · 상세",
    rows: [
      ["위 · 아래로 이동", ["↑", "↓"]],
      ["열기", ["Enter"]],
      ["완료로 표시", ["X"]],
      ["드로어 닫기", ["Esc"]],
      ["저장 (만들기 · 수정 폼)", ["⌘", "Enter"]],
    ],
  },
];

/**
 * 단축키 안내 창 (보드 01-i · ? 키). 위 88 · 폭 560 · 머리 56 + 선 → 묶음(12 600 --t3) · 줄 36(위 선) · 키 표시.
 * 단축키 표시(kbd)가 늘 보이는 곳은 여기와 빠른 입력뿐이다 (REBUILD 6).
 */
export default function ShortcutsDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="단축키"
      width="help"
      placement="top"
      headerDivider
    >
      <div className="flex flex-col gap-4 pt-2 pb-2">
        {GROUPS.map((group) => (
          <section key={group.title} className="flex flex-col gap-1">
            <h3 className="py-1 text-xs font-semibold text-[var(--t3)]">{group.title}</h3>
            {group.rows.map(([label, keys]) => (
              <div
                key={label}
                className="flex h-9 items-center gap-1 border-t border-[var(--divider)] text-sm"
              >
                <span className="flex-1">{label}</span>
                {keys.map((key, index) => (
                  <Kbd key={index}>{key}</Kbd>
                ))}
              </div>
            ))}
          </section>
        ))}
      </div>
    </Modal>
  );
}

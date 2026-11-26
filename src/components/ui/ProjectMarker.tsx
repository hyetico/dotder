import { Crown } from "@/components/ui/icon";

import { projectColorVar, type ProjectColorKey } from "@/lib/projectPalette";

type ProjectMarkerProps = {
  color: ProjectColorKey;
  isMain?: boolean;
};

/**
 * 프로젝트 표시 (프로토타입 pmark · Components 11.23). 메인은 프로젝트 색 왕관 14(읽는 이름 「메인」),
 * 나머지는 색 점 10. 다크 색은 팔레트 다크 값(흰색 30% 섞음)이 준다.
 *
 * @example
 * <ProjectMarker color={project.color} isMain={project.isMain} />
 */
export default function ProjectMarker({ color, isMain = false }: ProjectMarkerProps) {
  if (isMain) {
    return (
      <Crown
        size={14}
        role="img"
        aria-label="메인"
        className="shrink-0 fill-current"
        style={{ color: projectColorVar(color) }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className="inline-block size-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: projectColorVar(color) }}
    />
  );
}

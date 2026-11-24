import {
  FlaskConical,
  Folder,
  Inbox,
  ListTodo,
  Settings,
  Target,
  Users,
  type LucideIcon,
} from "@/components/ui/icon";

import {
  getGoalIdFromPath,
  getProjectDetailPath,
  getProjectGoalsPath,
  getProjectScopeFromPath,
  isGoalDetailPath,
  isProjectDetailPath,
  isProjectEditPath,
  isProjectGoalsPath,
  isProjectNewPath,
  isStaticNavActive,
} from "@/lib/projectRoutes";
import { PLAYGROUND_VISIBLE, TEAM_FEATURES_VISIBLE } from "@/lib/v1Scope";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const primaryNavItems: NavItem[] = [
  {
    label: "프로젝트",
    href: "/projects",
    icon: Folder,
  },
  {
    label: "목표",
    href: "/goals",
    icon: Target,
  },
  {
    label: "태스크",
    href: "/tasks",
    icon: ListTodo,
  },
  {
    label: "메모",
    href: "/memos",
    icon: Inbox,
  },
];

/** v1에서 메뉴에 보이지 않는 화면. 주소로 들어왔을 때 헤더 제목만 찾는다 (PRD 5-4). */
const teamNavItem: NavItem = {
  label: "팀",
  href: "/teams",
  icon: Users,
};

if (TEAM_FEATURES_VISIBLE) {
  primaryNavItems.push(teamNavItem);
}

export const secondaryNavItems: NavItem[] = [
  {
    label: "설정",
    href: "/settings",
    icon: Settings,
  },
];

const playgroundNavItem: NavItem = {
  label: "플레이그라운드",
  href: "/playground",
  icon: FlaskConical,
};

if (PLAYGROUND_VISIBLE) {
  secondaryNavItems.push(playgroundNavItem);
}

export type PageNavMeta = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export function getPageNavFromPath(pathname: string): PageNavMeta {
  for (const item of [...primaryNavItems, ...secondaryNavItems, teamNavItem, playgroundNavItem]) {
    if (isStaticNavActive(item.href, pathname)) {
      return {
        title: item.label,
        href: item.href,
        icon: item.icon,
      };
    }
  }

  return {
    title: "Tessera",
    href: "/projects",
    icon: Folder,
  };
}

export type HeaderPageTrail =
  | {
      kind: "project";
      projectId: number;
      href?: string;
      withGoalLabel?: boolean;
    }
  | {
      kind: "goal";
      goalId: number;
      href?: string;
    }
  | {
      kind: "label";
      label: string;
      href?: string;
    };

export function getHeaderPageTrail(pathname: string): HeaderPageTrail[] {
  if (isProjectEditPath(pathname)) {
    const projectId = Number(pathname.split("/")[2]);

    return [
      {
        kind: "project",
        projectId,
        href: getProjectDetailPath(projectId),
      },
      {
        kind: "label",
        label: "수정",
      },
    ];
  }

  if (isProjectDetailPath(pathname)) {
    return [
      {
        kind: "project",
        projectId: Number(pathname.split("/")[2]),
      },
    ];
  }

  if (isProjectNewPath(pathname)) {
    return [
      {
        kind: "label",
        label: "새 프로젝트 추가",
      },
    ];
  }

  if (isGoalDetailPath(pathname)) {
    const scope = getProjectScopeFromPath(pathname);
    const goalId = getGoalIdFromPath(pathname);
    const trail: HeaderPageTrail[] = [];

    if (typeof scope === "number") {
      trail.push({
        kind: "project",
        projectId: scope,
        href: getProjectGoalsPath(scope),
        withGoalLabel: true,
      });
    }

    if (goalId != null) {
      trail.push({
        kind: "goal",
        goalId,
      });
    }

    return trail;
  }

  if (isProjectGoalsPath(pathname)) {
    const projectId = Number(pathname.split("/")[2]);

    return [
      {
        kind: "project",
        projectId,
        withGoalLabel: true,
      },
    ];
  }

  return [];
}

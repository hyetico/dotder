"use client";

import { Controller, type Control } from "react-hook-form";

import ProjectBadge from "@/features/projects/components/ProjectBadge";
import { ProjectColorSwatch } from "@/features/projects/components/ProjectForm/fields/ProjectColorSwatch";
import { FormLabel } from "@/features/projects/components/ProjectForm/FormParts";
import { type ProjectFormData } from "@/features/projects/schemas/projectSchema";
import { PROJECT_COLOR_OPTIONS } from "@/features/projects/utils/projectColors";

const colorBadgeClassName = "!h-10 !w-10 lg:!h-11 lg:!w-11";

/**
 * ProjectColorField
 *
 * 프로젝트 색상을 고르는 필드입니다. 색상 없음과 준비된 색상 중 하나를 선택합니다.
 *
 * @param props - ProjectColorField 컴포넌트 Props
 * @param props.control - 폼 컨트롤
 */
export function ProjectColorField({ control }: { control: Control<ProjectFormData> }) {
  return (
    <>
      <FormLabel label="프로젝트 색상" />

      <Controller
        name="color"
        control={control}
        render={({ field }) => {
          // 10색 중 하나는 꼭 고른다 (「색상 없음」 없음 · 칸 간격 6, Components 04).
          // 모바일은 5개씩 2줄, 웹 · 태블릿은 한 줄 10개
          return (
            <div className="grid w-fit grid-cols-5 gap-1.5 md:flex md:items-center">
              {PROJECT_COLOR_OPTIONS.map((option) => {
                const isSelected = field.value === option.value;

                return (
                  <ProjectColorSwatch
                    key={option.value}
                    selected={isSelected}
                    label={`${option.label} 색상 선택`}
                    onClick={() => field.onChange(option.value)}
                  >
                    <ProjectBadge
                      color={option.value}
                      mark="radio"
                      selected={isSelected}
                      className={colorBadgeClassName}
                    />
                  </ProjectColorSwatch>
                );
              })}
            </div>
          );
        }}
      />
    </>
  );
}

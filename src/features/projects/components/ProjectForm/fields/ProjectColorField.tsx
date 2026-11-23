"use client";

import { Controller, type Control } from "react-hook-form";

import ProjectBadge from "@/features/projects/components/ProjectBadge";
import { ProjectColorSwatch } from "@/features/projects/components/ProjectForm/fields/ProjectColorSwatch";
import { FormLabel } from "@/features/projects/components/ProjectForm/FormParts";
import { type ProjectFormData } from "@/features/projects/schemas/projectSchema";
import { PROJECT_COLOR_OPTIONS } from "@/features/projects/utils/projectColors";

const colorBadgeClassName = "!h-10 !w-10 min-[1025px]:!h-11 min-[1025px]:!w-11";

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
          const isNoneSelected = !field.value;

          return (
            <div className="flex flex-wrap items-center gap-3">
              <ProjectColorSwatch
                selected={isNoneSelected}
                label="색상 없음"
                onClick={() => field.onChange(null)}
              >
                <ProjectBadge
                  color={null}
                  mark="radio"
                  selected={isNoneSelected}
                  className={colorBadgeClassName}
                />
              </ProjectColorSwatch>

              {PROJECT_COLOR_OPTIONS.map((option) => {
                const isSelected = field.value === option.value;

                return (
                  <ProjectColorSwatch
                    key={option.value}
                    selected={isSelected}
                    label={`${option.label} 색상 선택`}
                    onClick={() => field.onChange(isSelected ? null : option.value)}
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

"use client";

import { useRef, useState } from "react";
import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";

import Input from "@/components/ui/input/Input";
import Textarea from "@/components/ui/input/Textarea";
import { GoalTagField } from "@/features/projects/components/ProjectForm/fields/GoalTagField";
import { ProjectColorField } from "@/features/projects/components/ProjectForm/fields/ProjectColorField";
import { FieldError, FormLabel } from "@/features/projects/components/ProjectForm/FormParts";
import { PROJECT_DESCRIPTION_LIMIT } from "@/features/projects/constants/projectFormDefaults";
import ProjectDescriptionDrawer from "@/features/projects/modals/ProjectDescriptionDrawer";
import { type ProjectFormData } from "@/features/projects/schemas/projectSchema";

/**
 * WizardBasicInfoStep
 *
 * 1단계 입력입니다. 프로젝트 색상, 이름, 설명, 목표 태그를 입력합니다.
 *
 * @param props - WizardBasicInfoStep 컴포넌트 Props
 * @param props.control - 폼 컨트롤
 * @param props.register - 입력 칸을 폼에 등록하는 함수
 * @param props.errors - 폼 검증 에러
 * @param props.nameValue - 입력한 프로젝트 이름
 * @param props.descriptionValue - 입력한 프로젝트 설명
 * @param props.accentColor - 프로젝트 강조 색
 * @param props.onDescriptionChange - 드로어에서 쓴 설명을 폼에 반영하는 함수
 */
export function WizardBasicInfoStep({
  control,
  register,
  errors,
  nameValue,
  descriptionValue,
  accentColor,
  onDescriptionChange,
}: {
  control: Control<ProjectFormData>;
  register: UseFormRegister<ProjectFormData>;
  errors: FieldErrors<ProjectFormData>;
  nameValue: string;
  descriptionValue: string;
  accentColor: string;
  onDescriptionChange: (value: string) => void;
}) {
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const ignoreFocusRef = useRef(false);

  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  const { ref: descriptionRegisterRef, ...descriptionRegister } = register("description");

  const descriptionFieldClassName = [
    "h-[76px] cursor-pointer",
    isDescriptionOpen
      ? "border-[var(--color-field-focus)] shadow-[0_0_0_1px_var(--color-field-focus)]"
      : "",
  ].join(" ");

  /**
   * openDescriptionDrawer
   *
   * 설명 칸을 누르거나 포커스하면 오른쪽 드로어를 엽니다.
   */
  const openDescriptionDrawer = () => {
    if (!ignoreFocusRef.current) {
      setIsDescriptionOpen(true);
    }
  };

  /**
   * closeDescriptionDrawer
   *
   * 설명 드로어를 닫고, 다시 포커스되어 바로 열리지 않게 합니다.
   */
  const closeDescriptionDrawer = () => {
    ignoreFocusRef.current = true;
    setIsDescriptionOpen(false);
    descriptionRef.current?.blur();
    window.setTimeout(() => {
      ignoreFocusRef.current = false;
    }, 400);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <ProjectColorField control={control} />
      </div>

      <div>
        <FormLabel
          htmlFor="project-name"
          label="프로젝트 이름"
          required
          counter={`${nameValue.length}/50`}
        />

        <Input
          id="project-name"
          {...register("name")}
          autoComplete="off"
          maxLength={50}
          aria-invalid={Boolean(errors.name) || undefined}
          placeholder="프로젝트 이름을 입력하세요"
        />

        <FieldError message={errors.name?.message} />
      </div>

      <div>
        <FormLabel
          htmlFor="project-description"
          label="프로젝트 설명"
          counter={`${descriptionValue.length}/${PROJECT_DESCRIPTION_LIMIT}`}
        />

        <Textarea
          id="project-description"
          {...descriptionRegister}
          ref={(node) => {
            descriptionRegisterRef(node);
            descriptionRef.current = node;
          }}
          preview
          rows={2}
          aria-haspopup="dialog"
          aria-expanded={isDescriptionOpen}
          aria-invalid={Boolean(errors.description) || undefined}
          placeholder="프로젝트에 대한 설명을 입력하세요"
          onClick={openDescriptionDrawer}
          onFocus={openDescriptionDrawer}
          className={descriptionFieldClassName}
        />

        <FieldError message={errors.description?.message} />

        <ProjectDescriptionDrawer
          isOpen={isDescriptionOpen}
          value={descriptionValue}
          onClose={closeDescriptionDrawer}
          onApply={onDescriptionChange}
        />
      </div>

      <div className="border-t border-[var(--color-border)] pt-4">
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <GoalTagField
              tags={field.value}
              accentColor={accentColor}
              error={errors.tags?.message}
              variant="chip"
              onChange={field.onChange}
            />
          )}
        />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useId, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import IconButton from "@/components/ui/button/IconButton";
import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import DatePicker from "@/components/ui/date-picker/DatePicker";
import { AppIcon, Plus } from "@/components/ui/icon";
import Input from "@/components/ui/input/Input";
import Textarea from "@/components/ui/input/Textarea";
import Modal from "@/components/ui/modal/Modal";
import Select from "@/components/ui/select/Select";

import { canAddProjectItems } from "@/features/projects/utils/projectUtils";
import {
  allProjectsTaskSchema,
  taskSchema as baseTaskSchema,
  type AllProjectsTaskFormData,
  type TaskFormData as BaseTaskFormData,
} from "@/features/tasks/schemas/taskSchema";

import { currentUser } from "@/lib/mock/users";
import { ALL_PROJECTS_SCOPE, type ProjectScope } from "@/lib/projectRoutes";

import type { Project } from "@/features/projects/types/project";
import type { Task, TaskStatus } from "@/features/tasks/types/task";

type TaskFormData = BaseTaskFormData | AllProjectsTaskFormData;

const priorityOptions = [
  {
    value: "LOW",
    label: "Low",
  },
  {
    value: "MEDIUM",
    label: "Medium",
  },
  {
    value: "HIGH",
    label: "High",
  },
] as const;

const statusOptions = [
  {
    value: "TODO",
    label: "TODO",
  },
  {
    value: "IN_PROGRESS",
    label: "IN PROGRESS",
  },
  {
    value: "DONE",
    label: "DONE",
  },
] as const;

// 저장소가 정해지기 전(roadmap 10단계)까지 생성 시각을 임시 id로 쓴다.
// 렌더 중이 아니라 제출할 때만 부르도록 컴포넌트 밖에 둔다.
const createTaskId = () => Date.now();

type CreateTaskButtonProps = {
  projectScope: ProjectScope;
  projects: Project[];
  status: TaskStatus;

  onCreate: (task: Task) => void;

  variant?: "column" | "icon" | "header";

  hasTasks?: boolean;

  defaultDueDate?: string;

  hideTrigger?: boolean;

  /** 캘린더 등 컬럼 컨텍스트 없을 때 상태 선택 UI 표시 */
  showStatusField?: boolean;

  isModalOpen?: boolean;
  onModalOpenChange?: (open: boolean) => void;

  disabled?: boolean;
};

export default function CreateTaskButton({
  projectScope,
  projects,
  status,
  onCreate,
  variant = "column",
  hasTasks = false,
  defaultDueDate,
  hideTrigger = false,
  showStatusField = false,
  isModalOpen: controlledModalOpen,
  onModalOpenChange,
  disabled = false,
}: CreateTaskButtonProps) {
  const formId = useId();

  const isAllProjects = projectScope === ALL_PROJECTS_SCOPE;

  const formSchema = useMemo(
    () => (isAllProjects ? allProjectsTaskSchema : baseTaskSchema),
    [isAllProjects],
  );

  const scopedProject =
    typeof projectScope === "number"
      ? projects.find((project) => project.id === projectScope)
      : undefined;
  const addDisabled = disabled || !canAddProjectItems(scopedProject?.status);
  const projectOptions = useMemo(
    () =>
      projects
        .filter((project) => canAddProjectItems(project.status))
        .map((project) => ({
          value: String(project.id),
          label: project.name,
        })),
    [projects],
  );
  /*
   * Create Modal 열림 상태
   */
  const [internalModalOpen, setInternalModalOpen] = useState(false);

  const isControlled = onModalOpenChange !== undefined;

  const isModalOpen =
    !addDisabled && (isControlled ? (controlledModalOpen ?? false) : internalModalOpen);

  const setIsModalOpen = (open: boolean) => {
    if (open && addDisabled) {
      return;
    }

    if (isControlled) {
      onModalOpenChange(open);
    } else {
      setInternalModalOpen(open);
    }
  };

  const {
    register,
    handleSubmit,
    control,

    formState: { errors },

    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
      status,
      ...(isAllProjects
        ? {
            projectId: projectOptions[0]?.value ?? "",
          }
        : {}),
    },
  });

  /*
   * 캘린더 등에서 Modal 열릴 때
   * 마감일 등 기본값 주입
   */
  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    reset({
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: defaultDueDate ?? "",
      status,
      ...(isAllProjects
        ? {
            projectId: projectOptions[0]?.value ?? "",
          }
        : {}),
    });
  }, [isModalOpen, defaultDueDate, reset, isAllProjects, projectOptions, status]);

  /*
   * Modal 닫기
   *
   * 작성 중인 값도 초기화
   */
  const handleClose = () => {
    reset();

    setIsModalOpen(false);
  };

  /*
   * Task 생성
   */
  const onSubmit = (data: TaskFormData) => {
    const resolvedProjectId = isAllProjects
      ? Number((data as AllProjectsTaskFormData).projectId)
      : projectScope;
    const targetProject = projects.find((project) => project.id === resolvedProjectId);

    if (!canAddProjectItems(targetProject?.status)) {
      return;
    }

    const newTask: Task = {
      id: createTaskId(),

      projectId: resolvedProjectId,

      title: data.title,

      description: data.description,

      priority: data.priority,

      dueDate: data.dueDate,

      status: data.status,

      createdBy: currentUser.id,

      order: 0,
    };

    onCreate(newTask);

    reset();

    setIsModalOpen(false);
  };

  return (
    <>
      {/*
       * =====================================================
       * Task 추가 버튼
       * =====================================================
       */}
      {!hideTrigger &&
        (variant === "icon" ? (
          <IconButton
            label="Task 추가"
            disabled={addDisabled}
            title={
              addDisabled ? "보류 중인 프로젝트에는 태스크를 추가할 수 없습니다." : "Task 추가"
            }
            onClick={() => setIsModalOpen(true)}
            className="!h-8 !w-8 shrink-0 rounded-[var(--radius-sm)] border border-transparent text-[var(--color-text-muted)] hover:border-[var(--color-border)] hover:bg-[var(--color-hover-soft)] hover:text-[var(--color-text)]"
          >
            <AppIcon icon={Plus} size="md" />
          </IconButton>
        ) : variant === "header" ? (
          <PrimaryButton
            disabled={addDisabled}
            title={addDisabled ? "보류 중인 프로젝트에는 태스크를 추가할 수 없습니다." : "새 Task"}
            icon={<AppIcon icon={Plus} size="md" />}
            onClick={() => setIsModalOpen(true)}
          >
            새 Task
          </PrimaryButton>
        ) : (
          <button
            type="button"
            disabled={addDisabled}
            title={
              addDisabled ? "보류 중인 프로젝트에는 태스크를 추가할 수 없습니다." : "Task 추가"
            }
            onClick={() => setIsModalOpen(true)}
            className={`text-caption ${hasTasks ? "mt-3" : ""} w-full rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2.5 font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-hover-soft)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[var(--color-border-strong)] disabled:hover:bg-[var(--color-surface)] disabled:hover:text-[var(--color-text-secondary)]`}
          >
            + Task 추가
          </button>
        ))}

      {/*
       * =====================================================
       * Create Task Modal
       * =====================================================
       */}
      <Modal isOpen={isModalOpen} onClose={handleClose}>
        <Modal.Header
          title="새 Task"
          description="새로운 태스크 정보를 입력해주세요."
          onClose={handleClose}
          closeLabel="새 Task 창 닫기"
        />

        <Modal.Body>
          <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {isAllProjects && (
              <div>
                <label className="text-body mb-2 block font-medium text-[var(--color-text)]">
                  프로젝트
                </label>

                <Controller
                  name="projectId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={projectOptions}
                      placeholder="프로젝트 선택"
                    />
                  )}
                />

                {"projectId" in errors && errors.projectId && (
                  <p className="text-caption mt-1.5 text-[var(--color-danger-text)]">
                    {errors.projectId.message}
                  </p>
                )}
              </div>
            )}

            {/*
             * =============================================
             * 태스크 제목
             * =============================================
             */}
            <div>
              <label className="text-body mb-2 block font-medium text-[var(--color-text)]">
                태스크 제목
              </label>

              <Input {...register("title")} placeholder="예: 로그인 API 연결" />

              {errors.title && (
                <p className="text-caption mt-1.5 text-[var(--color-danger-text)]">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/*
             * =============================================
             * 태스크 설명
             * =============================================
             */}
            <div>
              <label className="text-body mb-2 block font-medium text-[var(--color-text)]">
                태스크 설명
              </label>

              <Textarea
                {...register("description")}
                placeholder="태스크 내용을 입력해주세요."
                className="min-h-[132px] leading-6"
              />

              {errors.description && (
                <p className="text-caption mt-1.5 text-[var(--color-danger-text)]">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/*
             * =============================================
             * 상태 + 우선순위 + 마감일
             *
             * showStatusField — 캘린더: 3열
             * 보드 컬럼 — 상태는 컬럼값 고정, 2열
             * =============================================
             */}
            <div
              className={`grid grid-cols-1 gap-5 ${
                showStatusField ? "md:grid-cols-3" : "md:grid-cols-2"
              } `}
            >
              {showStatusField && (
                <div>
                  <label className="text-body mb-2 block font-medium text-[var(--color-text)]">
                    상태
                  </label>

                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onChange={field.onChange}
                        options={[...statusOptions]}
                      />
                    )}
                  />
                </div>
              )}

              {/*
               * 우선순위
               */}
              <div>
                <label className="text-body mb-2 block font-medium text-[var(--color-text)]">
                  우선순위
                </label>

                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      options={[...priorityOptions]}
                    />
                  )}
                />
              </div>

              {/*
               * 마감일
               */}
              <div>
                <label className="text-body mb-2 block font-medium text-[var(--color-text)]">
                  마감일
                </label>

                <Controller
                  name="dueDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      title="마감일"
                    />
                  )}
                />

                {errors.dueDate && (
                  <p className="text-caption mt-1.5 text-[var(--color-danger-text)]">
                    {errors.dueDate.message}
                  </p>
                )}
              </div>
            </div>
          </form>
        </Modal.Body>

        <Modal.Footer>
          <SecondaryButton size="modal" onClick={handleClose}>
            취소
          </SecondaryButton>

          <PrimaryButton type="submit" form={formId} size="modal">
            Task 생성
          </PrimaryButton>
        </Modal.Footer>
      </Modal>
    </>
  );
}

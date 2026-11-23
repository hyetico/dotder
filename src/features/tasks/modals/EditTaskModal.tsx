"use client";

import { useEffect, useId } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import DatePicker from "@/components/ui/date-picker/DatePicker";
import Input from "@/components/ui/input/Input";
import Textarea from "@/components/ui/input/Textarea";
import Modal from "@/components/ui/modal/Modal";
import Select from "@/components/ui/select/Select";

import { taskSchema, type TaskFormData } from "@/features/tasks/schemas/taskSchema";

import type { Task } from "@/features/tasks/types/task";

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

type EditTaskModalProps = {
  isOpen: boolean;
  task: Task;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete?: (taskId: number) => void;
};

export default function EditTaskModal({
  isOpen,
  task,
  onClose,
  onUpdate,
  onDelete,
}: EditTaskModalProps) {
  const formId = useId();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),

    defaultValues: {
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      status: task.status,
    },
  });

  /*
   * Modal이 열릴 때마다
   * 현재 Task 값으로 Form 초기화
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      status: task.status,
    });
  }, [isOpen, task, reset]);

  const handleClose = () => {
    reset({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      status: task.status,
    });

    onClose();
  };

  const handleDelete = () => {
    if (!onDelete) {
      return;
    }

    onDelete(task.id);
    handleClose();
  };

  const onSubmit = (data: TaskFormData) => {
    onUpdate({
      ...task,
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.dueDate,
      status: data.status,
    });

    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Modal.Header
        title="Task 수정"
        description="태스크 정보를 수정해주세요."
        onClose={handleClose}
        closeLabel="Task 수정창 닫기"
      />

      <Modal.Body>
        <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="text-body mb-2 block font-medium text-[var(--color-text)]">
              태스크 제목
            </label>

            <Input {...register("title")} placeholder="예: 로그인 API 연결" />

            {errors.title && (
              <p className="text-caption mt-1.5 text-red-500">{errors.title.message}</p>
            )}
          </div>

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
              <p className="text-caption mt-1.5 text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
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
                    placeholder="마감일 선택"
                  />
                )}
              />

              {errors.dueDate && (
                <p className="text-caption mt-1.5 text-red-500">{errors.dueDate.message}</p>
              )}
            </div>
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer>
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="mr-auto inline-flex h-[var(--button-height-modal)] min-w-[96px] items-center justify-center rounded-[var(--radius-sm)] border border-red-200 bg-white px-[var(--button-px-modal)] text-[length:var(--button-font)] leading-[var(--button-line)] font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-50"
          >
            삭제
          </button>
        )}

        <SecondaryButton size="modal" onClick={handleClose}>
          취소
        </SecondaryButton>

        <PrimaryButton type="submit" form={formId} size="modal">
          수정 완료
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  );
}

"use client";

import { useState } from "react";

import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import FieldNotice from "@/components/ui/FieldNotice";
import { AppIcon, TagPlus } from "@/components/ui/icon";
import Input from "@/components/ui/input/Input";

import GoalTag from "@/features/goals/components/GoalTag";
import { FieldError, FormLabel } from "@/features/projects/components/ProjectForm/FormParts";
import { getProjectGoalTagGuideItems } from "@/features/projects/constants/projectFormGuides";
import {
  isGlobalProjectTag,
  PROJECT_TAG_LIMIT,
  PROJECT_TAG_PRESETS,
} from "@/features/projects/constants/projectTags";

export function GoalTagField({
  tags,
  accentColor,
  error,
  variant = "default",
  onChange,
}: {
  tags: string[];
  accentColor: string;
  error?: string;
  variant?: "default" | "chip";
  onChange: (tags: string[]) => void;
}) {
  const isChip = variant === "chip";

  const [tagInput, setTagInput] = useState("");

  const customTags = tags.filter((tag) => !isGlobalProjectTag(tag));

  const isAtLimit = tags.length >= PROJECT_TAG_LIMIT;

  const trimmedTag = tagInput.trim();

  const isDuplicate = trimmedTag !== "" && tags.includes(trimmedTag);

  const tagNotice = isDuplicate
    ? "이미 있는 태그입니다."
    : isAtLimit
      ? "태그는 10개까지 추가할 수 있습니다."
      : null;

  const matchedTagClassName = "outline outline-2 outline-offset-1 outline-red-500";

  const getMatchedClassName = (tag: string) =>
    isDuplicate && tag === trimmedTag ? matchedTagClassName : "";

  const addTag = () => {
    const trimmed = tagInput.trim();

    if (!trimmed || tags.length >= PROJECT_TAG_LIMIT || tags.includes(trimmed)) {
      return;
    }

    onChange([...tags, trimmed]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((item) => item !== tag));
  };

  return (
    <>
      <FormLabel
        label="프로젝트 목표 태그"
        counter={`${tags.length}/${PROJECT_TAG_LIMIT}`}
        guideItems={getProjectGoalTagGuideItems(accentColor)}
      />

      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <Input
            type="text"
            value={tagInput}
            aria-label="목표 태그 추가"
            aria-invalid={isDuplicate || undefined}
            aria-describedby={tagNotice ? "project-goal-tag-notice" : undefined}
            disabled={isAtLimit}
            placeholder={isChip ? "목표 태그를 입력하세요" : "태그 이름"}
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") {
                return;
              }

              if (event.nativeEvent.isComposing || event.keyCode === 229) {
                return;
              }

              event.preventDefault();
              addTag();
            }}
          />
        </div>

        {isChip ? (
          <PrimaryButton
            type="button"
            onClick={addTag}
            disabled={isAtLimit || trimmedTag === "" || isDuplicate}
            className="!h-10 shrink-0 min-[1025px]:!h-11"
          >
            추가
          </PrimaryButton>
        ) : (
          <SecondaryButton
            type="button"
            onClick={addTag}
            disabled={isAtLimit || trimmedTag === "" || isDuplicate}
            className="!h-10 shrink-0 min-[1025px]:!h-11"
            hideIconOnMobile
            icon={<AppIcon icon={TagPlus} size="sm" />}
          >
            추가
          </SecondaryButton>
        )}
      </div>

      <div className="mt-3 flex min-w-0 flex-wrap items-center gap-1.5">
        {PROJECT_TAG_PRESETS.map((tag) => (
          <GoalTag key={tag} tag={tag} className={getMatchedClassName(tag)} />
        ))}

        {customTags.map((tag) => (
          <GoalTag
            key={tag}
            tag={tag}
            className={getMatchedClassName(tag)}
            onRemove={() => removeTag(tag)}
          />
        ))}
      </div>

      {customTags.length === 0 ? <FieldNotice>추가한 태그가 없습니다.</FieldNotice> : null}

      {tagNotice ? (
        <div id="project-goal-tag-notice" role="status">
          <FieldNotice tone={isDuplicate ? "danger" : "default"}>{tagNotice}</FieldNotice>
        </div>
      ) : (
        <FieldError message={error} />
      )}
    </>
  );
}

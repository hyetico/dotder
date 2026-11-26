"use client";

import { useEffect } from "react";

import { useToast } from "@/components/ui/Toast";

import { TOAST_TEXT } from "@/content/ui";

import { onSaveError } from "@/lib/storage/dotderData";

/** 이 브라우저에 저장하지 못하면(용량 초과 · 사생활 모드) 토스트를 한 번 띄운다. 그리는 것은 없다. */
export default function SaveErrorToast() {
  const toast = useToast();

  useEffect(() => onSaveError(() => toast(TOAST_TEXT.storageFailed)), [toast]);

  return null;
}

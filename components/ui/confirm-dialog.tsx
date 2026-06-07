"use client";

import * as React from "react";
import { AlertDialog } from "radix-ui";

import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  trigger: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-secondary/30 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          )}
        />
        <AlertDialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
            "bg-card border border-border rounded-2xl shadow-lg p-7 sm:p-8",
            "flex flex-col gap-2.5 focus:outline-none",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          )}
        >
          <AlertDialog.Title className="font-heading text-2xl text-foreground leading-tight">
            {title}
          </AlertDialog.Title>
          {description && (
            <AlertDialog.Description className="text-sm text-text-secondary leading-relaxed">
              {description}
            </AlertDialog.Description>
          )}
          <div className="mt-7 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center border border-border text-text-secondary px-5 py-2.5 rounded-xl font-heading hover:bg-surface-alt transition-colors"
              >
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={onConfirm}
                className={cn(
                  "inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-heading text-primary-foreground transition-colors",
                  destructive
                    ? "bg-destructive hover:bg-destructive/90"
                    : "bg-primary hover:bg-[#A84E1F]",
                )}
              >
                {confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

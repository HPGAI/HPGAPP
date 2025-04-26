"use client";

import { useState, useRef, ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "../../components/ui/button";

interface ModalFormProps {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function ModalForm({
  title,
  children,
  isOpen,
  onClose,
  footer,
  size = "md",
}: ModalFormProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle closing when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Size classes mapping
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`${sizeClasses[size]} w-full bg-white rounded-lg shadow-lg overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">{title}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* Body */}
        <div className="p-4 max-h-[calc(80vh-8rem)] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t flex justify-end gap-2 bg-muted/20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
} 
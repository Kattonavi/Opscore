"use client";

import { Drawer } from "@base-ui/react/drawer";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Sheet Root ─── */

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Drawer.Viewport>
          <Drawer.Popup className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background shadow-xl data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full">
            {children}
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/* ─── Header ─── */

interface SheetHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetHeader({ children, className }: SheetHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border px-6 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ─── Title ─── */

interface SheetTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetTitle({ children, className }: SheetTitleProps) {
  return (
    <Drawer.Title className={cn("text-lg font-semibold text-foreground", className)}>
      {children}
    </Drawer.Title>
  );
}

/* ─── Description ─── */

interface SheetDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetDescription({ children, className }: SheetDescriptionProps) {
  return (
    <Drawer.Description className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </Drawer.Description>
  );
}

/* ─── Close ─── */

interface SheetCloseProps {
  className?: string;
}

export function SheetClose({ className }: SheetCloseProps) {
  return (
    <Drawer.Close className={cn("rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground", className)}>
      <X className="h-5 w-5" />
    </Drawer.Close>
  );
}

/* ─── Content ─── */

interface SheetContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetContent({ children, className }: SheetContentProps) {
  return (
    <Drawer.Content className={cn("flex-1 overflow-y-auto px-6 py-4", className)}>
      {children}
    </Drawer.Content>
  );
}

/* ─── Footer ─── */

interface SheetFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetFooter({ children, className }: SheetFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 border-t border-border px-6 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

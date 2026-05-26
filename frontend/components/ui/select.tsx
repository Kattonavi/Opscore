"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function SelectRoot<Value, Multiple extends boolean | undefined = false>(
  props: SelectPrimitive.Root.Props<Value, Multiple>,
) {
  return <SelectPrimitive.Root {...props} />;
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.Label.Props) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.Value
        data-slot="select-value"
        className="text-foreground data-[placeholder]:text-muted-foreground"
      >
        {children}
      </SelectPrimitive.Value>
      <ChevronDown className="h-4 w-4 text-muted-foreground" />
    </SelectPrimitive.Trigger>
  );
}

function SelectPositioner({
  className,
  ...props
}: SelectPrimitive.Positioner.Props) {
  return (
    <SelectPrimitive.Positioner
      data-slot="select-positioner"
      className={cn("z-50", className)}
      {...props}
    />
  );
}

function SelectPopup({
  className,
  ...props
}: SelectPrimitive.Popup.Props) {
  return (
    <SelectPositioner>
      <SelectPrimitive.Popup
        data-slot="select-popup"
        className={cn(
          "min-w-[var(--anchor-width)] rounded-lg border border-border bg-popover p-1 shadow-lg outline-none data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[starting-style]:scale-95",
          className,
        )}
        {...props}
      />
    </SelectPositioner>
  );
}

function SelectList({
  className,
  ...props
}: SelectPrimitive.List.Props) {
  return (
    <SelectPrimitive.List
      data-slot="select-list"
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </SelectPrimitive.Item>
  );
}

function SelectItemText({
  className,
  ...props
}: SelectPrimitive.ItemText.Props) {
  return (
    <SelectPrimitive.ItemText
      data-slot="select-item-text"
      className={cn("ml-6", className)}
      {...props}
    />
  );
}

function SelectItemIndicator({
  className,
  ...props
}: SelectPrimitive.ItemIndicator.Props) {
  return (
    <SelectPrimitive.ItemIndicator
      data-slot="select-item-indicator"
      className={cn(
        "absolute left-1.5 flex h-3.5 w-3.5 items-center justify-center",
        className,
      )}
      {...props}
    >
      <span className="block h-1.5 w-1.5 rounded-full bg-primary" />
    </SelectPrimitive.ItemIndicator>
  );
}

export {
  SelectRoot as Select,
  SelectLabel,
  SelectTrigger,
  SelectPositioner,
  SelectPopup,
  SelectList,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
};

import { cn } from "@/lib/utils";

export interface AvatarProps extends React.ComponentProps<"div"> {
  size?: "sm" | "md" | "lg";
}

export function Avatar({ className, size = "md", ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted",
        {
          sm: "h-6 w-6",
          md: "h-8 w-8",
          lg: "h-10 w-10",
        }[size],
        className,
      )}
      {...props}
    />
  );
}

export interface AvatarFallbackProps extends React.ComponentProps<"span"> {
  size?: "sm" | "md" | "lg";
}

export function AvatarFallback({
  className,
  size = "md",
  ...props
}: AvatarFallbackProps) {
  return (
    <span
      className={cn(
        "flex h-full w-full items-center justify-center font-medium text-muted-foreground",
        {
          sm: "text-[10px]",
          md: "text-xs",
          lg: "text-sm",
        }[size],
        className,
      )}
      {...props}
    />
  );
}

// PURE PRESENTATIONAL COMPONENT - NO LOGIC
// Receives everything via props

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingViewProps {
  message: string;
}

export function LoadingView({ message }: LoadingViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

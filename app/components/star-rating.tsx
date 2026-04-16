import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "~/lib/utils";

interface StarRatingDisplayProps {
  average: number | null;
  count: number;
  className?: string;
}

export function StarRatingDisplay({
  average,
  count,
  className,
}: StarRatingDisplayProps) {
  if (average === null || count === 0) return null;

  return (
    <span className={cn("flex items-center gap-1", className)}>
      <Star className="size-4 fill-yellow-400 text-yellow-400" />
      <span className="font-medium">{average.toFixed(1)}</span>
      <span className="text-muted-foreground">({count})</span>
    </span>
  );
}

interface StarRatingInputProps {
  value: number | null;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
}: StarRatingInputProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hovered ?? value ?? 0) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              "rounded transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              !disabled && "hover:scale-110 cursor-pointer",
              disabled && "cursor-default opacity-60"
            )}
            aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                "size-7 transition-colors",
                filled
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

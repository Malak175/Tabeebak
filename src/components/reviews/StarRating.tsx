import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

interface InteractiveStarRatingProps extends StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
};

export const StarRating = ({
  rating,
  max = 5,
  size = "md",
  className,
}: StarRatingProps) => (
  <div className={cn("flex items-center gap-0.5", className)} aria-label={`${rating} out of ${max} stars`}>
    {Array.from({ length: max }).map((_, index) => (
      <Star
        key={index}
        className={cn(
          sizeClasses[size],
          index < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
        )}
      />
    ))}
  </div>
);

export const InteractiveStarRating = ({
  value,
  onChange,
  max = 5,
  size = "md",
  disabled = false,
  className,
}: InteractiveStarRatingProps) => (
  <div className={cn("flex items-center gap-1", className)} role="radiogroup" aria-label="Rating">
    {Array.from({ length: max }).map((_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= value;

      return (
        <button
          key={index}
          type="button"
          role="radio"
          aria-checked={value === starValue}
          disabled={disabled}
          onClick={() => onChange(starValue)}
          className={cn(
            "rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-105",
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              isActive ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
            )}
          />
        </button>
      );
    })}
  </div>
);

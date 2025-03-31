import React from "react";

interface ProgressProps {
  value: number;
  max: number;
  className?: string;
  label?: string;
  showPercentage?: boolean;
  variant?: "default" | "success" | "warning" | "danger";
}

const getVariantClasses = (variant: string): string => {
  switch (variant) {
    case "success":
      return "bg-green-500";
    case "warning":
      return "bg-yellow-500";
    case "danger":
      return "bg-red-500";
    default:
      return "bg-teal-500";
  }
};

export const Progress: React.FC<ProgressProps> = ({
  value,
  max,
  className = "",
  label,
  showPercentage = false,
  variant = "default",
}) => {
  // Calculate the percentage
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  
  // Determine color based on percentage
  let variantClass = variant;
  if (variant === "default") {
    if (percentage > 75) {
      variantClass = "danger";
    } else if (percentage > 50) {
      variantClass = "warning";
    }
  }
  
  const barColorClass = getVariantClasses(variantClass);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-700">{percentage}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${barColorClass}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Progress;
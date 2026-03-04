"use client";

interface ProjectBadgeProps {
  name: string;
  color: string;
}

export function ProjectBadge({ name, color }: ProjectBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-white/50"
      />
      {name}
    </span>
  );
}

"use client";

interface ProjectBadgeProps {
  name: string;
}

export function ProjectBadge({ name }: ProjectBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#FF4433]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#FF4433]" />
      {name}
    </span>
  );
}

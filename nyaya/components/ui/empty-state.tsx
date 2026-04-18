import { ReactNode } from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-slate-200 bg-white shadow-sm h-64">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#f1f5f9] text-[#0a1f44] mb-4">
        {icon || <FolderOpen size={32} strokeWidth={1.5} />}
      </div>
      <h3 className="text-xl font-heading font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

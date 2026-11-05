import { postStatusLabel, statusBadgeClass } from "@/lib/postLabels";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusBadgeClass(status)}`}
    >
      {postStatusLabel[status] ?? status}
    </span>
  );
}

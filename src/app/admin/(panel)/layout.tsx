import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default function AdminPanelLayout({
  children,
}: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-screen flex-col bg-paper md:flex-row">
      <AdminNav />
      <div className="flex-1">{children}</div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Analytics } from "@/components/Analytics";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { api } from "@/lib/api";
import { AuthProvider } from "@/lib/auth";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { CategoryPage } from "@/pages/CategoryPage";
import { HomePage } from "@/pages/HomePage";
import { PostPage } from "@/pages/PostPage";
import { AdminCategoriesPage } from "@/pages/admin/AdminCategoriesPage";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";
import { AdminPostEditPage } from "@/pages/admin/AdminPostEditPage";
import { AdminPostsPage } from "@/pages/admin/AdminPostsPage";
import { AdminProfilePage } from "@/pages/admin/AdminProfilePage";
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage";

function PublicShell() {
  const settingsQ = useQuery({ queryKey: ["settings"], queryFn: api.publicSettings });
  const settings = settingsQ.data;

  if (settings?.maintenanceMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy p-6 text-center text-white">
        <div>
          <h1 className="font-serif text-3xl">Manutenção</h1>
          <p className="mt-2 text-white/80">Voltamos em breve.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SiteHeader settings={settings} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/categoria/:slug" element={<CategoryPage />} />
        <Route path="/categoria/:slug/:subslug" element={<CategoryPage />} />
        <Route path="/artigo/:slug" element={<PostPage />} />
      </Routes>
      <SiteFooter settings={settings} />
      <Analytics settings={settings} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="publicacoes" element={<AdminPostsPage />} />
            <Route path="publicacoes/:id" element={<AdminPostEditPage />} />
            <Route path="categorias" element={<AdminCategoriesPage />} />
            <Route path="configuracoes" element={<AdminSettingsPage />} />
            <Route path="perfil" element={<AdminProfilePage />} />
          </Route>
          <Route path="/*" element={<PublicShell />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

import { Navigate, Route, Routes } from "react-router-dom";
import { SiteLayout } from "./layouts/SiteLayout";
import { AdminAuthorsPage } from "./pages/AdminAuthorsPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminPostEditPage } from "./pages/AdminPostEditPage";
import { AdminPostsPage } from "./pages/AdminPostsPage";
import { CategoryPage } from "./pages/CategoryPage";
import { HomePage } from "./pages/HomePage";
import { PostPage } from "./pages/PostPage";

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="categoria/:slug" element={<CategoryPage />} />
        <Route path="publicacao/:slug" element={<PostPage />} />
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route path="admin" element={<Navigate to="/admin/publicacoes" replace />} />
        <Route path="admin/publicacoes" element={<AdminPostsPage />} />
        <Route path="admin/publicacoes/:id" element={<AdminPostEditPage />} />
        <Route path="admin/autores" element={<AdminAuthorsPage />} />
      </Route>
    </Routes>
  );
}

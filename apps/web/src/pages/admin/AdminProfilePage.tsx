import { useMutation } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export function AdminProfilePage() {
  const { user, refresh } = useAuth();
  const [message, setMessage] = useState("");
  const save = useMutation({
    mutationFn: api.updateProfile,
    onSuccess: async () => {
      await refresh();
      setMessage("Perfil atualizado.");
    },
  });

  if (!user) return null;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    save.mutate({
      name: String(fd.get("name")),
      jobTitle: String(fd.get("jobTitle") || "") || null,
      oabNumber: String(fd.get("oabNumber") || "") || null,
      bio: String(fd.get("bio") || "") || null,
      phone: String(fd.get("phone") || "") || null,
      websiteUrl: String(fd.get("websiteUrl") || "") || null,
      linkedInUrl: String(fd.get("linkedInUrl") || "") || null,
      instagramUrl: String(fd.get("instagramUrl") || "") || null,
      currentPassword: String(fd.get("currentPassword") || "") || undefined,
      newPassword: String(fd.get("newPassword") || "") || undefined,
    });
  }

  const field = "mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm";

  return (
    <div>
      <h1 className="font-serif text-3xl text-navy">Meu perfil</h1>
      <p className="mt-2 text-sm text-muted">Dados exibidos como autor das publicações (credibilidade OAB).</p>
      <form onSubmit={onSubmit} className="mt-8 grid max-w-xl gap-4">
        <label className="text-sm font-medium">
          Nome
          <input name="name" className={field} defaultValue={user.name} required />
        </label>
        <label className="text-sm font-medium">
          Cargo / título
          <input name="jobTitle" className={field} defaultValue={user.jobTitle ?? ""} />
        </label>
        <label className="text-sm font-medium">
          OAB
          <input name="oabNumber" className={field} defaultValue={user.oabNumber ?? ""} />
        </label>
        <label className="text-sm font-medium">
          Bio
          <textarea name="bio" className={field} rows={4} defaultValue={user.bio ?? ""} />
        </label>
        <label className="text-sm font-medium">
          Telefone
          <input name="phone" className={field} defaultValue={user.phone ?? ""} />
        </label>
        <label className="text-sm font-medium">
          Site
          <input name="websiteUrl" type="url" className={field} defaultValue={user.websiteUrl ?? ""} />
        </label>
        <label className="text-sm font-medium">
          LinkedIn
          <input name="linkedInUrl" type="url" className={field} defaultValue={user.linkedInUrl ?? ""} />
        </label>
        <label className="text-sm font-medium">
          Instagram
          <input name="instagramUrl" type="url" className={field} defaultValue={user.instagramUrl ?? ""} />
        </label>
        <hr className="border-border" />
        <label className="text-sm font-medium">
          Senha atual (para alterar senha)
          <input name="currentPassword" type="password" className={field} />
        </label>
        <label className="text-sm font-medium">
          Nova senha
          <input name="newPassword" type="password" minLength={6} className={field} />
        </label>
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {save.error ? <p className="text-sm text-red-700">{(save.error as Error).message}</p> : null}
        <button type="submit" className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">
          Salvar perfil
        </button>
      </form>
    </div>
  );
}

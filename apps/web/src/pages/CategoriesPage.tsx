import { useQuery } from "@tanstack/react-query";
import { CategoryCard } from "@/components/CategoryCard";
import { Seo } from "@/components/Seo";
import { api } from "@/lib/api";
import { defaultLawAreas } from "@/lib/defaultLawAreas";

export function CategoriesPage() {
  const settingsQ = useQuery({ queryKey: ["settings"], queryFn: api.publicSettings });
  const catsQ = useQuery({ queryKey: ["categories"], queryFn: api.categories, retry: 1 });
  const categories = catsQ.data?.length ? catsQ.data : defaultLawAreas;

  return (
    <>
      <Seo settings={settingsQ.data} title="Áreas do Direito" description="Categorias e subcategorias jurídicas." />
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <h1 className="font-serif text-4xl text-navy">Áreas do Direito</h1>
        <p className="mt-2 max-w-2xl text-muted">Organização por ramos do Direito e temas específicos.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </div>
    </>
  );
}

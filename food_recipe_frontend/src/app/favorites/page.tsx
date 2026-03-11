"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth/store";
import { Card, SectionTitle } from "@/components/ui";

export default function FavoritesPage() {
  const token = useAuthStore((s) => s.token);

  const q = useQuery({
    queryKey: ["favorites.list"],
    queryFn: () => (token ? api.favorites.list(token) : Promise.resolve([])),
    enabled: Boolean(token),
  });

  if (!token) {
    return <Card className="p-6 text-sm text-slate-600">Log in to view your favorites.</Card>;
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Favorites" subtitle="Quick access to your saved recipes." />

      {q.isLoading ? <Card className="p-6 text-sm text-slate-600">Loading...</Card> : null}
      {q.isError ? <Card className="p-6 text-sm text-red-600">Failed to load favorites.</Card> : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(q.data || []).map((r) => (
          <Link key={r.id} href={`/recipes/${r.id}`}>
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="text-sm font-semibold text-slate-900">{r.title}</div>
              {r.description ? <div className="mt-1 text-sm text-slate-600 line-clamp-2">{r.description}</div> : null}
            </Card>
          </Link>
        ))}
      </div>

      {!q.isLoading && (q.data || []).length === 0 ? (
        <Card className="p-6 text-sm text-slate-600">No favorites yet.</Card>
      ) : null}
    </div>
  );
}

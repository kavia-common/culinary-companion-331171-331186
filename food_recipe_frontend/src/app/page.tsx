"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { RecipeSearchFilters } from "@/lib/api/types";
import { Badge, Button, Card, Input, SectionTitle } from "@/components/ui";

function RecipeCard({
  id,
  title,
  description,
  imageUrl,
  cuisine,
  dietaryTags,
  cookTimeMinutes,
  difficulty,
  averageRating,
}: {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  cuisine?: string;
  dietaryTags?: string[];
  cookTimeMinutes?: number;
  difficulty?: string;
  averageRating?: number;
}) {
  return (
    <Link href={`/recipes/${id}`} className="block">
      <Card className="group overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-[16/9] w-full bg-slate-100">
          {/* Image kept optional to avoid broken UI; can be wired to real image URLs later */}
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">No image</div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">{title}</h3>
            {averageRating !== undefined ? (
              <div className="text-xs font-medium text-slate-700">{averageRating.toFixed(1)}★</div>
            ) : null}
          </div>
          {description ? <p className="mt-1 line-clamp-2 text-sm text-slate-600">{description}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {cuisine ? <Badge>{cuisine}</Badge> : null}
            {difficulty ? <Badge>{difficulty}</Badge> : null}
            {cookTimeMinutes ? <Badge>{cookTimeMinutes} min</Badge> : null}
            {(dietaryTags || []).slice(0, 2).map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function BrowsePage() {
  const [q, setQ] = React.useState("");
  const [cuisine, setCuisine] = React.useState("");
  const [dietary, setDietary] = React.useState("");
  const [maxCookTimeMinutes, setMaxCookTimeMinutes] = React.useState("");

  const filters: RecipeSearchFilters = {
    q: q || undefined,
    cuisine: cuisine || undefined,
    dietary: dietary || undefined,
    maxCookTimeMinutes: maxCookTimeMinutes ? Number(maxCookTimeMinutes) : undefined,
    sort: "relevance",
    page: 1,
  };

  const query = useQuery({
    queryKey: ["recipes.search", filters],
    queryFn: () => api.recipes.search(filters),
  });

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Browse recipes"
        subtitle="Search by keyword, cuisine, dietary preferences, cook time, and difficulty."
      />

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Search" value={q} onChange={setQ} placeholder="eg. chicken, pasta..." />
          <Input label="Cuisine" value={cuisine} onChange={setCuisine} placeholder="eg. Italian" />
          <Input label="Dietary" value={dietary} onChange={setDietary} placeholder="eg. vegan" />
          <Input
            label="Max cook time (min)"
            value={maxCookTimeMinutes}
            onChange={setMaxCookTimeMinutes}
            placeholder="eg. 30"
            type="number"
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            {query.isFetching ? "Searching..." : query.data ? `${query.data.total} results` : "—"}
          </div>
          <Link href="/me/recipes/new">
            <Button variant="secondary">Create recipe</Button>
          </Link>
        </div>
      </Card>

      {query.isError ? (
        <Card className="p-4">
          <div className="text-sm text-red-600">Failed to load recipes. Check NEXT_PUBLIC_API_BASE_URL and backend.</div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(query.data?.items || []).map((r) => (
          <RecipeCard key={r.id} {...r} />
        ))}
      </div>

      {!query.isFetching && query.data && query.data.items.length === 0 ? (
        <Card className="p-6 text-sm text-slate-600">No recipes found. Try adjusting filters.</Card>
      ) : null}
    </div>
  );
}

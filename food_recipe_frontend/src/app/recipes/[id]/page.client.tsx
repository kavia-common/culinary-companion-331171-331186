"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth/store";
import { Badge, Button, Card, SectionTitle, Textarea } from "@/components/ui";

export default function RecipeDetailsClientPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const qc = useQueryClient();

  const recipeQ = useQuery({
    queryKey: ["recipes.getById", id],
    queryFn: () => api.recipes.getById(id),
  });

  const reviewsQ = useQuery({
    queryKey: ["reviews.listForRecipe", id],
    queryFn: () => api.reviews.listForRecipe(id),
  });

  const favoritesQ = useQuery({
    queryKey: ["favorites.list"],
    queryFn: () => (token ? api.favorites.list(token) : Promise.resolve([])),
    enabled: Boolean(token),
  });

  const isFav = Boolean(favoritesQ.data?.some((r) => r.id === id));

  const favMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Not authenticated");
      if (isFav) return api.favorites.remove(token, id);
      return api.favorites.add(token, id);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["favorites.list"] });
    },
  });

  const shoppingMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Not authenticated");
      return api.shoppingList.addFromRecipe(token, id);
    },
  });

  const [rating, setRating] = React.useState("5");
  const [comment, setComment] = React.useState("");

  const addReviewMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Not authenticated");
      const r = Number(rating);
      return api.reviews.addForRecipe(token, id, { rating: r, comment: comment || undefined });
    },
    onSuccess: async () => {
      setComment("");
      await qc.invalidateQueries({ queryKey: ["reviews.listForRecipe", id] });
    },
  });

  if (recipeQ.isLoading) {
    return <Card className="p-6 text-sm text-slate-600">Loading...</Card>;
  }

  if (recipeQ.isError || !recipeQ.data) {
    return <Card className="p-6 text-sm text-red-600">Failed to load recipe.</Card>;
  }

  const recipe = recipeQ.data;

  return (
    <div className="space-y-6">
      <SectionTitle title={recipe.title} subtitle={recipe.description} />

      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {recipe.cuisine ? <Badge>{recipe.cuisine}</Badge> : null}
          {recipe.difficulty ? <Badge>{recipe.difficulty}</Badge> : null}
          {recipe.cookTimeMinutes ? <Badge>{recipe.cookTimeMinutes} min</Badge> : null}
          {(recipe.dietaryTags || []).map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button disabled={!token || favMutation.isPending} onClick={() => favMutation.mutate()}>
            {isFav ? "Unfavorite" : "Favorite"}
          </Button>
          <Button
            variant="secondary"
            disabled={!token || shoppingMutation.isPending}
            onClick={() => shoppingMutation.mutate()}
          >
            Add ingredients to shopping list
          </Button>
        </div>

        {!token ? <div className="mt-3 text-xs text-slate-600">Log in to favorite and add to shopping list.</div> : null}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-slate-900">Ingredients</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {recipe.ingredients.map((i, idx) => (
              <li key={idx} className="flex items-start justify-between gap-4">
                <span>{i.name}</span>
                <span className="text-slate-500">{i.quantity || ""}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold text-slate-900">Steps</h2>
          <ol className="mt-3 space-y-3 text-sm text-slate-700">
            {recipe.steps
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((s) => (
                <li key={s.order} className="flex gap-3">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                    {s.order}
                  </div>
                  <div>{s.text}</div>
                </li>
              ))}
          </ol>
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="text-sm font-semibold text-slate-900">Ratings & reviews</h2>

        <div className="mt-3 space-y-4">
          {user ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="block">
                  <div className="mb-1 text-sm font-medium text-slate-700">Rating</div>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-500/20 focus:ring-4"
                  >
                    {[5, 4, 3, 2, 1].map((v) => (
                      <option key={v} value={String(v)}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="sm:col-span-2">
                  <Textarea label="Comment" value={comment} onChange={setComment} placeholder="Share helpful details..." />
                </div>
              </div>
              <div className="mt-3">
                <Button disabled={addReviewMutation.isPending} onClick={() => addReviewMutation.mutate()}>
                  Submit review
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-600">Log in to leave a review.</div>
          )}

          {reviewsQ.isLoading ? <div className="text-sm text-slate-600">Loading reviews...</div> : null}
          {reviewsQ.isError ? <div className="text-sm text-red-600">Failed to load reviews.</div> : null}

          <div className="space-y-3">
            {(reviewsQ.data || []).map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-900">{r.rating}★</div>
                  <div className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</div>
                </div>
                {r.comment ? <div className="mt-2 text-sm text-slate-700">{r.comment}</div> : null}
                {r.status && r.status !== "published" ? (
                  <div className="mt-2 text-xs text-slate-500">Status: {r.status}</div>
                ) : null}
              </div>
            ))}
          </div>

          {!reviewsQ.isLoading && reviewsQ.data && reviewsQ.data.length === 0 ? (
            <div className="text-sm text-slate-600">No reviews yet.</div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

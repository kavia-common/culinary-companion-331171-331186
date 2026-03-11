"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Recipe } from "@/lib/api/types";
import { useAuthStore } from "@/lib/auth/store";
import { Card, SectionTitle } from "@/components/ui";
import { RecipeForm } from "@/components/RecipeForm";

export default function EditRecipeClientPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const qc = useQueryClient();

  const token = useAuthStore((s) => s.token);

  const recipeQ = useQuery({
    queryKey: ["recipes.getById", id],
    queryFn: () => api.recipes.getById(id),
  });

  const updateM = useMutation({
    mutationFn: async (draft: Omit<Recipe, "id">) => {
      if (!token) throw new Error("Not authenticated");
      return api.recipes.updateMine(token, id, draft);
    },
    onSuccess: async (r) => {
      await qc.invalidateQueries({ queryKey: ["recipes.getById", id] });
      router.push(`/recipes/${r.id}`);
    },
  });

  const deleteM = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Not authenticated");
      return api.recipes.deleteMine(token, id);
    },
    onSuccess: () => router.push("/me/recipes"),
  });

  if (!token) {
    return <Card className="p-6 text-sm text-slate-600">Log in to edit your recipes.</Card>;
  }

  if (recipeQ.isLoading) return <Card className="p-6 text-sm text-slate-600">Loading...</Card>;
  if (recipeQ.isError || !recipeQ.data) return <Card className="p-6 text-sm text-red-600">Failed to load recipe.</Card>;

  const initial: Omit<Recipe, "id"> = {
    title: recipeQ.data.title,
    description: recipeQ.data.description,
    imageUrl: recipeQ.data.imageUrl,
    cuisine: recipeQ.data.cuisine,
    dietaryTags: recipeQ.data.dietaryTags,
    cookTimeMinutes: recipeQ.data.cookTimeMinutes,
    difficulty: recipeQ.data.difficulty,
    ingredients: recipeQ.data.ingredients,
    steps: recipeQ.data.steps,
    authorId: recipeQ.data.authorId,
    averageRating: recipeQ.data.averageRating,
    ratingsCount: recipeQ.data.ratingsCount,
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Edit recipe" subtitle="Update your recipe details, ingredients, and steps." />
      <RecipeForm
        initial={initial}
        submitLabel="Save changes"
        busy={updateM.isPending || deleteM.isPending}
        onSubmit={(d) => updateM.mutate(d)}
        onDelete={() => deleteM.mutate()}
      />
      {updateM.isError ? <Card className="p-4 text-sm text-red-600">Failed to save changes.</Card> : null}
      {deleteM.isError ? <Card className="p-4 text-sm text-red-600">Failed to delete recipe.</Card> : null}
    </div>
  );
}

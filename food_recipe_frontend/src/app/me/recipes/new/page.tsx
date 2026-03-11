"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Recipe } from "@/lib/api/types";
import { useAuthStore } from "@/lib/auth/store";
import { Card, SectionTitle } from "@/components/ui";
import { RecipeForm } from "@/components/RecipeForm";

export default function NewRecipePage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  const mutation = useMutation({
    mutationFn: async (draft: Omit<Recipe, "id">) => {
      if (!token) throw new Error("Not authenticated");
      return api.recipes.createMine(token, draft);
    },
    onSuccess: (recipe) => {
      router.push(`/recipes/${recipe.id}`);
    },
  });

  if (!token) {
    return <Card className="p-6 text-sm text-slate-600">Log in to create a recipe.</Card>;
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="New recipe" subtitle="Create a recipe and share it with others." />
      <RecipeForm submitLabel="Create recipe" busy={mutation.isPending} onSubmit={(d) => mutation.mutate(d)} />
      {mutation.isError ? <Card className="p-4 text-sm text-red-600">Failed to create recipe.</Card> : null}
    </div>
  );
}

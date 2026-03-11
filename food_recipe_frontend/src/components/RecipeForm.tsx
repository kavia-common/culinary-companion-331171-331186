"use client";

import React from "react";
import type { Recipe, RecipeDifficulty } from "@/lib/api/types";
import { Button, Card, Input, Textarea } from "@/components/ui";

type Draft = Omit<Recipe, "id">;

const emptyDraft: Draft = {
  title: "",
  description: "",
  imageUrl: "",
  cuisine: "",
  dietaryTags: [],
  cookTimeMinutes: 0,
  difficulty: "easy",
  ingredients: [{ name: "", quantity: "" }],
  steps: [{ order: 1, text: "" }],
};

function parseTags(v: string): string[] {
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function tagsToString(tags: string[] | undefined): string {
  return (tags || []).join(", ");
}

// PUBLIC_INTERFACE
export function RecipeForm({
  initial,
  onSubmit,
  submitLabel,
  busy,
  onDelete,
}: {
  initial?: Draft;
  onSubmit: (draft: Draft) => void;
  submitLabel: string;
  busy?: boolean;
  onDelete?: () => void;
}) {
  /** Recipe form for create/edit with stable contract and predictable state. */
  const [draft, setDraft] = React.useState<Draft>(initial ?? emptyDraft);

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Title"
          value={draft.title}
          onChange={(v) => setDraft((d) => ({ ...d, title: v }))}
          placeholder="Recipe name"
        />
        <Input
          label="Cuisine"
          value={draft.cuisine || ""}
          onChange={(v) => setDraft((d) => ({ ...d, cuisine: v }))}
          placeholder="eg. Thai"
        />
        <Input
          label="Image URL (optional)"
          value={draft.imageUrl || ""}
          onChange={(v) => setDraft((d) => ({ ...d, imageUrl: v }))}
          placeholder="https://..."
          className="sm:col-span-2"
        />
        <Textarea
          label="Description"
          value={draft.description || ""}
          onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
          placeholder="Short summary"
          className="sm:col-span-2"
        />
        <Input
          label="Dietary tags (comma-separated)"
          value={tagsToString(draft.dietaryTags)}
          onChange={(v) => setDraft((d) => ({ ...d, dietaryTags: parseTags(v) }))}
          placeholder="eg. vegan, gluten-free"
          className="sm:col-span-2"
        />
        <Input
          label="Cook time (minutes)"
          value={String(draft.cookTimeMinutes || 0)}
          onChange={(v) => setDraft((d) => ({ ...d, cookTimeMinutes: Number(v || 0) }))}
          type="number"
        />
        <label className="block">
          <div className="mb-1 text-sm font-medium text-slate-700">Difficulty</div>
          <select
            value={draft.difficulty || "easy"}
            onChange={(e) => setDraft((d) => ({ ...d, difficulty: e.target.value as RecipeDifficulty }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-500/20 focus:ring-4"
          >
            {["easy", "medium", "hard"].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <div className="text-sm font-semibold text-slate-900">Ingredients</div>
          <div className="mt-3 space-y-2">
            {draft.ingredients.map((ing, idx) => (
              <div key={idx} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  label={idx === 0 ? "Name" : undefined}
                  value={ing.name}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      ingredients: d.ingredients.map((x, i) => (i === idx ? { ...x, name: v } : x)),
                    }))
                  }
                  placeholder="eg. flour"
                />
                <Input
                  label={idx === 0 ? "Quantity" : undefined}
                  value={ing.quantity || ""}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      ingredients: d.ingredients.map((x, i) => (i === idx ? { ...x, quantity: v } : x)),
                    }))
                  }
                  placeholder="eg. 2 cups"
                />
              </div>
            ))}
            <Button
              variant="ghost"
              onClick={() => setDraft((d) => ({ ...d, ingredients: [...d.ingredients, { name: "", quantity: "" }] }))}
            >
              + Add ingredient
            </Button>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-900">Steps</div>
          <div className="mt-3 space-y-2">
            {draft.steps
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((s, idx) => (
                <div key={s.order} className="space-y-2 rounded-xl border border-slate-200 p-3">
                  <div className="text-xs font-medium text-slate-500">Step {s.order}</div>
                  <Textarea
                    value={s.text}
                    onChange={(v) =>
                      setDraft((d) => ({
                        ...d,
                        steps: d.steps.map((x) => (x.order === s.order ? { ...x, text: v } : x)),
                      }))
                    }
                    placeholder="Describe this step..."
                  />
                  {draft.steps.length > 1 ? (
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          steps: d.steps.filter((x) => x.order !== s.order).map((x, i) => ({ ...x, order: i + 1 })),
                        }))
                      }
                    >
                      Remove step
                    </Button>
                  ) : null}
                  {idx === draft.steps.length - 1 ? (
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          steps: [...d.steps, { order: d.steps.length + 1, text: "" }],
                        }))
                      }
                    >
                      + Add step
                    </Button>
                  ) : null}
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button disabled={busy || !draft.title.trim()} onClick={() => onSubmit(draft)}>
          {busy ? "Saving..." : submitLabel}
        </Button>
        {onDelete ? (
          <Button variant="danger" disabled={busy} onClick={() => onDelete()}>
            Delete
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

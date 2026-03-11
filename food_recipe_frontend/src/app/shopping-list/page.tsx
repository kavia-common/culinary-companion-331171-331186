"use client";

import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth/store";
import { Button, Card, Input, SectionTitle } from "@/components/ui";

export default function ShoppingListPage() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["shoppingList.get"],
    queryFn: () => (token ? api.shoppingList.get(token) : Promise.resolve({ items: [] })),
    enabled: Boolean(token),
  });

  const toggle = useMutation({
    mutationFn: async (args: { id: string; checked: boolean }) => {
      if (!token) throw new Error("Not authenticated");
      return api.shoppingList.toggle(token, args.id, args.checked);
    },
    onSuccess: async () => qc.invalidateQueries({ queryKey: ["shoppingList.get"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error("Not authenticated");
      return api.shoppingList.remove(token, id);
    },
    onSuccess: async () => qc.invalidateQueries({ queryKey: ["shoppingList.get"] }),
  });

  const clearChecked = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Not authenticated");
      return api.shoppingList.clearChecked(token);
    },
    onSuccess: async () => qc.invalidateQueries({ queryKey: ["shoppingList.get"] }),
  });

  const [newItem, setNewItem] = React.useState("");

  const addManual = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Not authenticated");
      // Reuse existing endpoint shape by creating a pseudo item via PATCH-less endpoint isn't defined.
      // Backend should provide /shopping-list manual add; until then we no-op.
      return Promise.resolve();
    },
  });

  if (!token) {
    return <Card className="p-6 text-sm text-slate-600">Log in to manage your shopping list.</Card>;
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Shopping list" subtitle="Generate from recipes and check off as you shop." />

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input label="Add item (manual)" value={newItem} onChange={setNewItem} placeholder="eg. 2 lemons" />
          </div>
          <Button
            variant="secondary"
            disabled={!newItem || addManual.isPending}
            onClick={() => {
              // Placeholder flow until backend supports manual add.
              setNewItem("");
              addManual.mutate();
            }}
          >
            Add
          </Button>
          <Button variant="ghost" disabled={clearChecked.isPending} onClick={() => clearChecked.mutate()}>
            Clear checked
          </Button>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Manual add requires backend endpoint (not yet available in the provided OpenAPI spec).
        </div>
      </Card>

      {q.isLoading ? <Card className="p-6 text-sm text-slate-600">Loading...</Card> : null}
      {q.isError ? <Card className="p-6 text-sm text-red-600">Failed to load shopping list.</Card> : null}

      <Card className="p-4">
        <div className="space-y-2">
          {(q.data?.items || []).map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={i.checked}
                  onChange={(e) => toggle.mutate({ id: i.id, checked: e.target.checked })}
                />
                <span className={i.checked ? "text-slate-400 line-through" : "text-slate-800"}>{i.text}</span>
              </label>
              <Button variant="ghost" onClick={() => remove.mutate(i.id)}>
                Remove
              </Button>
            </div>
          ))}
        </div>

        {!q.isLoading && (q.data?.items || []).length === 0 ? (
          <div className="p-6 text-sm text-slate-600">Your shopping list is empty.</div>
        ) : null}
      </Card>
    </div>
  );
}

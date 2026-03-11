"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth/store";
import { Button, Card, SectionTitle } from "@/components/ui";

export default function AdminPage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const canAccess = Boolean(user && (user.role === "admin" || user.role === "moderator"));

  const pendingQ = useQuery({
    queryKey: ["admin.listPendingReviews"],
    queryFn: () => (token ? api.admin.listPendingReviews(token) : Promise.resolve([])),
    enabled: Boolean(token && canAccess),
  });

  const usersQ = useQuery({
    queryKey: ["admin.listUsers"],
    queryFn: () => (token ? api.admin.listUsers(token) : Promise.resolve([])),
    enabled: Boolean(token && canAccess),
  });

  const moderate = useMutation({
    mutationFn: async (args: { id: string; action: "approve" | "reject" }) => {
      if (!token) throw new Error("Not authenticated");
      return api.admin.moderateReview(token, args.id, args.action);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin.listPendingReviews"] });
    },
  });

  if (!token || !canAccess) {
    return <Card className="p-6 text-sm text-slate-600">Admin access required.</Card>;
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Admin & moderation" subtitle="Review moderation queue and manage users." />

      <Card className="p-4">
        <h2 className="text-sm font-semibold text-slate-900">Pending reviews</h2>
        {pendingQ.isLoading ? <div className="mt-3 text-sm text-slate-600">Loading...</div> : null}
        {pendingQ.isError ? <div className="mt-3 text-sm text-red-600">Failed to load pending reviews.</div> : null}
        <div className="mt-3 space-y-3">
          {(pendingQ.data || []).map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-slate-900">{r.rating}★</div>
                <div className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</div>
              </div>
              {r.comment ? <div className="mt-2 text-sm text-slate-700">{r.comment}</div> : null}
              <div className="mt-3 flex gap-2">
                <Button disabled={moderate.isPending} onClick={() => moderate.mutate({ id: r.id, action: "approve" })}>
                  Approve
                </Button>
                <Button
                  variant="danger"
                  disabled={moderate.isPending}
                  onClick={() => moderate.mutate({ id: r.id, action: "reject" })}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
        {!pendingQ.isLoading && (pendingQ.data || []).length === 0 ? (
          <div className="mt-3 text-sm text-slate-600">No pending reviews.</div>
        ) : null}
      </Card>

      <Card className="p-4">
        <h2 className="text-sm font-semibold text-slate-900">Users</h2>
        {usersQ.isLoading ? <div className="mt-3 text-sm text-slate-600">Loading...</div> : null}
        {usersQ.isError ? <div className="mt-3 text-sm text-red-600">Failed to load users.</div> : null}
        <div className="mt-3 space-y-2">
          {(usersQ.data || []).map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <div className="text-sm font-medium text-slate-900">{u.displayName || u.email}</div>
                <div className="text-xs text-slate-500">{u.email}</div>
              </div>
              <div className="text-xs font-medium text-slate-700">{u.role}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

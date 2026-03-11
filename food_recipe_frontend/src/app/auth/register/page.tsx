"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth/store";
import { Button, Card, SectionTitle } from "@/components/ui";

const schema = z.object({
  displayName: z.string().min(1).max(50).optional().or(z.literal("")),
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: "", email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) =>
      api.auth.register({
        email: data.email,
        password: data.password,
        displayName: data.displayName || undefined,
      }),
    onSuccess: (res) => {
      setSession({ token: res.tokens.accessToken, user: res.user });
      router.push("/");
    },
  });

  return (
    <div className="mx-auto max-w-lg">
      <SectionTitle title="Create account" subtitle="Save favorites, write reviews, and publish your own recipes." />
      <Card className="p-4">
        <form className="space-y-4" onSubmit={form.handleSubmit((d) => mutation.mutate(d))}>
          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700">Display name (optional)</div>
            <input
              {...form.register("displayName")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-blue-500/20 focus:ring-4"
            />
          </label>

          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700">Email</div>
            <input
              {...form.register("email")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-blue-500/20 focus:ring-4"
            />
            {form.formState.errors.email ? (
              <div className="mt-1 text-xs text-red-600">{form.formState.errors.email.message}</div>
            ) : null}
          </label>

          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700">Password</div>
            <input
              type="password"
              {...form.register("password")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-blue-500/20 focus:ring-4"
            />
            {form.formState.errors.password ? (
              <div className="mt-1 text-xs text-red-600">{form.formState.errors.password.message}</div>
            ) : null}
          </label>

          {mutation.isError ? (
            <div className="text-sm text-red-600">Registration failed. Check backend connectivity.</div>
          ) : null}

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? "Creating..." : "Create account"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

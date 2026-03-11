"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useAuthStore } from "@/lib/auth/store";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

const queryClient = makeQueryClient();

// PUBLIC_INTERFACE
export function Providers({ children }: { children: React.ReactNode }) {
  /** App-level providers: React Query + auth hydration. */
  const hydrate = useAuthStore((s) => s.hydrateFromStorage);
  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

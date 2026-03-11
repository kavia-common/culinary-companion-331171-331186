"use client";

import Link from "next/link";
import React from "react";
import { Container, Button } from "@/components/ui";
import { useAuthStore } from "@/lib/auth/store";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white/60 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}

function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clearSession);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login">
          <Button variant="ghost">Log in</Button>
        </Link>
        <Link href="/auth/register">
          <Button>Sign up</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden text-sm text-slate-700 sm:block">
        <span className="font-medium text-slate-900">{user.displayName || user.email}</span>{" "}
        <span className="text-slate-500">({user.role})</span>
      </div>
      <Link href="/me/recipes">
        <Button variant="ghost">My recipes</Button>
      </Link>
      <Button variant="ghost" onClick={() => clear()}>
        Logout
      </Button>
    </div>
  );
}

// PUBLIC_INTERFACE
export function AppShell({ children }: { children: React.ReactNode }) {
  /** App shell with header/nav and main content. */
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500/10 to-gray-50">
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <Container>
          <div className="flex h-16 items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm font-semibold tracking-tight text-slate-900">
                Culinary Companion
              </Link>
              <nav className="hidden items-center gap-1 sm:flex">
                <NavLink href="/">Browse</NavLink>
                <NavLink href="/favorites">Favorites</NavLink>
                <NavLink href="/shopping-list">Shopping list</NavLink>
                {user?.role === "admin" || user?.role === "moderator" ? <NavLink href="/admin">Admin</NavLink> : null}
              </nav>
            </div>
            <UserMenu />
          </div>
        </Container>
      </header>

      <main>
        <Container>
          <div className="py-6">{children}</div>
        </Container>
      </main>

      <footer className="border-t border-slate-200 bg-white/70">
        <Container>
          <div className="py-6 text-xs text-slate-500">
            API base: <span className="font-mono">{process.env.NEXT_PUBLIC_API_BASE_URL || "(not set)"}</span>
          </div>
        </Container>
      </footer>
    </div>
  );
}

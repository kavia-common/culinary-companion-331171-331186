import RecipeDetailsClientPage from "./page.client";

// PUBLIC_INTERFACE
export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  /**
   * Static export requires at least one param entry for dynamic routes.
   * We export a single placeholder route; the UI fetches real data client-side.
   */
  return [{ id: "placeholder" }];
}

export default function Page() {
  return <RecipeDetailsClientPage />;
}

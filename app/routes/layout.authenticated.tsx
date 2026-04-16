import { redirect, Outlet } from "react-router";
import type { Route } from "./+types/layout.authenticated";
import { getCurrentUserId } from "~/lib/session";

export async function loader({ request }: Route.LoaderArgs) {
  const currentUserId = await getCurrentUserId(request);
  if (!currentUserId) {
    const url = new URL(request.url);
    throw redirect(
      `/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`
    );
  }
  return { currentUserId };
}

export default function AuthenticatedLayout() {
  return <Outlet />;
}

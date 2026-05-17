import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

import { useAuth } from "@/store/useAuth";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/" });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <main className="flex-1 flex w-full items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </main>
    );
  }

  return <Outlet />;
}
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { AppInit } from "@/components/AppInit";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-heading font-black text-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-text">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-primary inline-flex">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-heading font-semibold text-text">Esta página não carregou</h1>
        <p className="mt-2 text-sm text-muted">Algo deu errado. Tente novamente ou volte ao início.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="btn-primary"
          >
            Tentar novamente
          </button>
          <a href="/" className="rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-text hover:bg-surface2">
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "55319833217680001" },
      { name: "description", content: "Plataforma de calendário e gestão operacional estratégica." },
      { name: "author", content: "Tripla Eventos" },
      { property: "og:title", content: "55319833217680001" },
      { name: "twitter:title", content: "55319833217680001" },
      { property: "og:description", content: "Plataforma de calendário e gestão operacional estratégica." },
      { name: "twitter:description", content: "Plataforma de calendário e gestão operacional estratégica." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1f367966-005d-498f-afb8-1615bd2ec705/id-preview-ae7f2d1b--28758451-1ad3-4cdd-bc12-fdb220150a51.lovable.app-1779037860444.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1f367966-005d-498f-afb8-1615bd2ec705/id-preview-ae7f2d1b--28758451-1ad3-4cdd-bc12-fdb220150a51.lovable.app-1779037860444.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;600;700;800;900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen flex flex-col bg-bg text-text">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppInit />
      <Outlet />
      <Toaster position="top-right" richColors theme="system" />
    </QueryClientProvider>
  );
}

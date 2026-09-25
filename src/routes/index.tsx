import { createFileRoute } from "@tanstack/react-router";
import AppShell, { RequireAuth } from "@/components/layout/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ISOM Reporting Services — Dashboard" },
      {
        name: "description",
        content: "Operations dashboard for ISOM and BVOIP-CPUC reporting services.",
      },
      { property: "og:title", content: "ISOM Reporting Services — Dashboard" },
      {
        property: "og:description",
        content: "Operations dashboard for ISOM and BVOIP-CPUC reporting services.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <RequireAuth>
      <AppShell />
    </RequireAuth>
  );
}

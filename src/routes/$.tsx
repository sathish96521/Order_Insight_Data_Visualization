import { createFileRoute } from "@tanstack/react-router";
import AppShell, { RequireAuth } from "@/components/layout/AppShell";

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: "Reports — ISOM Reporting Services" },
      {
        name: "description",
        content: "Inventory, performance and claim reports for ISOM and BVOIP-CPUC.",
      },
      { property: "og:title", content: "Reports — ISOM Reporting Services" },
      {
        property: "og:description",
        content: "Inventory, performance and claim reports for ISOM and BVOIP-CPUC.",
      },
    ],
  }),
  component: ReportRoute,
});

function ReportRoute() {
  return (
    <RequireAuth>
      <AppShell />
    </RequireAuth>
  );
}

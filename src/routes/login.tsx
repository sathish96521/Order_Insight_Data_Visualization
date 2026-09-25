import { createFileRoute } from "@tanstack/react-router";
import AuthPage from "@/components/auth/AuthPage";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — ISOM Reporting Services" },
      { name: "description", content: "Sign in with your ATTUID to access reporting services." },
      { property: "og:title", content: "Sign in — ISOM Reporting Services" },
      {
        property: "og:description",
        content: "Sign in with your ATTUID to access reporting services.",
      },
    ],
  }),
  component: AuthPage,
});

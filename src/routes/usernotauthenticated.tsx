import { createFileRoute } from "@tanstack/react-router";
import UserNotAuthenticated from "@/components/auth/UserNotAuthenticated";

export const Route = createFileRoute("/usernotauthenticated")({
  head: () => ({
    meta: [
      { title: "Access required — ISOM Reporting Services" },
      { name: "description", content: "Your account does not have access to this application." },
      { property: "og:title", content: "Access required — ISOM Reporting Services" },
      {
        property: "og:description",
        content: "Your account does not have access to this application.",
      },
    ],
  }),
  component: UserNotAuthenticated,
});

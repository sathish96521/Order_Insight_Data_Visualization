import { createFileRoute } from "@tanstack/react-router";
import UserLoggedOut from "@/components/auth/UserLoggedOut";

export const Route = createFileRoute("/userloggedout")({
  head: () => ({
    meta: [
      { title: "Signed out — ISOM Reporting Services" },
      { name: "description", content: "You have been signed out of ISOM Reporting Services." },
      { property: "og:title", content: "Signed out — ISOM Reporting Services" },
      {
        property: "og:description",
        content: "You have been signed out of ISOM Reporting Services.",
      },
    ],
  }),
  component: UserLoggedOut,
});

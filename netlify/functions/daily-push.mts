import type { Config } from "@netlify/functions";

// This scheduled function calls the /api/push endpoint daily at 8 AM UTC.
// The actual push logic lives in the Next.js API route.

export default async () => {
  const siteUrl = process.env.URL || process.env.DEPLOY_URL;
  if (!siteUrl) {
    console.error("No site URL available");
    return new Response("No site URL", { status: 500 });
  }

  const secret = process.env.PUSH_API_SECRET;
  if (!secret) {
    console.error("PUSH_API_SECRET is not set");
    return new Response("Missing secret", { status: 500 });
  }

  try {
    const res = await fetch(`${siteUrl}/api/push`, {
      method: "GET",
      headers: { Authorization: `Bearer ${secret}` },
    });
    const data = await res.json();
    console.log("Push result:", data);
    return new Response(JSON.stringify(data), { status: res.status });
  } catch (error) {
    console.error("Scheduled push failed:", error);
    return new Response("Failed", { status: 500 });
  }
};

export const config: Config = {
  schedule: "0 8 * * *",
};

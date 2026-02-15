import { getDb } from "@/lib/firebase-admin";
import { getDayOfYear } from "@/lib/date-utils";
import { NextRequest, NextResponse } from "next/server";
import webPush from "web-push";

export const dynamic = "force-dynamic";

function initWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys are not configured");
  }

  webPush.setVapidDetails(subject, publicKey, privateKey);
}

async function sendPushToAll() {
  initWebPush();

  const snapshot = await getDb().collection("subscriptions").get();
  if (snapshot.empty) return { sent: 0, failed: 0 };

  const language = getDayOfYear() % 2 !== 0 ? "English" : "Chinese";

  const payload = JSON.stringify({
    title: "Voca Cola Zero",
    body: `Today's challenges are ready! ${language} vocabulary, squats, literature & history.`,
    url: "/",
  });

  let sent = 0;
  let failed = 0;

  await Promise.all(
    snapshot.docs.map(async (doc) => {
      const { subscription } = doc.data();
      try {
        await webPush.sendNotification(subscription, payload);
        sent++;
      } catch (error: unknown) {
        const statusCode =
          error instanceof Error && "statusCode" in error
            ? (error as { statusCode: number }).statusCode
            : undefined;
        if (statusCode === 410 || statusCode === 404) {
          await doc.ref.delete();
        }
        failed++;
      }
    }),
  );

  return { sent, failed };
}

function verifySecret(request: NextRequest): boolean {
  const secret = process.env.PUSH_API_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function handlePush(request: NextRequest) {
  if (!verifySecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await sendPushToAll());
  } catch (error) {
    console.error("Push notification error:", error);
    return NextResponse.json(
      { error: "Failed to send push notifications" },
      { status: 500 },
    );
  }
}

export { handlePush as GET, handlePush as POST };

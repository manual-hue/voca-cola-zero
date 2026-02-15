import { getDb } from "@/lib/firebase-admin";
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

  if (snapshot.empty) {
    return { sent: 0, failed: 0 };
  }

  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000,
  );
  const language = dayOfYear % 2 !== 0 ? "English" : "Chinese";

  const payload = JSON.stringify({
    title: "Voca Cola Zero",
    body: `Today's challenges are ready! ${language} vocabulary, squats, literature & history.`,
    url: "/",
  });

  let sent = 0;
  let failed = 0;

  const promises = snapshot.docs.map(async (doc) => {
    const { subscription } = doc.data();
    try {
      await webPush.sendNotification(subscription, payload);
      sent++;
    } catch (error: unknown) {
      const statusCode =
        error instanceof Error && "statusCode" in error
          ? (error as { statusCode: number }).statusCode
          : undefined;
      // Remove expired/invalid subscriptions
      if (statusCode === 410 || statusCode === 404) {
        await doc.ref.delete();
      }
      failed++;
    }
  });

  await Promise.all(promises);
  return { sent, failed };
}

function verifySecret(request: NextRequest): boolean {
  const secret = process.env.PUSH_API_SECRET;
  if (!secret) {
    // Secret MUST be configured — refuse to run without it
    return false;
  }
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

// Scheduled function handler (Netlify cron calls this internally).
// Protected by secret so it can't be triggered by external GET requests.
export async function GET(request: NextRequest) {
  if (!verifySecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendPushToAll();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Push notification error:", error);
    return NextResponse.json(
      { error: "Failed to send push notifications" },
      { status: 500 },
    );
  }
}

// Manual trigger via POST — also requires secret
export async function POST(request: NextRequest) {
  if (!verifySecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendPushToAll();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Push notification error:", error);
    return NextResponse.json(
      { error: "Failed to send push notifications" },
      { status: 500 },
    );
  }
}

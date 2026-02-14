import { getDb } from "@/lib/firebase-admin";
import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Validate that the subscription object has the expected Web Push shape
function isValidSubscription(
  obj: unknown,
): obj is { endpoint: string; keys: { p256dh: string; auth: string } } {
  if (typeof obj !== "object" || obj === null) return false;
  const sub = obj as Record<string, unknown>;

  if (typeof sub.endpoint !== "string") return false;
  // Endpoint must be a valid HTTPS URL
  try {
    const url = new URL(sub.endpoint);
    if (url.protocol !== "https:") return false;
  } catch {
    return false;
  }

  // Keys are required for Web Push
  if (typeof sub.keys !== "object" || sub.keys === null) return false;
  const keys = sub.keys as Record<string, unknown>;
  if (typeof keys.p256dh !== "string" || typeof keys.auth !== "string")
    return false;

  return true;
}

// Hash the endpoint to create a safe, fixed-length Firestore doc ID
function subscriptionId(endpoint: string): string {
  return createHash("sha256").update(endpoint).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!isValidSubscription(body)) {
      return NextResponse.json(
        { error: "Invalid push subscription" },
        { status: 400 },
      );
    }

    const id = subscriptionId(body.endpoint);

    // Store only the fields we need — don't persist arbitrary extra data
    await getDb()
      .collection("subscriptions")
      .doc(id)
      .set({
        subscription: {
          endpoint: body.endpoint,
          keys: {
            p256dh: body.keys.p256dh,
            auth: body.keys.auth,
          },
        },
        createdAt: new Date().toISOString(),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to save subscription" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { endpoint } = await request.json();

    if (typeof endpoint !== "string" || !endpoint) {
      return NextResponse.json(
        { error: "Missing endpoint" },
        { status: 400 },
      );
    }

    const id = subscriptionId(endpoint);
    await getDb().collection("subscriptions").doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to remove subscription" },
      { status: 500 },
    );
  }
}

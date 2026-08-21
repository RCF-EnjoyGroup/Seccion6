import { NextResponse } from "next/server";
import { AccessToken, AgentDispatchClient } from "livekit-server-sdk";

export async function POST(request: Request) {
  try {
    const { room, studentId } = await request.json();

    if (!room) {
      return NextResponse.json({ error: "room is required" }, { status: 400 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "LiveKit credentials not configured" },
        { status: 500 }
      );
    }

    const participantName = studentId
      ? `student-${studentId.slice(0, 8)}`
      : `guest-${Math.random().toString(36).slice(2, 10)}`;

    // Token del estudiante para unirse a la sala
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: participantName,
    });

    at.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    // Agent dispatch vía el cliente oficial del SDK (maneja Bearer JWT internamente).
    // Esto reemplaza el fetch manual con Basic auth que LiveKit Cloud rechazaba con 401.
    try {
      const livekitUrl = process.env.LIVEKIT_URL ?? "wss://edutech-meo77bh3.livekit.cloud";
      const httpUrl = livekitUrl.replace("wss://", "https://").replace("ws://", "http://");

      const dispatchClient = new AgentDispatchClient(httpUrl, apiKey, apiSecret);
      await dispatchClient.createDispatch(room, "edy", {
        metadata: JSON.stringify({ studentId }),
      });

      console.log("[Token] Agent dispatch sent for room:", room);
    } catch (dispatchError) {
      console.warn("[Token] Agent dispatch failed (may already exist):", dispatchError);
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}

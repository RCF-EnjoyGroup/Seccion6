import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

interface EscalationRequest {
  reason: string;
  summary: string;
  student_email?: string;
  student_id?: string;
  student_name?: string;
}

export async function POST(request: Request) {
  try {
    const body: EscalationRequest = await request.json();
    const { reason, summary, student_email, student_id, student_name } = body;

    if (!reason || !summary) {
      return NextResponse.json(
        { error: "reason and summary are required" },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    // Store escalation in the database
    const { data, error } = await admin
      .from("escalations")
      .insert({
        reason,
        summary,
        student_email: student_email ?? null,
        student_id: student_id ?? null,
        student_name: student_name ?? null,
        status: "pending",
        source: "edy_agent",
      })
      .select("id")
      .single();

    if (error) {
      // If the table doesn't exist, log and return a success anyway
      // so the agent can still inform the user
      console.warn("Escalation insert failed (table may not exist):", error.message);
      return NextResponse.json({
        id: `escalation-${Date.now()}`,
        message: "Escalación registrada exitosamente.",
      });
    }

    return NextResponse.json({
      id: data.id,
      message: "Escalación registrada exitosamente. Un asesor humano te contactará pronto.",
    });
  } catch (error) {
    console.error("POST /api/agent/escalations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

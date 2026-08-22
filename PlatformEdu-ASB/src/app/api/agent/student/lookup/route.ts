import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // Usar admin client para listUsers() — requiere service role key
    const admin = createAdminClient();

    // Buscar perfil por email en auth.users
    const { data: authUsers, error: listError } = await admin.auth.admin.listUsers();

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const user = authUsers.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json({ found: false, message: "No se encontró usuario con ese email" }, { status: 404 });
    }

    // Obtener perfil
    const { data: profile } = await admin
      .from("profiles")
      .select("id, full_name, role, onboarded")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({
      found: true,
      student: {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name || user.user_metadata?.full_name || "Sin nombre",
        role: profile?.role || "student",
        onboarded: profile?.onboarded || false,
      },
    });
  } catch (error) {
    console.error("POST /api/agent/student/lookup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/instructor/:path*",
    "/estudiante/:path*",
    "/aprender/:path*",
    "/onboarding/:path*",
    "/checkout/:path*",
  ],
};
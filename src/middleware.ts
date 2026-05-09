import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Quyidagi sahifalarni tekshirishdan o'tkazmaymiz:
     * - _next/static  (static fayllar)
     * - _next/image   (rasm optimizatsiya)
     * - favicon.ico   (favicon)
     * - login sahifasi o'zi
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

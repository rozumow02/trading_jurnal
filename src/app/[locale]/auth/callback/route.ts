import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Localized bosh sahifaga yo'naltirish
      // Agar next "/" bo'lsa, uni /en kabi o'zgartiramiz
      const redirectPath = next === "/" ? `/${locale}` : `/${locale}${next}`;
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  // Xatolik bo'lsa — login sahifasiga qaytish (locale bilan)
  return NextResponse.redirect(`${origin}/${locale}/login?error=auth_callback_error`);
}

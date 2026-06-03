import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPPORTED_LOCALES = ["en", "ru", "tk"];
const DEFAULT_LOCALE = "en";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Sessionni yangilash
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // API routelarni to'g'ridan-to'g'ri o'tkazamiz — ular o'z auth logikasiga ega
  if (pathname.startsWith("/api/")) {
    return supabaseResponse;
  }

  // Locale-ni to'g'ri aniqlash
  const segments = pathname.split("/").filter(Boolean);
  const locale = SUPPORTED_LOCALES.includes(segments[0])
    ? segments[0]
    : DEFAULT_LOCALE;

  // Login sahifasimi yoki auth route-mi?
  const isLoginPage = pathname.includes("/login");
  const isAuthRoute = pathname.includes("/auth/");

  // Kirgan bo'lsa va login sahifasida bo'lsa — bosh sahifaga yo'nalt
  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }

  // Kirmagan bo'lsa va himoyalangan sahifada bo'lsa (login va auth dan tashqari) — login ga yo'nalt
  if (!user && !isLoginPage && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

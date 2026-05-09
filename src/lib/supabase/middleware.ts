import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  // Sessionni yangilash — bu qatorni o'zgartirmang!
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Login sahifasi ochiq — kirishga ruxsat
  const isLoginPage = pathname.includes("/login");

  // Kirgan bo'lsa va login sahifasida bo'lsa — bosh sahifaga yo'nalt
  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Kirmagan bo'lsa va himoyalangan sahifada bo'lsa — loginга yo'nalt
  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = `/${pathname.split("/")[1]}/login`; // locale saqlanadi
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

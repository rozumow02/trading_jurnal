import { type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  // First, update the Supabase session
  const response = await updateSession(request);

  // If Supabase middleware returns a redirect (e.g. to /login), return it immediately
  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  // Then, run the next-intl middleware
  const intlResponse = intlMiddleware(request);

  // Copy cookies from the Supabase response to the intl response to ensure session is maintained
  response.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, {
      path: cookie.path,
      domain: cookie.domain,
      maxAge: cookie.maxAge,
      expires: cookie.expires,
      sameSite: cookie.sameSite,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
    });
  });

  return intlResponse;
}

export const config = {
  matcher: [
    // Combined matchers from both previous middleware/proxy files
    "/",
    "/(en|ru|tk)/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

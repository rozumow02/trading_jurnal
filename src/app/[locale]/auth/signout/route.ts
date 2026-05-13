import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const { origin } = new URL(request.url);

  const supabase = await createClient();
  await supabase.auth.signOut();
  
  return NextResponse.redirect(`${origin}/${locale}/login`, { status: 302 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const { origin } = new URL(request.url);

  const supabase = await createClient();
  await supabase.auth.signOut();
  
  return NextResponse.redirect(`${origin}/${locale}/login`, { status: 302 });
}

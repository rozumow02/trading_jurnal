import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/mt5/keys — user ning barcha keylarini qaytaradi
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [keysRes, accountsRes] = await Promise.all([
    supabase
      .from("mt5_api_keys")
      .select("id, api_key, label, last_used, created_at, default_account_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("prop_accounts")
      .select("id, firm_name, account_type")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
  ]);

  if (keysRes.error) return NextResponse.json({ error: keysRes.error.message }, { status: 500 });
  return NextResponse.json({ keys: keysRes.data, accounts: accountsRes.data ?? [] });
}

// POST /api/mt5/keys — yangi key yaratadi
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const label = body.label ?? "MT5 Account";

  const { data, error } = await supabase
    .from("mt5_api_keys")
    .insert({ user_id: user.id, label })
    .select("id, api_key, label, last_used, created_at, default_account_id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ key: data });
}

// PATCH /api/mt5/keys?id=xxx — default_account_id yangilaydi
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const body = await req.json().catch(() => ({}));

  const { error } = await supabase
    .from("mt5_api_keys")
    .update({ default_account_id: body.default_account_id ?? null })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/mt5/keys?id=xxx — keyni o'chiradi
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("mt5_api_keys")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

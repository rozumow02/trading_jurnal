"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/routing";

export function RealtimeSync() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("trades-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trades" },
        () => { router.refresh(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router]);

  return null;
}

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Plus, Trash2, RefreshCw, CheckCircle2, Circle, Plug, Download, Upload, FileText, FileUp, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ApiKey = {
  id: string;
  api_key: string;
  label: string;
  last_used: string | null;
  created_at: string;
  default_account_id: string | null;
};

type ImportState = "idle" | "uploading" | "done" | "error";
type Account = { id: string; firm_name: string; account_type: string };

// Yopiladigan accordion — qo'shimcha kutubxonasiz (native <details>)
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border border-white/8 bg-white/2">
      <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground select-none list-none">
        <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
        {title}
      </summary>
      <div className="px-4 pb-4 pt-1 space-y-4">{children}</div>
    </details>
  );
}

export function MT5IntegrationView() {
  const t = useTranslations("integration");
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [webhookCopied, setWebhookCopied] = useState(false);
  const [importState, setImportState] = useState<ImportState>("idle");
  const [importResult, setImportResult] = useState<{ imported: number; total: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importAccountId, setImportAccountId] = useState<string>("");
  const [tab, setTab] = useState<"import" | "sync">("import");

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/mt5/webhook`
      : "/api/mt5/webhook";

  async function loadKeys() {
    setLoading(true);
    const res = await fetch("/api/mt5/keys");
    if (res.ok) {
      const json = await res.json();
      setKeys(json.keys ?? []);
      setAccounts(json.accounts ?? []);
    }
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadKeys(); }, []);

  async function createKey() {
    setCreating(true);
    const res = await fetch("/api/mt5/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: "MT5 Account" }),
    });
    if (res.ok) {
      await loadKeys();
    }
    setCreating(false);
  }

  async function deleteKey(id: string) {
    await fetch(`/api/mt5/keys?id=${id}`, { method: "DELETE" });
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function copyWebhook() {
    navigator.clipboard.writeText(webhookUrl);
    setWebhookCopied(true);
    setTimeout(() => setWebhookCopied(false), 2000);
  }

  async function updateKeyAccount(keyId: string, accountId: string) {
    await fetch(`/api/mt5/keys?id=${keyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ default_account_id: accountId || null }),
    });
    setKeys(prev => prev.map(k => k.id === keyId ? { ...k, default_account_id: accountId || null } : k));
  }

  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportState("uploading");
    setImportResult(null);
    setImportError(null);

    const form = new FormData();
    form.append("file", file);
    if (importAccountId) form.append("account_id", importAccountId);

    const res = await fetch("/api/mt5/import", { method: "POST", body: form });
    const json = await res.json();

    if (!res.ok) {
      setImportState("error");
      setImportError(json.error ?? "Import failed");
    } else {
      setImportState("done");
      setImportResult({ imported: json.imported, total: json.total });
    }
    // input ni reset qilamiz
    e.target.value = "";
  }

  function timeSince(dateStr: string | null) {
    if (!dateStr) return t("never");
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("justNow");
    if (mins < 60) return t("minsAgo", { n: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t("hoursAgo", { n: hours });
    return t("daysAgo", { n: Math.floor(hours / 24) });
  }

  const tabBtn = (id: "import" | "sync", label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setTab(id)}
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
        tab === id
          ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      )}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center ring-1 ring-emerald-500/25">
            <Plug className="w-4 h-4 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        </div>
        <p className="text-muted-foreground text-sm ml-12">{t("subtitle")}</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl border border-white/8 bg-white/2 w-fit">
        {tabBtn("import", t("tabImport"), <FileUp className="w-4 h-4" />)}
        {tabBtn("sync", t("tabAutoSync"), <Zap className="w-4 h-4" />)}
      </div>

      {/* ─── Tab: Import file ─────────────────────────────────────── */}
      {tab === "import" && (
        <div className="space-y-4">
          {/* Account tanlash */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t("importAccount")}</label>
            <select
              value={importAccountId}
              onChange={e => setImportAccountId(e.target.value)}
              className="w-full text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-emerald-500/40"
            >
              <option value="">{t("noAccount")}</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.firm_name}</option>
              ))}
            </select>
          </div>

          {/* Upload zone */}
          <label className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-colors",
            importState === "uploading"
              ? "border-emerald-500/30 bg-emerald-500/5 pointer-events-none"
              : "border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/3"
          )}>
            {importState === "uploading" ? (
              <>
                <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                <p className="text-sm text-muted-foreground">{t("importing")}</p>
              </>
            ) : importState === "done" && importResult ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <p className="text-sm font-medium text-emerald-400">
                  {t("importDone", { imported: importResult.imported, total: importResult.total })}
                </p>
                <p className="text-xs text-muted-foreground">{t("importAgain")}</p>
              </>
            ) : importState === "error" ? (
              <>
                <FileText className="w-6 h-6 text-red-400" />
                <p className="text-sm text-red-400">{importError}</p>
                <p className="text-xs text-muted-foreground">{t("tryAgain")}</p>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-muted-foreground/50" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t("uploadLabel")}</p>
                  <p className="text-xs text-muted-foreground/50 mt-0.5">.htm · .html · .csv · .json</p>
                </div>
              </>
            )}
            <input
              type="file"
              accept=".htm,.html,.csv,.json"
              className="hidden"
              onChange={handleFileImport}
              disabled={importState === "uploading"}
            />
          </label>

          {/* Format & namuna (accordion) */}
          <Section title={t("showFormat")}>
            <p className="text-xs text-muted-foreground">{t("stdFormatDesc")}</p>

            {/* Maydonlar jadvali */}
            <div className="overflow-x-auto rounded-lg border border-white/6">
              <table className="w-full text-xs">
                <thead className="bg-white/3 text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-3 py-2">{t("stdColField")}</th>
                    <th className="text-left font-medium px-3 py-2">{t("stdColRequired")}</th>
                    <th className="text-left font-medium px-3 py-2">{t("stdColNote")}</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground/80">
                  {[
                    ["symbol", true, t("stdSymbol")],
                    ["direction", true, "long / short"],
                    ["volume", true, t("stdVolume")],
                    ["open_price", true, t("stdOpenPrice")],
                    ["close_price", false, t("stdClosePrice")],
                    ["open_time", true, t("stdOpenTime")],
                    ["close_time", false, t("stdCloseTime")],
                    ["profit", false, t("stdProfit")],
                    ["fee", false, t("stdFee")],
                    ["ticket", false, t("stdTicket")],
                  ].map(([field, req, note]) => (
                    <tr key={field as string} className="border-t border-white/5">
                      <td className="px-3 py-2 font-mono text-emerald-400">{field as string}</td>
                      <td className="px-3 py-2">{req ? "✓" : "—"}</td>
                      <td className="px-3 py-2">{note as string}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CSV misol */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">CSV</p>
              <pre className="text-[11px] leading-relaxed bg-black/30 border border-white/8 rounded-lg p-3 overflow-x-auto text-muted-foreground/80 font-mono">
{`symbol,direction,volume,open_price,close_price,open_time,close_time,profit,fee,ticket
EURUSD,long,0.10,1.08500,1.08750,2026-06-14T09:30:00,2026-06-14T14:00:00,25.00,0.80,1001
XAUUSD,long,0.20,2350.50,,2026-06-16T08:00:00,,,0,1003`}
              </pre>
            </div>

            {/* JSON misol */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">JSON</p>
              <pre className="text-[11px] leading-relaxed bg-black/30 border border-white/8 rounded-lg p-3 overflow-x-auto text-muted-foreground/80 font-mono">
{`[
  { "symbol": "EURUSD", "direction": "long", "volume": 0.1,
    "open_price": 1.085, "close_price": 1.0875,
    "open_time": "2026-06-14T09:30:00",
    "close_time": "2026-06-14T14:00:00",
    "profit": 25.0, "fee": 0.8, "ticket": 1001 },
  { "symbol": "XAUUSD", "direction": "long", "volume": 0.2,
    "open_price": 2350.5, "open_time": "2026-06-16T08:00:00" }
]`}
              </pre>
            </div>

            <p className="text-xs text-muted-foreground/70">{t("stdPendingNote")}</p>

            {/* Namuna yuklab olish */}
            <div className="flex flex-wrap gap-2">
              <a
                href="/templates/jurnal-import-sample.csv"
                download
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground border border-white/10 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                {t("stdDownloadCsv")}
              </a>
              <a
                href="/templates/jurnal-import-sample.json"
                download
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground border border-white/10 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                {t("stdDownloadJson")}
              </a>
            </div>
          </Section>

          {/* MT5 dan qanday eksport qilish (accordion) */}
          <Section title={t("showExport")}>
            <ol className="space-y-1.5">
              {[t("exp1"), t("exp2"), t("exp3")].map((s, i) => (
                <li key={i} className="text-xs text-muted-foreground/80 flex gap-2">
                  <span className="text-emerald-500/70">{i + 1}.</span>{s}
                </li>
              ))}
            </ol>
          </Section>
        </div>
      )}

      {/* ─── Tab: Auto-sync (MT5 EA) ──────────────────────────────── */}
      {tab === "sync" && (
        <div className="space-y-4">
          {/* Webhook URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("webhookUrl")}</label>
            <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/2 px-4 py-3">
              <code className="flex-1 text-sm text-emerald-400 font-mono truncate">{webhookUrl}</code>
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0 h-8 px-3 text-xs gap-1.5"
                onClick={copyWebhook}
              >
                <Copy className="w-3.5 h-3.5" />
                {webhookCopied ? t("copied") : t("copy")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t("webhookDesc")}</p>
          </div>

          {/* API Keys */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium">{t("apiKeys")}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{t("apiKeysDesc")}</p>
              </div>
              <Button
                size="sm"
                onClick={createKey}
                disabled={creating}
                className="gap-1.5 h-8 px-3 text-xs bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20"
              >
                {creating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                {t("generateKey")}
              </Button>
            </div>

            {loading ? (
              <div className="rounded-xl border border-white/8 bg-white/2 p-8 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : keys.length === 0 ? (
              <div className="rounded-xl border border-white/8 border-dashed bg-white/1 p-8 text-center">
                <p className="text-sm text-muted-foreground">{t("noKeys")}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{t("noKeysDesc")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {keys.map((k) => (
                  <div
                    key={k.id}
                    className="rounded-xl border border-white/8 bg-white/2 px-4 py-3 flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        {k.last_used ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                        )}
                        <span className="text-xs font-medium">{k.label}</span>
                        <span className="text-xs text-muted-foreground/50">
                          {k.last_used ? `${t("lastSync")}: ${timeSince(k.last_used)}` : t("notConnected")}
                        </span>
                      </div>
                      <code className="text-xs text-muted-foreground font-mono truncate block">
                        {k.api_key}
                      </code>
                      {/* Account selector */}
                      <select
                        value={k.default_account_id ?? ""}
                        onChange={e => updateKeyAccount(k.id, e.target.value)}
                        className="w-full text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-muted-foreground focus:outline-none focus:border-emerald-500/40"
                      >
                        <option value="">{t("noAccount")}</option>
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.firm_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className={cn("h-7 px-2.5 text-xs gap-1", copiedId === k.id && "text-emerald-400")}
                        onClick={() => copyText(k.api_key, k.id)}
                      >
                        <Copy className="w-3 h-3" />
                        {copiedId === k.id ? t("copied") : t("copy")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-muted-foreground hover:text-red-400"
                        onClick={() => deleteKey(k.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EA Download */}
          <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/2 px-5 py-4">
            <div>
              <p className="text-sm font-medium">JurnalEA.mq5</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("eaFileDesc")}</p>
            </div>
            <a
              href="/ea/JurnalEA.mq5"
              download="JurnalEA.mq5"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              {t("downloadEa")}
            </a>
          </div>

          {/* Qanday ishlaydi (accordion) */}
          <Section title={t("howItWorks")}>
            <ol className="space-y-2">
              {[t("step1"), t("step2"), t("step3"), t("step4")].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-emerald-500/20">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </Section>

          {/* EA o'rnatish (accordion) */}
          <Section title={t("eaSetup")}>
            <ol className="space-y-2">
              {[t("ea1"), t("ea2"), t("ea3"), t("ea4"), t("ea5")].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-white/5 text-xs flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-white/10">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </Section>
        </div>
      )}
    </div>
  );
}

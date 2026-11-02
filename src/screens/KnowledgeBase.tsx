import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { SectionHeader } from "../components/SectionHeader";
import { MetricCard } from "../components/MetricCard";
import { Card } from "../components/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { FileText, Upload, Search, Database, Zap, Clock, Loader2, Trash2, Sparkles, Plus, Pencil, X, Check, RefreshCw } from "lucide-react";
import { IconButton } from "../components/ui/IconButton";
import { useToast } from "../components/ToastProvider";
import * as mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import { useAppStore, Document } from "../store";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// A file whose extracted text is shorter than this has nothing useful in
// it — typically a scanned PDF (an image of text) or an empty document.
const MIN_READABLE_CHARS = 20;

type IndexedDoc = { chunks: number; indexedAt: string | null };

const formatSize = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "";

const timeAgo = (iso: string | null) => {
  if (!iso) return "Never";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return days < 30 ? `${days} day${days === 1 ? "" : "s"} ago` : formatDate(iso);
};

async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    let fullText = "";
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      fullText += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return fullText;
  }
  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return result.value;
  }
  return file.text(); // .txt, .md
}

export const KnowledgeBase = () => {
  const { documents, hydrateDocuments, token } = useAppStore();
  const { toast } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  // ── AI Instructions (nativeRagPromptAddendum) ─────────────────────────
  // Self-service replacement for what previously required a developer to
  // hand-write and push via a one-off Node script + manual SQL.
  const [aiInstructions, setAiInstructions] = React.useState("");
  const [aiInstructionsLoaded, setAiInstructionsLoaded] = React.useState(false);
  const [aiInstructionsSaving, setAiInstructionsSaving] = React.useState(false);

  React.useEffect(() => {
    if (!token) return;
    fetch(`${apiUrl}/api/user/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setAiInstructions(data?.knowledgeBase?.aiInstructions || "");
        setAiInstructionsLoaded(true);
      })
      .catch(() => setAiInstructionsLoaded(true));
  }, [token]);

  const handleSaveAiInstructions = async () => {
    setAiInstructionsSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/user/ai-instructions`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ aiInstructions }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Save failed");
      toast("AI Instructions saved — applies to every channel immediately.", "success");
    } catch (err: any) {
      toast(err.message || "Failed to save AI Instructions.", "error");
    }
    setAiInstructionsSaving(false);
  };

  // ── Priority Facts (curated facts, force-include via triggerPattern) ──
  // Self-service replacement for migrate-leads-curated-facts.js.
  type CuratedFact = { id: string; title: string; content: string; triggerPattern: string };
  const [curatedFacts, setCuratedFacts] = React.useState<CuratedFact[]>([]);
  const [factsLoading, setFactsLoading] = React.useState(true);
  const [showFactForm, setShowFactForm] = React.useState(false);
  const [editingFactId, setEditingFactId] = React.useState<string | null>(null);
  const [factTitle, setFactTitle] = React.useState("");
  const [factContent, setFactContent] = React.useState("");
  const [factTriggers, setFactTriggers] = React.useState("");
  const [factSaving, setFactSaving] = React.useState(false);

  const fetchCuratedFacts = React.useCallback(async () => {
    if (!token) return;
    setFactsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/user/curated-facts`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCuratedFacts(Array.isArray(data) ? data : []);
    } catch (err) {
      // Non-fatal — the rest of the page still works without this list.
    }
    setFactsLoading(false);
  }, [token]);

  React.useEffect(() => { fetchCuratedFacts(); }, [fetchCuratedFacts]);

  const resetFactForm = () => {
    setShowFactForm(false);
    setEditingFactId(null);
    setFactTitle("");
    setFactContent("");
    setFactTriggers("");
  };

  const startEditFact = (fact: CuratedFact) => {
    setEditingFactId(fact.id);
    setFactTitle(fact.title);
    setFactContent(fact.content);
    // triggerPattern is a regex like \b(kw1|kw2)\b — best-effort unpack
    // back into plain comma-separated keywords for editing. If it was
    // hand-edited into something more complex, this may not perfectly
    // round-trip — saving again will simply rebuild it from whatever
    // plain keywords are shown here, which is the expected trade-off for
    // keeping this a plain-text field rather than a raw-regex editor.
    const inner = fact.triggerPattern.replace(/^\\b\(/, "").replace(/\)\\b$/, "");
    const words = inner.split("|").map(w => w.replace(/\\s\+/g, " ").replace(/\\(.)/g, "$1"));
    setFactTriggers(words.join(", "));
    setShowFactForm(true);
  };

  const handleSaveFact = async () => {
    if (!factTitle.trim() || !factContent.trim() || !factTriggers.trim()) {
      toast("Title, content, and at least one trigger keyword are all required.", "error");
      return;
    }
    setFactSaving(true);
    const triggerKeywords = factTriggers.split(",").map(k => k.trim()).filter(Boolean);
    try {
      const url = editingFactId ? `${apiUrl}/api/user/curated-facts/${editingFactId}` : `${apiUrl}/api/user/curated-facts`;
      const res = await fetch(url, {
        method: editingFactId ? "PUT" : "POST",
        headers: authHeaders,
        body: JSON.stringify({ title: factTitle, content: factContent, triggerKeywords }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Save failed");
      toast(editingFactId ? "Priority fact updated." : "Priority fact added — it will now always be included when those keywords are mentioned.", "success");
      resetFactForm();
      fetchCuratedFacts();
    } catch (err: any) {
      toast(err.message || "Failed to save priority fact.", "error");
    }
    setFactSaving(false);
  };

  const handleDeleteFact = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/user/curated-facts/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Delete failed");
      setCuratedFacts(prev => prev.filter(f => f.id !== id));
      toast("Priority fact removed.", "success");
    } catch (err) {
      toast("Failed to delete priority fact.", "error");
    }
  };

  // ── Search index status (real numbers, from the server) ───────────────
  // What the AI can actually search: passages per document and when each
  // was last indexed. Replaces the old browser-side guesses ("Mock chunks",
  // a hardcoded "Just now").
  const [indexByName, setIndexByName] = React.useState<Map<string, IndexedDoc>>(new Map());
  const [totalChunks, setTotalChunks] = React.useState<number | null>(null);
  const [lastIndexedAt, setLastIndexedAt] = React.useState<string | null>(null);
  const [indexLoaded, setIndexLoaded] = React.useState(false);

  const fetchIndexStatus = React.useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/user/knowledge-base/index-status`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("status failed");
      const data = await res.json();
      setIndexByName(new Map((data.docs || []).map((d: any) => [d.name, { chunks: d.chunks, indexedAt: d.indexedAt }])));
      setTotalChunks(data.totalChunks ?? 0);
      setLastIndexedAt(data.lastIndexedAt ?? null);
    } catch {
      // Leave the previous numbers in place; rows show "Checking…" until loaded.
    }
    setIndexLoaded(true);
  }, [token]);

  React.useEffect(() => { fetchIndexStatus(); }, [fetchIndexStatus]);

  // ── Saving documents ───────────────────────────────────────────────────
  // Saves the document list and waits for the server to index the changes,
  // so each row can show its real result. Only added, edited or removed
  // documents are re-indexed on the server; the rest are left alone.
  const [indexingNames, setIndexingNames] = React.useState<Set<string>>(new Set());
  const [busy, setBusy] = React.useState(false);

  const saveDocuments = async (next: Document[], changedNames: string[]) => {
    hydrateDocuments(next); // update the list immediately, without the store's own auto-save
    setIndexingNames(new Set(changedNames));
    setBusy(true);
    try {
      const res = await fetch(`${apiUrl}/api/user/knowledge-base`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ documents: next.map(({ base64, ...rest }) => rest) }),
      });
      if (!res.ok) throw new Error(res.status === 413 ? "These files are too large to save in one go." : "Save failed");
      const data = await res.json();
      const indexed: { name: string; chunks: number; failed: number }[] = data?.reindexed?.indexed || [];
      const failed = indexed.filter(d => d.failed > 0 || d.chunks === 0);
      if (data?.reindexed === null) {
        toast("Saved, but the documents couldn't be indexed right now. Try again in a few minutes.", "error");
      } else if (failed.length > 0) {
        toast(`Couldn't fully index: ${failed.map(d => d.name).join(", ")}. Click Retry on the document.`, "error");
      }
    } catch (err: any) {
      toast(err.message || "Failed to save documents.", "error");
    } finally {
      setIndexingNames(new Set());
      setBusy(false);
      fetchIndexStatus();
    }
  };

  // ── Uploading ──────────────────────────────────────────────────────────
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter(f => /\.(pdf|txt|md|docx)$/i.test(f.name));
    if (files.length === 0) {
      toast("Please choose PDF, Word (.docx), TXT or Markdown files.", "error");
      return;
    }
    setBusy(true);
    const added: Document[] = [];
    const unreadable: string[] = [];
    const errored: string[] = [];

    for (const file of files) {
      try {
        const text = await extractText(file);
        if (text.trim().length < MIN_READABLE_CHARS) {
          unreadable.push(file.name);
          continue;
        }
        added.push({
          name: file.name,
          size: formatSize(file.size),
          chunks: 0,
          status: "Active",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
          type: file.type,
          textContent: text,
        });
      } catch (error) {
        console.error(`Error reading ${file.name}:`, error);
        errored.push(file.name);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (unreadable.length > 0) {
      toast(
        `No readable text in ${unreadable.join(", ")}. If it's a scanned PDF, export it with text (or copy the text into a .txt file) and upload that instead.`,
        "error"
      );
    }
    if (errored.length > 0) toast(`Couldn't open ${errored.join(", ")}. The file may be damaged or password-protected.`, "error");
    if (added.length === 0) { setBusy(false); return; }

    // Uploading a file with the same name replaces the old version.
    const addedNames = new Set(added.map(d => d.name));
    const next = [...documents.filter(d => !addedNames.has(d.name)), ...added];
    await saveDocuments(next, [...addedNames]);
  };

  const handleDeleteDocument = async (name: string) => {
    await saveDocuments(documents.filter(doc => doc.name !== name), []);
  };

  const handleRetry = async (name: string) => {
    // Re-saving the same list makes the server index any document that has
    // text but no passages yet.
    await saveDocuments(documents, [name]);
  };

  // ── Row status ─────────────────────────────────────────────────────────
  const rowStatus = (doc: Document): { label: string; variant: "success" | "warn" | "danger" | "default"; retry?: boolean } => {
    if (indexingNames.has(doc.name)) return { label: "Indexing…", variant: "warn" };
    if (!indexLoaded) return { label: "Checking…", variant: "default" };
    const chunks = indexByName.get(doc.name)?.chunks ?? 0;
    if (chunks > 0) return { label: "Indexed", variant: "success" };
    if (!doc.textContent || doc.textContent.trim().length < MIN_READABLE_CHARS) return { label: "No readable text", variant: "danger" };
    return { label: "Not indexed", variant: "danger", retry: true };
  };

  const [searchQuery, setSearchQuery] = React.useState("");
  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-8 max-w-[1400px] mx-auto"
    >
      <SectionHeader
        title="Knowledge Base"
        subtitle="The documents your AI agent answers from. Upload your price lists, policies, FAQs and brochures."
      />

      <div className="grid grid-cols-3 gap-6 mb-8">
        <MetricCard label="Total Documents" value={documents.length.toString()} icon={<Database size={16} />} />
        <MetricCard
          label="Searchable Passages"
          value={totalChunks === null ? "—" : totalChunks.toLocaleString()}
          icon={<Zap size={16} className="text-brand" />}
        />
        <MetricCard label="Last Updated" value={indexLoaded ? timeAgo(lastIndexedAt) : "—"} icon={<Clock size={16} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Document List */}
        <div className="lg:col-span-2">
          <Card variant="noPad">
            <div className="p-4 border-b border-border-faint flex items-center bg-bg-elevated/50">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="w-full bg-bg border border-border-mid rounded-lg h-9 pl-9 pr-3 text-[12px] outline-none text-text-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="divide-y divide-border-faint max-h-[460px] overflow-y-auto">
              {filteredDocuments.map((doc) => {
                const idx = indexByName.get(doc.name);
                const status = rowStatus(doc);
                const meta = [
                  doc.size,
                  indexLoaded ? `${(idx?.chunks ?? 0).toLocaleString()} passage${(idx?.chunks ?? 0) === 1 ? "" : "s"}` : null,
                ].filter(Boolean).join(" · ");
                return (
                  <div key={doc.name} className="p-4 flex items-center justify-between gap-4 hover:bg-surface-high/30 transition-colors group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-surface border border-border-strong flex items-center justify-center text-text-muted group-hover:text-brand shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[13px] font-semibold text-text-primary truncate">{doc.name}</h4>
                        {meta && <p className="text-[11px] text-text-muted mt-0.5 font-mono">{meta}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {idx?.indexedAt && <span className="hidden sm:inline text-[11px] text-text-muted font-mono">{formatDate(idx.indexedAt)}</span>}
                      <Badge variant={status.variant} size="xs">{status.label}</Badge>
                      {status.retry && (
                        <button
                          onClick={() => handleRetry(doc.name)}
                          disabled={busy}
                          className="flex items-center gap-1 text-[11px] font-bold text-brand hover:underline disabled:opacity-50"
                        >
                          <RefreshCw size={11} /> Retry
                        </button>
                      )}
                      <IconButton onClick={() => handleDeleteDocument(doc.name)} disabled={busy} aria-label={`Delete ${doc.name}`}>
                        <Trash2 size={14} className="text-text-muted hover:text-red-500" />
                      </IconButton>
                    </div>
                  </div>
                );
              })}
              {filteredDocuments.length === 0 && (
                <div className="p-8 text-center text-text-muted text-[13px]">
                  {documents.length === 0 ? "No documents yet. Upload your first file to start." : "No documents match your search."}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Upload */}
        <div>
          <div
            onClick={() => !busy && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); if (!busy) handleFiles(e.dataTransfer.files); }}
          >
            <Card className={`border-dashed border-2 ${dragOver ? "border-brand bg-brand-faint/20" : "border-border-strong bg-brand-faint/5"} group hover:border-brand/40 transition-colors ${busy ? "cursor-wait" : "cursor-pointer"}`}>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-brand-faint flex items-center justify-center text-brand mb-4 group-hover:scale-110 transition-transform">
                  {busy ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                </div>
                <h3 className="text-[14px] font-bold text-text-primary">{busy ? "Updating your knowledge base…" : "Upload documents"}</h3>
                <p className="text-[12px] text-text-muted mt-1 px-4">
                  Drag and drop, or click to choose. PDF, Word (.docx), TXT or Markdown.
                </p>
                <p className="text-[11px] text-text-muted mt-2 px-4">
                  Scanned PDFs (images of text) can't be read. Uploading a file with the same name replaces the old one.
                </p>
                {!busy && <Button size="sm" variant="primary" className="mt-4">Select Files</Button>}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  accept=".pdf,.txt,.md,.docx"
                  onChange={(e) => e.target.files && handleFiles(e.target.files)}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Instructions — self-service business rules, applies to every channel */}
      <div className="mt-8">
        <Card variant="noPad">
          <div className="p-4 border-b border-border-faint bg-bg-elevated/50 flex items-center gap-2">
            <Sparkles size={14} className="text-brand" />
            <div>
              <h3 className="text-[13px] font-bold text-text-primary">AI Instructions</h3>
              <p className="text-[11px] text-text-muted mt-0.5">Custom rules and behavior your AI Agent follows on every channel — e.g. how to handle discounts, what to never say, or how to escalate.</p>
            </div>
          </div>
          <div className="p-4">
            <textarea
              className="w-full min-h-[160px] bg-bg border border-border-mid rounded-lg p-3 text-[12px] outline-none text-text-primary font-mono resize-y transition-colors focus:border-brand"
              placeholder="e.g. Never quote a fee without confirming the program first. If a discount applies, always show the full breakdown, not just the discounted total..."
              value={aiInstructions}
              onChange={(e) => setAiInstructions(e.target.value)}
              disabled={!aiInstructionsLoaded}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-[11px] text-text-muted font-mono">{aiInstructions.length.toLocaleString()} / 20,000 characters</span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveAiInstructions}
                disabled={aiInstructionsSaving || !aiInstructionsLoaded}
                className="h-9 px-4 gap-2 rounded-lg font-semibold shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-60"
              >
                {aiInstructionsSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {aiInstructionsSaving ? "Saving…" : "Save instructions"}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Priority Facts — force-included regardless of similarity ranking */}
      <div className="mt-6">
        <Card variant="noPad">
          <div className="p-4 border-b border-border-faint bg-bg-elevated/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-brand" />
              <div>
                <h3 className="text-[13px] font-bold text-text-primary">Priority Facts</h3>
                <p className="text-[11px] text-text-muted mt-0.5">Facts that are ALWAYS included in the AI's context when specific keywords are mentioned — use for critical info that must never be missed or answered incorrectly (e.g. fees, discounts, policies).</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => (showFactForm ? resetFactForm() : setShowFactForm(true))}
              aria-expanded={showFactForm}
              className="h-9 px-4 gap-2 rounded-lg font-semibold shrink-0 transition-all duration-200 active:scale-[0.98]"
            >
              <motion.span
                animate={{ rotate: showFactForm ? 45 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="flex"
              >
                <Plus size={14} />
              </motion.span>
              {showFactForm ? "Close" : "Add fact"}
            </Button>
          </div>

          <AnimatePresence initial={false}>
          {showFactForm && (
            <motion.div
              key="fact-form"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.2 } }}
              className="overflow-hidden border-b border-border-faint"
              onAnimationComplete={() => { if (showFactForm) document.getElementById("fact-title")?.focus(); }}
            >
            <motion.div
              initial={{ y: -8 }}
              animate={{ y: 0 }}
              exit={{ y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="p-4 bg-brand-faint/5 space-y-3"
            >
              <div>
                <label className="text-[11px] font-semibold text-text-muted">Title</label>
                <input
                  id="fact-title"
                  type="text"
                  className="w-full mt-1 bg-bg border border-border-mid rounded-lg h-9 px-3 text-[12px] outline-none text-text-primary transition-colors focus:border-brand"
                  placeholder="e.g. BS Data Science Fee Structure"
                  value={factTitle}
                  onChange={(e) => setFactTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-text-muted">Fact content (exactly what the AI should say)</label>
                <textarea
                  className="w-full mt-1 min-h-[100px] bg-bg border border-border-mid rounded-lg p-3 text-[12px] outline-none text-text-primary resize-y transition-colors focus:border-brand"
                  placeholder="Write the actual fact, as complete and precise as you want the AI's answer to be..."
                  value={factContent}
                  onChange={(e) => setFactContent(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-text-muted">Trigger keywords/phrases (comma-separated)</label>
                <input
                  type="text"
                  className="w-full mt-1 bg-bg border border-border-mid rounded-lg h-9 px-3 text-[12px] outline-none text-text-primary transition-colors focus:border-brand"
                  placeholder="e.g. BS Data Science, data science, cybersecurity"
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveFact(); }}
                  value={factTriggers}
                  onChange={(e) => setFactTriggers(e.target.value)}
                />
                <p className="text-[10px] text-text-muted mt-1">This fact is force-included whenever a customer's message contains any of these words or phrases — regardless of how the AI would otherwise rank it.</p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={resetFactForm}
                  disabled={factSaving}
                  className="h-9 px-4 gap-2 rounded-lg font-semibold border border-border-mid bg-bg text-text-second transition-all duration-200 hover:bg-surface-high hover:text-text-primary active:scale-[0.98]"
                >
                  <X size={14} /> Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveFact}
                  disabled={factSaving}
                  className="h-9 px-4 gap-2 rounded-lg font-semibold shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-60"
                >
                  {factSaving ? <Loader2 size={14} className="animate-spin" /> : editingFactId ? <Check size={14} /> : <Plus size={14} />}
                  {factSaving ? "Saving…" : editingFactId ? "Update fact" : "Add fact"}
                </Button>
              </div>
            </motion.div>
            </motion.div>
          )}
          </AnimatePresence>

          <div className="divide-y divide-border-faint max-h-[400px] overflow-y-auto">
            {factsLoading && (
              <div className="p-8 text-center text-text-muted text-[13px] flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Loading priority facts...
              </div>
            )}
            {!factsLoading && curatedFacts.length === 0 && (
              <div className="p-8 text-center text-text-muted text-[13px]">
                No priority facts yet. Add one for anything the AI must always get right.
              </div>
            )}
            {!factsLoading && curatedFacts.map((fact) => (
              <div key={fact.id} className="p-4 flex items-start justify-between gap-4 hover:bg-surface-high/30 transition-colors group">
                <div className="min-w-0 flex-1">
                  <h4 className="text-[13px] font-semibold text-text-primary">{fact.title}</h4>
                  <p className="text-[11px] text-text-muted mt-1 line-clamp-2">{fact.content}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="default" size="xs">Priority Fact</Badge>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <IconButton onClick={() => startEditFact(fact)}>
                    <Pencil size={14} className="text-text-muted hover:text-brand" />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteFact(fact.id)}>
                    <Trash2 size={14} className="text-text-muted hover:text-red-500" />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

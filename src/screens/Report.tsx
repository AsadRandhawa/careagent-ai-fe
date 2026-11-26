import * as React from "react";
import { SectionHeader } from "../components/SectionHeader";
import { MetricCard } from "../components/MetricCard";
import { Card } from "../components/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Users, Flame, Mail, TrendingUp, Calendar, Filter, MessageSquare, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store";

export type Lead = {
  id: string;
  ticketId: string;
  name: string;
  phone: string | null;
  email: string | null;
  interestLevel: string | null;
  admissionEligibility: string | null;
  budget: string | null;
  programInterest: string | null;
  keyConcerns: string | null;
  callStatus: string | null;
  reasons: string | null;
  leadStatus: string;
  handledBy: string | null;
  otherNotes: string | null;
  updatedAt: string;
  createdAt: string;
};

const INTEREST_BADGE: Record<string, "danger" | "warn" | "default" | "brand"> = {
  Hot: "danger",
  Warm: "warn",
  Cold: "default",
  "Not Eligible": "default",
};

const LEAD_STATUS_OPTIONS = ["New", "Nourishing", "Fee Submitted", "Lost"];
const CALL_STATUS_OPTIONS = ["", "Not Answered", "Connected", "Voicemail", "Wrong Number"];

export type LeadMetricKey = "total" | "hot" | "email" | "feeSubmitted";

export const LEAD_PREDICATES: Record<LeadMetricKey, (lead: Lead) => boolean> = {
  total: (_l: Lead) => true,
  hot: (l: Lead) => l.interestLevel === "Hot",
  email: (l: Lead) => Boolean(l.email && l.email.trim()),
  feeSubmitted: (l: Lead) => l.leadStatus === "Fee Submitted",
};

const LEAD_METRIC_CONFIG: Record<LeadMetricKey, { title: string; subtext: string; icon: React.ReactNode }> = {
  total: {
    title: "Total Leads",
    subtext: "Qualifying conversations",
    icon: <Users size={16} />,
  },
  hot: {
    title: "Hot Leads",
    subtext: "Ready to follow up",
    icon: <Flame size={16} className="text-danger" />,
  },
  email: {
    title: "With Email",
    subtext: "Have contact email",
    icon: <Mail size={16} />,
  },
  feeSubmitted: {
    title: "Fee Submitted",
    subtext: "Converted so far",
    icon: <TrendingUp size={16} className="text-success" />,
  },
};

export const Report = () => {
  const navigate = useNavigate();
  const { token } = useAppStore();
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [days, setDays] = React.useState(30);
  const [activeModalMetric, setActiveModalMetric] = React.useState<LeadMetricKey | null>(null);

  const apiUrl = (import.meta.env.VITE_API_URL || "https://careagent-ai-be-production.up.railway.app").replace(/\/+$/, "");

  const fetchLeads = React.useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/leads?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setLeads(await res.json());
    } catch (err) {
      console.error("[Report] Failed to fetch leads:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token, apiUrl, days]);

  React.useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Updates a human-editable field. Optimistic — the row updates
  // immediately in the UI, then syncs to the server; if the save fails,
  // the field is reverted and a fresh fetch corrects the whole list rather
  // than leaving the UI showing something the server never actually saved.
  const updateLeadField = async (leadId: string, field: keyof Lead, value: string) => {
    const previous = leads;
    setLeads(prev => prev.map(l => (l.id === leadId ? { ...l, [field]: value } : l)));
    setSavingId(leadId);
    try {
      const res = await fetch(`${apiUrl}/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error("Save failed");
    } catch (err) {
      console.error("[Report] Failed to save lead field:", err);
      setLeads(previous); // revert optimistic update
      fetchLeads(); // reconcile with the server's actual state
    } finally {
      setSavingId(null);
    }
  };

  const totalCount = leads.filter(LEAD_PREDICATES.total).length;
  const hotCount = leads.filter(LEAD_PREDICATES.hot).length;
  const withEmailCount = leads.filter(LEAD_PREDICATES.email).length;
  const feeSubmittedCount = leads.filter(LEAD_PREDICATES.feeSubmitted).length;

  const dateRangeLabel = React.useMemo(() => {
    const end = new Date();
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const formatDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `Last ${days} days (${formatDate(start)} – ${formatDate(end)})`;
  }, [days]);

  const modalLeads = activeModalMetric ? leads.filter(LEAD_PREDICATES[activeModalMetric]) : [];

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Lead Report"
          subtitle={`Qualified WhatsApp leads from the last ${days} days, auto-extracted from real conversations.`}
        />
        <div className="flex gap-2">
          <Button size="sm" variant={days === 30 ? "primary" : "ghost"} icon={<Calendar size={14} />} onClick={() => setDays(30)}>
            30 Days
          </Button>
          <Button size="sm" variant={days === 7 ? "primary" : "ghost"} icon={<Filter size={14} />} onClick={() => setDays(7)}>
            7 Days
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
        <MetricCard
          label="Total Leads"
          value={String(totalCount)}
          subtext="Qualifying conversations"
          icon={<Users size={16} />}
          loading={isLoading && leads.length === 0}
          onClick={() => setActiveModalMetric("total")}
        />
        <MetricCard
          label="Hot Leads"
          value={String(hotCount)}
          subtext="Ready to follow up"
          icon={<Flame size={16} className="text-danger" />}
          loading={isLoading && leads.length === 0}
          onClick={() => setActiveModalMetric("hot")}
        />
        <MetricCard
          label="With Email"
          value={String(withEmailCount)}
          subtext="Have contact email"
          icon={<Mail size={16} />}
          loading={isLoading && leads.length === 0}
          onClick={() => setActiveModalMetric("email")}
        />
        <MetricCard
          label="Fee Submitted"
          value={String(feeSubmittedCount)}
          subtext="Converted so far"
          icon={<TrendingUp size={16} className="text-success" />}
          loading={isLoading && leads.length === 0}
          onClick={() => setActiveModalMetric("feeSubmitted")}
        />
      </div>

      <Card>
        {leads.length === 0 && !isLoading ? (
          <div className="text-center text-text-muted text-sm py-12">
            No qualified leads yet. They appear once a WhatsApp conversation
            includes an academic aggregate, a program of interest,
            or a budget preference.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border-faint text-left text-text-muted uppercase tracking-wide text-[10px]">
                  <th className="py-2 pr-4 font-semibold">Name</th>
                  <th className="py-2 pr-4 font-semibold">WhatsApp No.</th>
                  <th className="py-2 pr-4 font-semibold">Email</th>
                  <th className="py-2 pr-4 font-semibold">Interest Level</th>
                  <th className="py-2 pr-4 font-semibold">Eligibility</th>
                  <th className="py-2 pr-4 font-semibold">Budget</th>
                  <th className="py-2 pr-4 font-semibold">Program</th>
                  <th className="py-2 pr-4 font-semibold">Key Concerns</th>
                  <th className="py-2 pr-4 font-semibold">Call Status</th>
                  <th className="py-2 pr-4 font-semibold">Lead Status</th>
                  <th className="py-2 pr-4 font-semibold">Handled By</th>
                  <th className="py-2 pr-4 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} className={`border-b border-border-faint/50 ${savingId === lead.id ? "opacity-60" : ""}`}>
                    <td className="py-2.5 pr-4 font-medium text-text-primary whitespace-nowrap">{lead.name}</td>
                    <td className="py-2.5 pr-4 text-text-second whitespace-nowrap font-mono text-[11px]">{lead.phone || "—"}</td>
                    <td className="py-2.5 pr-4 text-text-second whitespace-nowrap">{lead.email || "—"}</td>
                    <td className="py-2.5 pr-4">
                      {lead.interestLevel ? (
                        <Badge variant={INTEREST_BADGE[lead.interestLevel] || "default"} size="xs">{lead.interestLevel}</Badge>
                      ) : "—"}
                    </td>
                    <td className="py-2.5 pr-4">
                      {lead.admissionEligibility ? (
                        <Badge variant={lead.admissionEligibility === "Eligible" ? "brand" : "danger"} size="xs">{lead.admissionEligibility}</Badge>
                      ) : "—"}
                    </td>
                    <td className="py-2.5 pr-4 text-text-second whitespace-nowrap">{lead.budget || "—"}</td>
                    <td className="py-2.5 pr-4 text-text-second whitespace-nowrap">{lead.programInterest || "—"}</td>
                    <td className="py-2.5 pr-4 text-text-second whitespace-nowrap max-w-[160px] truncate" title={lead.keyConcerns || ""}>
                      {lead.keyConcerns || "—"}
                    </td>

                    {/* Human-editable fields from here on */}
                    <td className="py-2 pr-4">
                      <select
                        value={lead.callStatus || ""}
                        onChange={e => updateLeadField(lead.id, "callStatus", e.target.value)}
                        className="bg-surface border border-border-mid rounded-md text-[11px] px-2 py-1 outline-none focus:border-brand"
                      >
                        {CALL_STATUS_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt || "—"}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-4">
                      <select
                        value={lead.leadStatus}
                        onChange={e => updateLeadField(lead.id, "leadStatus", e.target.value)}
                        className="bg-surface border border-border-mid rounded-md text-[11px] px-2 py-1 outline-none focus:border-brand"
                      >
                        {LEAD_STATUS_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-4">
                      <input
                        type="text"
                        defaultValue={lead.handledBy || ""}
                        onBlur={e => e.target.value !== (lead.handledBy || "") && updateLeadField(lead.id, "handledBy", e.target.value)}
                        placeholder="Unassigned"
                        className="bg-surface border border-border-mid rounded-md text-[11px] px-2 py-1 outline-none focus:border-brand w-24"
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <input
                        type="text"
                        defaultValue={lead.otherNotes || ""}
                        onBlur={e => e.target.value !== (lead.otherNotes || "") && updateLeadField(lead.id, "otherNotes", e.target.value)}
                        placeholder="Add a note..."
                        className="bg-surface border border-border-mid rounded-md text-[11px] px-2 py-1 outline-none focus:border-brand w-40"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Lead Metric Details Modal ───────────────────────────────── */}
      <Modal
        isOpen={activeModalMetric !== null}
        onClose={() => setActiveModalMetric(null)}
        title={activeModalMetric ? LEAD_METRIC_CONFIG[activeModalMetric].title : "Leads"}
        description={`${dateRangeLabel} • ${modalLeads.length} leads matching`}
        maxWidth="max-w-4xl"
      >
        {modalLeads.length === 0 ? (
          <div className="text-center text-text-muted text-sm py-12">No leads match yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border-faint text-left text-text-muted uppercase tracking-wide text-[10px]">
                  <th className="py-2.5 pr-4 font-semibold">Name</th>
                  <th className="py-2.5 pr-4 font-semibold">Email</th>
                  <th className="py-2.5 pr-4 font-semibold">Phone</th>
                  <th className="py-2.5 pr-4 font-semibold">Interest</th>
                  <th className="py-2.5 pr-4 font-semibold">Program</th>
                  <th className="py-2.5 pr-4 font-semibold">Budget</th>
                  <th className="py-2.5 pr-4 font-semibold">Eligibility</th>
                  <th className="py-2.5 pr-4 font-semibold">Status</th>
                  <th className="py-2.5 pr-4 font-semibold">Call Status</th>
                  <th className="py-2.5 pr-4 font-semibold text-right">Conversation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-faint/50">
                {modalLeads.map((l) => (
                  <tr key={l.id} className="hover:bg-surface-high/40 transition-colors">
                    <td className="py-2.5 pr-4 font-medium text-text-primary whitespace-nowrap">{l.name}</td>
                    <td className="py-2.5 pr-4 text-text-second whitespace-nowrap">{l.email || "—"}</td>
                    <td className="py-2.5 pr-4 text-text-second whitespace-nowrap font-mono text-[11px]">{l.phone || "—"}</td>
                    <td className="py-2.5 pr-4">
                      {l.interestLevel ? (
                        <Badge variant={INTEREST_BADGE[l.interestLevel] || "default"} size="xs">{l.interestLevel}</Badge>
                      ) : "—"}
                    </td>
                    <td className="py-2.5 pr-4 text-text-second whitespace-nowrap">{l.programInterest || "—"}</td>
                    <td className="py-2.5 pr-4 text-text-second whitespace-nowrap">{l.budget || "—"}</td>
                    <td className="py-2.5 pr-4">
                      {l.admissionEligibility ? (
                        <Badge variant={l.admissionEligibility === "Eligible" ? "brand" : "danger"} size="xs">
                          {l.admissionEligibility}
                        </Badge>
                      ) : "—"}
                    </td>
                    <td className="py-2.5 pr-4">
                      <Badge variant="default" size="xs">{l.leadStatus}</Badge>
                    </td>
                    <td className="py-2.5 pr-4 text-text-second whitespace-nowrap">{l.callStatus || "—"}</td>
                    <td className="py-2.5 pr-4 text-right whitespace-nowrap">
                      {l.ticketId ? (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveModalMetric(null);
                            navigate(`/inbox?ticketId=${l.ticketId}`);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
                        >
                          <MessageSquare size={12} />
                          <span>View Chat</span>
                        </button>
                      ) : (
                        <span className="text-text-muted text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
};

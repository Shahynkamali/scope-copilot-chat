"use client";

import { useState } from "react";
import {
  Sparkles,
  Loader2,
  FileCode,
  FilePen,
  Tag,
  GitCommit,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Ticket {
  title: string;
  description: string;
  acceptance_criteria: string[];
  priority: string;
  files_to_create: string[];
  files_to_modify: string[];
  related_entities: string[];
  estimated_complexity: string;
  commit_message: string;
}

interface FeaturePreview {
  preview: {
    id: string;
    description: string;
    tickets: Ticket[];
    milestone_detection: {
      selected_milestone_name: string;
      suggested_epic_name: string;
      confidence: number;
    };
  };
}

interface GenerateFeatureDialogProps {
  projectId: string;
  projectName: string;
}

function TicketCard({ ticket, index }: { ticket: Ticket; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <div className="border border-[#222] rounded-xl overflow-hidden bg-[#0a0a0a]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#111] transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-[#555] shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-[#555] shrink-0" />
        )}
        <span className="text-sm font-semibold text-white flex-1">
          {ticket.title}
        </span>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            ticket.priority === "high"
              ? "bg-[#FF4433]/10 text-[#FF4433]"
              : ticket.priority === "medium"
              ? "bg-[#FAB901]/10 text-[#FAB901]"
              : "bg-[#888]/10 text-[#888]"
          }`}
        >
          {ticket.priority}
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1a1a] text-[#888]">
          {ticket.estimated_complexity}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-[#222] px-4 py-4 space-y-4">
          {/* Description */}
          <p className="text-xs text-[#888] leading-relaxed">
            {ticket.description}
          </p>

          {/* Acceptance criteria */}
          {(ticket.acceptance_criteria || []).length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold text-[#888] uppercase tracking-widest mb-2">
                Acceptance Criteria
              </h4>
              <ul className="space-y-1.5">
                {(ticket.acceptance_criteria || []).map((ac, i) => (
                  <li key={i} className="flex gap-2 text-xs text-[#888]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#FF4433] shrink-0 mt-0.5" />
                    {ac}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Files */}
          <div className="grid grid-cols-2 gap-3">
            {(ticket.files_to_create || []).length > 0 && (
              <div>
                <h4 className="text-[10px] font-semibold text-[#888] uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <FileCode className="h-3 w-3 text-[#FF4433]" />
                  Create
                </h4>
                {(ticket.files_to_create || []).map((f) => (
                  <p key={f} className="text-[10px] font-mono text-[#888] truncate">
                    {f}
                  </p>
                ))}
              </div>
            )}
            {(ticket.files_to_modify || []).length > 0 && (
              <div>
                <h4 className="text-[10px] font-semibold text-[#888] uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <FilePen className="h-3 w-3" />
                  Modify
                </h4>
                {(ticket.files_to_modify || []).map((f) => (
                  <p key={f} className="text-[10px] font-mono text-[#888] truncate">
                    {f}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Related entities + commit */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {(ticket.related_entities || []).map((e) => (
                <span
                  key={e}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-[#FF4433]/10 text-[#FF4433] font-mono flex items-center gap-1"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {e}
                </span>
              ))}
            </div>
            {ticket.commit_message && (
              <span className="text-[10px] font-mono text-[#555] flex items-center gap-1">
                <GitCommit className="h-3 w-3" />
                {ticket.commit_message}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function GenerateFeatureDialog({
  projectId,
  projectName,
}: GenerateFeatureDialogProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FeaturePreview | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!description.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/generate-feature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, description: description.trim() }),
      });

      if (!res.ok) throw new Error("Failed to generate");

      const data = await res.json();
      setResult(data);
    } catch {
      setError("Failed to generate feature. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset after animation
    setTimeout(() => {
      setDescription("");
      setResult(null);
      setError("");
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <button className="flex items-center justify-center border border-[#222] hover:border-[#FF4433]/40 hover:text-[#FF4433] text-[#888] rounded-lg p-2 transition-colors">
          <Sparkles className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#111] border-[#222] text-white max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#FF4433]" />
            Generate Feature
          </DialogTitle>
          <p className="text-xs text-[#888]">
            Describe a feature for <span className="text-[#FF4433] font-medium">{projectName}</span> and
            Scope will generate grounded tickets with file paths, entities, and acceptance criteria.
          </p>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4 pt-2">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Add a driver comparison feature that lets users compare lap times side by side..."
              rows={4}
              disabled={loading}
              className="bg-[#0a0a0a] border-[#222] text-white placeholder:text-[#555] focus:border-[#FF4433]/50 resize-none"
            />
            {error && (
              <p className="text-xs text-[#FF4433] flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                {error}
              </p>
            )}
            <Button
              onClick={handleGenerate}
              disabled={!description.trim() || loading}
              className="w-full bg-[#FF4433] hover:bg-[#e63d2e] text-white disabled:bg-[#1a1a1a] disabled:text-[#555]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Milestone info */}
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-[#FF4433]/10 text-[#FF4433] font-medium">
                {result.preview.milestone_detection.suggested_epic_name}
              </span>
              <span className="text-[#888]">
                → {result.preview.milestone_detection.selected_milestone_name}
              </span>
              <span className="text-[#555] ml-auto">
                {Math.round(result.preview.milestone_detection.confidence * 100)}% confidence
              </span>
            </div>

            {/* Tickets */}
            <div className="space-y-3">
              {result.preview.tickets.map((ticket, i) => (
                <TicketCard key={i} ticket={ticket} index={i} />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => alert("Tickets would be exported to Jira")}
                className="flex-1 bg-[#FF4433] hover:bg-[#e63d2e] text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2 fill-current">
                  <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V2.84a.84.84 0 0 0-.84-.84h-9.63zM6.77 6.8a4.36 4.36 0 0 0 4.34 4.34h1.8v1.72a4.36 4.36 0 0 0 4.34 4.34V7.63a.84.84 0 0 0-.83-.83H6.77zM2 11.6a4.35 4.35 0 0 0 4.34 4.34h1.8v1.72A4.35 4.35 0 0 0 12.48 22v-9.57a.84.84 0 0 0-.84-.84H2z" />
                </svg>
                Add to Jira
              </Button>
              <Button
                onClick={() => {
                  setResult(null);
                  setDescription("");
                }}
                variant="outline"
                className="flex-1 border-[#222] text-[#888] hover:text-white hover:border-[#FF4433]/40"
              >
                Generate Another
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

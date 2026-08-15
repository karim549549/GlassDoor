import React from "react";
// lucide-react dropped its brand icons (Github, Figma) in v1 - they moved to a
// separate package. Using generic equivalents rather than adding a dependency.
import { Code2, PenTool, Video, Mic, FileText } from "lucide-react";

export interface SubmissionArtifactsProps {
  githubUrl: string;
  figmaUrl: string | null;
  videoUrl: string | null;
  defenseVideoUrl: string | null;
  defenseRecordedAt: string | null;
  writeupText: string;
}

function ArtifactLink({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 border border-foreground/30 px-3 py-2 font-mono text-[0.6rem] uppercase tracking-wider text-foreground transition-colors hover:border-foreground hover:text-orange"
    >
      {icon}
      <span className="truncate">{label}</span>
    </a>
  );
}

/** Everything the judge is scoring, in one place: links plus the writeup. */
export function SubmissionArtifacts({
  githubUrl,
  figmaUrl,
  videoUrl,
  defenseVideoUrl,
  defenseRecordedAt,
  writeupText,
}: SubmissionArtifactsProps) {
  return (
    <section className="space-y-4 border-2 border-foreground bg-card p-5 shadow-[6px_6px_0px_0px_var(--foreground)]">
      <h2 className="border-b border-foreground/15 pb-2 font-mono text-xs font-bold uppercase tracking-[0.25em] text-orange">
        Submitted artifacts
      </h2>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <ArtifactLink
          icon={<Code2 className="h-3.5 w-3.5 shrink-0" />}
          label="Repository"
          href={githubUrl}
        />
        {figmaUrl && (
          <ArtifactLink
            icon={<PenTool className="h-3.5 w-3.5 shrink-0" />}
            label="Design file"
            href={figmaUrl}
          />
        )}
        {videoUrl && (
          <ArtifactLink
            icon={<Video className="h-3.5 w-3.5 shrink-0" />}
            label="Product demo"
            href={videoUrl}
          />
        )}
        {defenseVideoUrl && (
          <ArtifactLink
            icon={<Mic className="h-3.5 w-3.5 shrink-0" />}
            label={
              defenseRecordedAt
                ? `Oral defense (${new Date(defenseRecordedAt).toLocaleDateString()})`
                : "Oral defense"
            }
            href={defenseVideoUrl}
          />
        )}
      </div>

      {!defenseVideoUrl && (
        <p className="font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground">
          No oral defense was recorded for this submission.
        </p>
      )}

      <div className="space-y-2">
        <h3 className="flex items-center gap-1.5 font-mono text-[0.55rem] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          <FileText className="h-3 w-3" />
          Writeup
        </h3>
        {writeupText.trim() ? (
          <p className="whitespace-pre-wrap border border-foreground/15 bg-background p-4 font-sans text-xs leading-relaxed text-foreground">
            {writeupText}
          </p>
        ) : (
          <p className="font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground">
            No writeup was submitted.
          </p>
        )}
      </div>
    </section>
  );
}

export default SubmissionArtifacts;

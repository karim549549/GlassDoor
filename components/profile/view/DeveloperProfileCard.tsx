import { Edit2 } from "lucide-react";

interface DeveloperProfileCardProps {
  bio: string | null | undefined;
  skillsList: string[];
  specialty: string | undefined;
  seniority: string | null | undefined;
  employmentStatus: string | null | undefined;
  currentEmployer: string | null | undefined;
  education: string | null | undefined;
  location: string | null | undefined;
  isOwner: boolean;
  onEditClick: () => void;
}

export function DeveloperProfileCard({
  bio,
  skillsList,
  specialty,
  seniority,
  employmentStatus,
  currentEmployer,
  education,
  location,
  isOwner,
  onEditClick,
}: DeveloperProfileCardProps) {
  return (
    <div className="md:col-span-2 border border-foreground bg-card p-6 font-mono text-[0.65rem] uppercase tracking-wider relative shadow-[4px_4px_0px_0px_rgba(14,14,13,0.1)] flex flex-col justify-between">
      {/* Edit Button */}
      {isOwner && (
        <button
          onClick={onEditClick}
          className="absolute top-4 right-4 p-1.5 bg-background border border-foreground hover:bg-orange hover:text-card transition-colors cursor-pointer"
          title="Edit Profile"
        >
          <Edit2 className="h-3 w-3" />
        </button>
      )}

      <div className="space-y-4">
        <div className="border-b border-foreground/10 pb-2">
          <h3 className="font-bold text-[0.8rem] text-foreground">Developer Profile</h3>
        </div>

        {/* Bio Statement */}
        <div className="space-y-1.5 lowercase first-letter:uppercase text-[0.7rem] normal-case leading-relaxed text-foreground/85">
          <span className="font-bold font-mono text-[0.65rem] uppercase tracking-widest text-foreground block mb-1">
            About Bio:
          </span>
          {bio || "No biography added yet. Click edit to write a brief summary of your development experience."}
        </div>

        <div className="border-t border-foreground/10 pt-3 space-y-2">
          <span className="font-bold block text-foreground mb-1">Tech Skills:</span>
          {skillsList.length === 0 ? (
            <span className="text-muted-foreground/60 lowercase normal-case italic">No skills selected yet.</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {skillsList.map((skillName: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-orange text-card border border-orange font-bold text-[0.55rem] tracking-wider"
                >
                  {skillName}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-foreground/10 pt-3 space-y-2.5">
          <span className="font-bold block text-foreground">Credentials & Employment:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-muted-foreground font-mono">
            <div className="flex justify-between border-b border-foreground/5 pb-1">
              <span>Job Title</span>
              <span className="font-bold text-foreground text-right max-w-[65%] truncate">{specialty || "None"}</span>
            </div>
            <div className="flex justify-between border-b border-foreground/5 pb-1">
              <span>Seniority</span>
              <span className="font-bold text-foreground">{seniority || "None"}</span>
            </div>
            <div className="flex justify-between border-b border-foreground/5 pb-1">
              <span>Status</span>
              <span className="font-bold text-foreground">{employmentStatus || "None"}</span>
            </div>
            <div className="flex justify-between border-b border-foreground/5 pb-1">
              <span>Employer</span>
              <span className="font-bold text-foreground">{currentEmployer || "None"}</span>
            </div>
            <div className="flex justify-between border-b border-foreground/5 pb-1">
              <span>Education</span>
              <span className="font-bold text-foreground text-right max-w-[65%] truncate">{education || "None"}</span>
            </div>
            <div className="flex justify-between border-b border-foreground/5 pb-1">
              <span>Location</span>
              <span className="font-bold text-foreground text-right max-w-[65%] truncate">{location || "None"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type SignupRole = "USER" | "COMPANY";

interface RoleSelectorProps {
  selectedRole: SignupRole;
  onSelect: (role: SignupRole) => void;
}

/** "I am joining as an" employee/company-rep toggle for the signup form. */
export function RoleSelector({ selectedRole, onSelect }: RoleSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
        I am joining as an
      </span>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onSelect("USER")}
          className={`font-mono text-[0.65rem] uppercase tracking-wider py-2 border transition-all duration-200 cursor-pointer text-center ${
            selectedRole === "USER"
              ? "bg-foreground text-background border-foreground"
              : "bg-transparent text-foreground border-border hover:border-foreground/45"
          }`}
        >
          Employee
        </button>
        <button
          type="button"
          onClick={() => onSelect("COMPANY")}
          className={`font-mono text-[0.65rem] uppercase tracking-wider py-2 border transition-all duration-200 cursor-pointer text-center ${
            selectedRole === "COMPANY"
              ? "bg-foreground text-background border-foreground"
              : "bg-transparent text-foreground border-border hover:border-foreground/45"
          }`}
        >
          Company Rep
        </button>
      </div>
    </div>
  );
}

export default RoleSelector;

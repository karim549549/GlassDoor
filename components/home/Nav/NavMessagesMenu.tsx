"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface NavMessagesMenuProps {
  isDarkTheme: boolean;
}

export function NavMessagesMenu({ isDarkTheme }: NavMessagesMenuProps) {
  const [hasUnreadMessages, setHasUnreadMessages] = useState(true);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className={`p-1.5 rounded-full border border-transparent transition-all duration-200 cursor-pointer flex items-center justify-center relative hover:scale-105 active:scale-95 ${
              isDarkTheme
                ? "text-background hover:bg-background/15"
                : "text-foreground hover:bg-foreground/10"
            }`}
            title="Messages"
          >
            <MessageSquare className="h-4 w-4" />
            {hasUnreadMessages && (
              <span className="absolute top-1 right-1 flex h-1.5 w-1.5 rounded-full bg-[#FF5C5C]" />
            )}
          </button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="w-64 bg-background text-foreground border border-foreground rounded-none shadow-xl p-0 font-mono text-[0.65rem] uppercase tracking-wider z-50 overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-top-2"
      >
        <div className="p-3 border-b border-foreground font-bold text-foreground/60 bg-card">
          Conversations
        </div>
        <div className="divide-y divide-foreground/5 max-h-48 overflow-y-auto">
          <DropdownMenuItem
            onClick={() => { setHasUnreadMessages(false); alert("Opening chat with Anwar..."); }}
            className="p-3 cursor-pointer flex flex-col items-start gap-1 rounded-none hover:bg-foreground hover:text-background focus:bg-foreground focus:text-background outline-none group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-bold">Anwar Moustafa</span>
              <span className="text-[0.5rem] text-orange">New</span>
            </div>
            <span className="text-[0.55rem] opacity-70 lowercase normal-case text-left">
              {`"Can you take a look at my rubric score for the Cairo arena?"`}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => alert("Opening chat with Karim...")}
            className="p-3 cursor-pointer flex flex-col items-start gap-1 rounded-none hover:bg-foreground hover:text-background focus:bg-foreground focus:text-background outline-none group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-bold">Karim Hassan</span>
              <span className="text-[0.5rem] opacity-40">2h ago</span>
            </div>
            <span className="text-[0.55rem] opacity-70 lowercase normal-case text-left">
              {`"Let's review the mock data structure later today."`}
            </span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NavMessagesMenu;

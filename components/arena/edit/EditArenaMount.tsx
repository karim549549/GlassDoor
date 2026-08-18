"use client";

import dynamic from "next/dynamic";
import type { EditableArena } from "./EditArenaClient";

/**
 * A client boundary that exists only to hold `ssr: false`.
 *
 * The form binds six `datetime-local` inputs, which speak local time with no
 * zone attached. Converting the stored instants into that format therefore
 * depends on the clock of the machine doing the converting - UTC on the
 * server, UTC+3 for a host in Cairo - so rendering the values in both places
 * produces two different strings for the same moment, and a hydration warning
 * to go with them. Rendering them once, on the client, is the honest fix.
 *
 * Next refuses `ssr: false` inside a Server Component, hence this file rather
 * than the option sitting on the page where it would read more directly.
 *
 * Nothing is lost: the edit screen is behind a host check and marked noindex,
 * so it has no SEO to protect.
 */
const EditArenaClient = dynamic(
  () => import("./EditArenaClient").then((m) => m.EditArenaClient),
  {
    ssr: false,
    loading: () => (
      <div
        className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 pt-8 md:px-10"
        aria-busy="true"
      >
        <div className="sr-only" role="status">
          Loading the brief
        </div>
        <div className="h-14 animate-pulse border border-foreground/15 bg-card" />
        <div className="mt-6 h-96 animate-pulse border border-foreground/15 bg-card" />
      </div>
    ),
  }
);

export function EditArenaMount({ arena }: { arena: EditableArena }) {
  return <EditArenaClient arena={arena} />;
}

export default EditArenaMount;

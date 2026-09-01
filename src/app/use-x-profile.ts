"use client";

import { useEffect, useState } from "react";
import { withBasePath } from "../lib/base-path";

export interface XProfile {
  name?: string;
  photo?: string;
}

/**
 * Best-effort X profile lookup for the submitted handle. The photo is served
 * through the same-origin avatar proxy so it also survives the share capture.
 */
export function useXProfile(submittedHandle: string | null) {
  const [profile, setProfile] = useState<XProfile>({});

  useEffect(() => {
    if (!submittedHandle) return;
    const controller = new AbortController();
    fetch(withBasePath(`/api/x-profile?u=${submittedHandle}&v=2`), { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { name?: string | null; photo?: string | null } | null) => {
        if (!data) return;
        setProfile({
          name: data.name ?? undefined,
          photo: data.photo
            ? withBasePath(`/api/x-avatar?u=${encodeURIComponent(submittedHandle)}&v=2`)
            : undefined,
        });
      })
      .catch(() => {
        // Profile lookup is best-effort; the pass falls back to the handle.
      });
    return () => controller.abort();
  }, [submittedHandle]);

  return { profile, resetProfile: () => setProfile({}) };
}

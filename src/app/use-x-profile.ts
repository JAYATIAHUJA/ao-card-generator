"use client";

import { useEffect, useState } from "react";

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
  const [profileReady, setProfileReady] = useState(true);

  useEffect(() => {
    if (!submittedHandle) {
      setProfileReady(true);
      return;
    }
    const controller = new AbortController();
    setProfileReady(false);
    fetch(`https://api.fxtwitter.com/${submittedHandle}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { user?: { name?: string | null; avatar_url?: string | null } } | null) => {
        if (!data) return;
        const avatar = data.user?.avatar_url?.replace("_normal", "_400x400");
        setProfile({
          name: data.user?.name ?? undefined,
          photo: avatar ?? undefined,
        });
      })
      .catch(() => {
        // Profile lookup is best-effort; the pass falls back to the handle.
      })
      .finally(() => {
        if (!controller.signal.aborted) setProfileReady(true);
      });
    return () => controller.abort();
  }, [submittedHandle]);

  return { profile, profileReady, resetProfile: () => setProfile({}) };
}

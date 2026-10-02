"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import posthog from "posthog-js";
import { analyticsEnabled } from "./product-analytics";

export function ClerkIdentity() {
  const { user, isLoaded } = useUser();
  useEffect(() => {
    if (!analyticsEnabled || !isLoaded) return;
    if (user) {
      if (posthog.get_distinct_id() !== user.id) posthog.identify(user.id);
    } else if (posthog.get_property("$user_id")) {
      posthog.reset();
    }
  }, [isLoaded, user?.id]);
  return null;
}

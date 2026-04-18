"use client";

import { ReactNode, useMemo } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const convex = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url || typeof url !== "string" || !url.startsWith("https://")) {
      if (typeof window !== "undefined") {
        console.warn(
          "NEXT_PUBLIC_CONVEX_URL is not set or invalid. Convex queries will not work."
        );
      }
      return null;
    }
    try {
      return new ConvexReactClient(url);
    } catch (e) {
      console.error("Failed to construct ConvexReactClient:", e);
      return null;
    }
  }, []);

  if (!convex) {
    // Render children without the provider so public pages still load.
    // Pages that call useQuery will throw, caught by the error boundary.
    return <>{children}</>;
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

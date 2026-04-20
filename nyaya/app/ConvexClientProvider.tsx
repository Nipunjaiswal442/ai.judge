"use client";

import { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const getConvexClient = () => {
  if (typeof process === "undefined") return null;
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url || typeof url !== "string" || !url.startsWith("https://")) {
    return null;
  }
  try {
    return new ConvexReactClient(url);
  } catch (e) {
    console.error("Failed to construct ConvexReactClient:", e);
    return null;
  }
};

const convex = getConvexClient();

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  if (!convex) {
    if (typeof window !== "undefined") {
      console.warn("NEXT_PUBLIC_CONVEX_URL is not set or invalid. Convex queries will not work.");
    }
    // Render children without the provider so public pages still load.
    // Pages that call useQuery will throw, caught by the error boundary.
    return <>{children}</>;
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

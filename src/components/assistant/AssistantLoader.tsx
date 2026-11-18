"use client";

import dynamic from "next/dynamic";

/** Yordamchi kodi alohida chunk'da, sahifa yuklangandan keyin yuklanadi. */
const Assistant = dynamic(() => import("./Assistant"), { ssr: false });

export function AssistantLoader() {
  return <Assistant />;
}

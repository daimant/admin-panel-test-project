import "@testing-library/jest-dom";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  (window as any).matchMedia = (query: string) => {
    const listeners: Array<(ev: Event) => void> = [];
    const mql = {
      matches: false,
      media: String(query),
      onchange: null as ((this: MediaQueryList, ev: Event) => any) | null,
      addListener: (_: EventListenerOrEventListenerObject) => {},
      removeListener: (_: EventListenerOrEventListenerObject) => {},
      addEventListener: (
        type: string,
        listener: EventListenerOrEventListenerObject,
      ) => {
        if (type === "change") listeners.push(listener as (ev: Event) => void);
      },
      removeEventListener: (
        type: string,
        listener: EventListenerOrEventListenerObject,
      ) => {
        if (type === "change") {
          const idx = listeners.indexOf(listener as (ev: Event) => void);
          if (idx >= 0) listeners.splice(idx, 1);
        }
      },
      dispatchEvent: (_ev: Event) => {
        return true;
      },
    };
    return mql as MediaQueryList;
  };
}

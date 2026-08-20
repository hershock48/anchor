"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scroll reveals.
 *
 * Two things here are not optional and both come from failures on other builds.
 *
 * 1. `.js` is added by this component, and `globals.css` only hides `.reveal`
 *    underneath `.js`. So with JavaScript blocked, or before hydration, or if
 *    this throws, the page is complete rather than blank.
 *
 * 2. IT RE-ARMS ON NAVIGATION. A reveal system in a root layout that queries
 *    once on mount hides the next page's elements forever, so every internal
 *    link lands on a blank page while the URL and the nav highlight both change
 *    correctly and nothing errors. `usePathname()` in the dependency array is
 *    the entire fix. A navigation test that does not assert visibility would
 *    not catch it.
 */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("js");

    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -50px 0px" }
    );

    els.forEach((el) => {
      // Anything already on screen at mount shows immediately rather than
      // waiting for a scroll that may never come on a short page.
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in");
      else io.observe(el);
    });

    return () => io.disconnect();
  }, [pathname]);

  return null;
}

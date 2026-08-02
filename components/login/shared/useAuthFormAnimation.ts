"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";

interface AuthFormAnimationRefs {
  containerRef: RefObject<HTMLDivElement | null>;
  titleRef: RefObject<HTMLHeadingElement | null>;
  formRef: RefObject<HTMLFormElement | null>;
  footerRef: RefObject<HTMLDivElement | null>;
}

/**
 * Elegant entrance animation shared by the login and signup forms: fades/slides
 * in the container, title, form fields (staggered), then the footer.
 */
export function useAuthFormAnimation({
  containerRef,
  titleRef,
  formRef,
  footerRef,
}: AuthFormAnimationRefs) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 }
      );

      tl.fromTo(
        titleRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6 },
        "-=0.4"
      );

      if (formRef.current) {
        const formElements = formRef.current.children;
        tl.fromTo(
          formElements,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
          "-=0.3"
        );
      }

      tl.fromTo(
        footerRef.current,
        { opacity: 0 },
        { opacity: 0.55, duration: 0.6 },
        "-=0.2"
      );
    });

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

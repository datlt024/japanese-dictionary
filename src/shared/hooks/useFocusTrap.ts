"use client"

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react"

const FOCUSABLE_SELECTORS = [
  'a[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ")

export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape?: () => void
) {
  // Store callback in a ref so it never invalidates the effect
  const onEscapeRef = useRef(onEscape)
  useLayoutEffect(() => { onEscapeRef.current = onEscape })

  useEffect(() => {
    if (!active || !ref.current) return

    const container = ref.current
    const previouslyFocused = document.activeElement as HTMLElement | null

    const getFocusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
        (el) => !el.closest("[inert]") && el.offsetParent !== null
      )

    // Focus first focusable element on open, unless autoFocus already claimed it
    const focusable = getFocusable()
    const alreadyFocusedInside = container.contains(document.activeElement)
    if (!alreadyFocusedInside) {
      if (focusable.length > 0) {
        focusable[0].focus()
      } else {
        container.setAttribute("tabindex", "-1")
        container.focus()
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault()
        onEscapeRef.current?.()
        return
      }

      if (e.key !== "Tab") return

      const focusable = getFocusable()
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first || document.activeElement === container) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last || document.activeElement === container) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      if (document.body.contains(previouslyFocused)) {
        previouslyFocused?.focus()
      }
    }
  }, [active, ref]) // onEscape removed — stored in ref above
}

import * as React from "react"

// Breakpoints Tailwind CSS standard
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const

type BreakpointKey = keyof typeof BREAKPOINTS

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.md - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < BREAKPOINTS.md)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useViewportSizes() {
  const [sizes, setSizes] = React.useState({
    isSm: false,
    isMd: false,
    isLg: false,
    isXl: false,
  })

  React.useEffect(() => {
    const checkSizes = () => {
      const width = window.innerWidth
      setSizes({
        isSm: width >= BREAKPOINTS.sm,
        isMd: width >= BREAKPOINTS.md,
        isLg: width >= BREAKPOINTS.lg,
        isXl: width >= BREAKPOINTS.xl,
      })
    }

    checkSizes()
    window.addEventListener('resize', checkSizes)
    return () => window.removeEventListener('resize', checkSizes)
  }, [])

  return sizes
}

export function useBreakpoint(breakpoint: BreakpointKey = 'md') {
  const [isBelow, setIsBelow] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS[breakpoint] - 1}px)`)
    const onChange = () => {
      setIsBelow(window.innerWidth < BREAKPOINTS[breakpoint])
    }
    mql.addEventListener("change", onChange)
    setIsBelow(window.innerWidth < BREAKPOINTS[breakpoint])
    return () => mql.removeEventListener("change", onChange)
  }, [breakpoint])

  return !!isBelow
}

export function useIsTouch() {
  const [isTouch, setIsTouch] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Détection des capacités tactiles
    const hasTouch = 'ontouchstart' in window || 
                     navigator.maxTouchPoints > 0 || 
                     (navigator as any).msMaxTouchPoints > 0

    setIsTouch(hasTouch)
  }, [])

  return isTouch
}

export function useDeviceType() {
  const isMobile = useIsMobile()
  const isTouch = useIsTouch()
  const { isMd, isLg } = useViewportSizes()
  
  // Tablette : écran large mais pas très large, ou mobile en mode paysage
  const isTablet = isLg && !isMd

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    isTouch,
    isMobileTouch: isMobile && isTouch,
  }
}

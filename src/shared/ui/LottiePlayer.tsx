import { useEffect, useRef, type CSSProperties } from 'react'
import lottie from 'lottie-web'

interface LottiePlayerProps {
  /** Path to a Lottie JSON served from /public (e.g. "/lottie/login.json"). */
  src: string
  loop?: boolean
  autoplay?: boolean
  style?: CSSProperties
  className?: string
}

/**
 * Renders a Lottie animation using lottie-web directly. The JSON is loaded at
 * runtime from `public/` via the player's `path` option, so it stays out of the
 * JS bundle and is served as a static asset.
 */
export function LottiePlayer({ src, loop = true, autoplay = true, style, className }: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const animation = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop,
      autoplay,
      path: src,
    })

    return () => animation.destroy()
  }, [src, loop, autoplay])

  return <div ref={containerRef} style={style} className={className} />
}

/** Minimal typings for the slice of the Yandex Maps 2.1 API we use. */
export interface YMapsPlacemark {
  geometry: {
    getCoordinates(): [number, number]
    setCoordinates(coords: [number, number]): void
  }
  events: { add(event: string, handler: () => void): void }
}

export interface YMapsMap {
  events: { add(event: string, handler: (e: { get(key: string): [number, number] }) => void): void }
  geoObjects: { add(object: unknown): void }
  setCenter(center: [number, number], zoom?: number): void
  getZoom(): number
  destroy(): void
}

export interface YMaps {
  ready(cb: () => void): void
  Map: new (
    el: HTMLElement,
    opts: { center: [number, number]; zoom: number; controls: string[] },
  ) => YMapsMap
  Placemark: new (
    coords: [number, number],
    properties: object,
    options: object,
  ) => YMapsPlacemark
}

function getWin(): { ymaps?: YMaps } {
  return window as unknown as { ymaps?: YMaps }
}

let scriptPromise: Promise<void> | null = null

/**
 * Loads the Yandex Maps JS API 2.1 once (deduped) and resolves with the `ymaps`
 * global. The key must allow the current HTTP referrer in the Yandex cabinet.
 */
export function ensureYandexMaps(apiKey: string): Promise<YMaps> {
  const trimmed = apiKey.trim()
  if (!trimmed) return Promise.reject(new Error('Missing Yandex Maps API key'))

  const win = getWin()
  if (win.ymaps) {
    return new Promise((resolve) => win.ymaps!.ready(() => resolve(win.ymaps!)))
  }

  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.async = true
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(trimmed)}&lang=ru_RU`
      script.onload = () => resolve()
      script.onerror = () => {
        scriptPromise = null
        reject(new Error('Yandex Maps script failed to load'))
      }
      document.head.appendChild(script)
    })
  }

  return scriptPromise.then(
    () =>
      new Promise<YMaps>((resolve, reject) => {
        const w = getWin()
        if (!w.ymaps) {
          reject(new Error('Yandex Maps API unavailable'))
          return
        }
        w.ymaps.ready(() => resolve(w.ymaps!))
      }),
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  ensureYandexMaps,
  type YMaps,
  type YMapsMap,
  type YMapsPlacemark,
} from '@/shared/lib/yandexMapsLoader'

/** Tashkent center — used when no coordinates are set yet. */
const DEFAULT_CENTER: [number, number] = [41.311158, 69.279737]
const API_KEY =
  import.meta.env.VITE_YANDEX_MAPS_API_KEY || '8ac39931-6799-4d6c-9952-20df42124db5'

interface YandexMapPickerProps {
  latitude: number
  longitude: number
  /** Called when the user clicks the map or drags the marker. */
  onChange: (lat: number, lng: number) => void
  height?: number
}

/**
 * Interactive map for picking a warehouse location (Yandex Maps 2.1).
 * Click the map or drag the marker to set latitude/longitude; manual edits to
 * the number inputs move the marker back via the `latitude`/`longitude` props.
 */
export function YandexMapPicker({ latitude, longitude, onChange, height = 260 }: YandexMapPickerProps) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<YMapsMap | null>(null)
  const placemarkRef = useRef<YMapsPlacemark | null>(null)
  const ymapsRef = useRef<YMaps | null>(null)
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])
  const [error, setError] = useState<string | null>(null)

  const setPlacemark = useCallback((coords: [number, number]) => {
    const ymaps = ymapsRef.current
    const map = mapRef.current
    if (!ymaps || !map) return
    if (!placemarkRef.current) {
      const pm = new ymaps.Placemark(coords, {}, { draggable: true, preset: 'islands#redDotIcon' })
      pm.events.add('dragend', () => {
        const c = pm.geometry.getCoordinates()
        onChangeRef.current(c[0], c[1])
      })
      map.geoObjects.add(pm)
      placemarkRef.current = pm
    } else {
      placemarkRef.current.geometry.setCoordinates(coords)
    }
  }, [])

  // Init the map once on mount.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let destroyed = false

    ensureYandexMaps(API_KEY)
      .then((ymaps) => {
        if (destroyed) return
        ymapsRef.current = ymaps
        const hasCoords = latitude !== 0 || longitude !== 0
        const center: [number, number] = hasCoords ? [latitude, longitude] : DEFAULT_CENTER
        const map = new ymaps.Map(el, {
          center,
          zoom: hasCoords ? 16 : 11,
          controls: ['zoomControl', 'fullscreenControl'],
        })
        mapRef.current = map
        map.events.add('click', (e) => {
          const coords = e.get('coords')
          setPlacemark(coords)
          onChangeRef.current(coords[0], coords[1])
        })
        if (hasCoords) setPlacemark([latitude, longitude])
      })
      .catch((err: Error) => {
        if (!destroyed) setError(err.message)
      })

    return () => {
      destroyed = true
      mapRef.current?.destroy()
      mapRef.current = null
      placemarkRef.current = null
    }
    // Mount-only init; external coord changes are handled by the sync effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync the marker when the coordinates change from outside (manual inputs).
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (latitude === 0 && longitude === 0) return
    const coords: [number, number] = [latitude, longitude]
    const pm = placemarkRef.current
    if (!pm) {
      setPlacemark(coords)
    } else {
      const current = pm.geometry.getCoordinates()
      if (Math.abs(current[0] - coords[0]) > 1e-7 || Math.abs(current[1] - coords[1]) > 1e-7) {
        pm.geometry.setCoordinates(coords)
      }
    }
    map.setCenter(coords, Math.max(map.getZoom(), 14))
  }, [latitude, longitude, setPlacemark])

  if (error) {
    return <Alert type="warning" showIcon message={t('warehouse.mapError')} description={error} />
  }

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%', borderRadius: 8, overflow: 'hidden' }}
    />
  )
}

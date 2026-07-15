import { useEffect } from 'react'
import { profile } from '@/data/profile'

/**
 * Sets the browser tab title and favicon from profile.ts at runtime, since
 * index.html is static and profile data only exists once JS runs. Renders
 * nothing — mount it once near the root.
 */
export function SiteMeta() {
  useEffect(() => {
    document.title = profile.name

    if (!profile.avatar) return

    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = profile.avatar
  }, [])

  return null
}

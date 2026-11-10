import { createContext } from 'react'
import type { BuildDirector } from './director'

export const DirectorContext = createContext<BuildDirector | null>(null)
export const SectionContext = createContext<string | null>(null)

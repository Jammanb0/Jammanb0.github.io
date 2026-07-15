import { tag } from './Tag.css'

export function Tag({ children }: { children: string }) {
  return <span className={tag}>{children}</span>
}

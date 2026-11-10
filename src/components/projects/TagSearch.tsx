import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { srOnly } from '@/styles/global.css'
import * as styles from './TagSearch.css'

export interface TagOption {
  tag: string
  /** 이 태그를 쓴 프로젝트 수 */
  count: number
}

interface TagSearchProps {
  query: string
  onQueryChange: (query: string) => void
  /** 고른 태그. 모두 들어 있는 프로젝트만 남깁니다 */
  tags: string[]
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  options: TagOption[]
}

const MAX_SUGGESTIONS = 10

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  )
}

/**
 * 글자 검색과 태그 고르기를 한 칸에서 합니다. 칸을 누르면 자주 쓴 태그가, 글자를 치면
 * 그 글자가 들어간 태그가 아래에 뜨고, 고른 태그는 검색칸 안에 칩으로 붙습니다.
 * 키보드: ↑↓로 고르고 Enter로 추가, 빈 칸에서 Backspace로 마지막 태그 빼기, Esc로 닫기.
 */
export function TagSearch({
  query,
  onQueryChange,
  tags,
  onAddTag,
  onRemoveTag,
  options,
}: TagSearchProps) {
  const inputId = useId()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const needle = query.trim().toLowerCase()

  const suggestions = useMemo(
    () =>
      options
        .filter((option) => !tags.includes(option.tag))
        .filter((option) => needle === '' || option.tag.toLowerCase().includes(needle))
        .slice(0, MAX_SUGGESTIONS),
    [options, tags, needle],
  )
  const expanded = open && suggestions.length > 0
  const activeIndex = Math.min(active, Math.max(0, suggestions.length - 1))

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const choose = (tag: string) => {
    onAddTag(tag)
    // 태그를 찾으려고 친 글자는 태그로 바뀌었으니 지웁니다
    onQueryChange('')
    setActive(0)
    inputRef.current?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setOpen(true)
        setActive((index) => (suggestions.length ? (index + 1) % suggestions.length : 0))
        break
      case 'ArrowUp':
        event.preventDefault()
        setOpen(true)
        setActive((index) =>
          suggestions.length ? (index - 1 + suggestions.length) % suggestions.length : 0,
        )
        break
      case 'Enter':
        if (expanded && suggestions[activeIndex]) {
          event.preventDefault()
          choose(suggestions[activeIndex].tag)
        }
        break
      case 'Escape':
        setOpen(false)
        break
      case 'Backspace':
        if (query === '' && tags.length > 0) onRemoveTag(tags[tags.length - 1])
        break
    }
  }

  return (
    <div ref={rootRef} className={styles.root}>
      <label htmlFor={inputId} className={srOnly}>
        프로젝트 검색. 태그를 고르면 그 태그가 모두 들어간 프로젝트만 남습니다
      </label>
      <span className={styles.icon}>
        <SearchIcon />
      </span>
      <div className={styles.field} onClick={() => inputRef.current?.focus()}>
        {tags.length > 0 && (
          <ul className={styles.chips} aria-label="고른 태그">
            {tags.map((tag) => (
              <li key={tag} className={styles.chip}>
                #{tag}
                <button
                  type="button"
                  className={styles.chipRemove}
                  onClick={(event) => {
                    event.stopPropagation()
                    onRemoveTag(tag)
                  }}
                  aria-label={`${tag} 태그 빼기`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <input
          ref={inputRef}
          id={inputId}
          className={styles.input}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-activedescendant={expanded ? `${listId}-${activeIndex}` : undefined}
          autoComplete="off"
          placeholder={tags.length ? '더 좁혀 보기' : '이름·기술로 찾거나 태그 고르기'}
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </div>
      {expanded && (
        <div className={styles.menu}>
          <p className={styles.menuTitle}>{needle ? '일치하는 태그' : '자주 쓴 태그'}</p>
          <ul id={listId} role="listbox" aria-label="태그" className={styles.options}>
            {suggestions.map((option, index) => (
              <li
                key={option.tag}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={styles.option}
                // 입력칸의 포커스를 잃지 않도록 누르는 순간 고릅니다
                onMouseDown={(event) => {
                  event.preventDefault()
                  choose(option.tag)
                }}
                onMouseEnter={() => setActive(index)}
              >
                #{option.tag}
                <span className={styles.optionCount}>{option.count}</span>
              </li>
            ))}
          </ul>
          <p className={styles.hint}>↑↓로 고르고 Enter로 추가 · 빈 칸에서 ⌫로 빼기</p>
        </div>
      )}
    </div>
  )
}

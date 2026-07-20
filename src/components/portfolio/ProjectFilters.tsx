import { useEffect, useRef, useState } from 'react'
import {
  wrapper,
  searchRow,
  searchInputWrap,
  searchIcon,
  searchInput,
  yearDropdown,
  yearTrigger,
  yearTriggerOpen,
  yearChevron,
  yearChevronOpen,
  yearMenu,
  yearOption,
  yearOptionActive,
  yearHint,
  tagRow,
  tagButton,
  tagButtonActive,
  tagModeRow,
  tagModeLabel,
  tagModeButton,
  tagModeButtonActive,
  resultRow,
  clearButton,
} from './ProjectFilters.css'

export type TagMode = 'any' | 'all'

interface ProjectFiltersProps {
  query: string
  onQueryChange: (value: string) => void
  allTags: string[]
  selectedTags: string[]
  onToggleTag: (tag: string) => void
  tagMode: TagMode
  onTagModeChange: (mode: TagMode) => void
  allYears: number[]
  selectedYear: number | 'all'
  onYearChange: (year: number | 'all') => void
  resultCount: number
  onClear: () => void
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function YearDropdown({
  allYears,
  selectedYear,
  onYearChange,
}: {
  allYears: number[]
  selectedYear: number | 'all'
  onYearChange: (year: number | 'all') => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const label = selectedYear === 'all' ? '전체 연도' : `${selectedYear}년`

  const select = (year: number | 'all') => {
    onYearChange(year)
    setOpen(false)
  }

  return (
    <div className={yearDropdown} ref={rootRef}>
      <button
        type="button"
        className={`${yearTrigger} ${open ? yearTriggerOpen : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{label}</span>
        <span className={`${yearChevron} ${open ? yearChevronOpen : ''}`}>
          <ChevronIcon />
        </span>
      </button>
      {open && (
        <ul className={yearMenu} role="listbox">
          <li>
            <button
              type="button"
              className={`${yearOption} ${selectedYear === 'all' ? yearOptionActive : ''}`}
              onClick={() => select('all')}
            >
              전체 연도
            </button>
          </li>
          {allYears.map((y) => (
            <li key={y}>
              <button
                type="button"
                className={`${yearOption} ${selectedYear === y ? yearOptionActive : ''}`}
                onClick={() => select(y)}
              >
                {y}년
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ProjectFilters({
  query,
  onQueryChange,
  allTags,
  selectedTags,
  onToggleTag,
  tagMode,
  onTagModeChange,
  allYears,
  selectedYear,
  onYearChange,
  resultCount,
  onClear,
}: ProjectFiltersProps) {
  const hasActiveFilters = query !== '' || selectedTags.length > 0 || selectedYear !== 'all'

  return (
    <div className={wrapper}>
      <div className={searchRow}>
        <div className={searchInputWrap}>
          <span className={searchIcon}>
            <SearchIcon />
          </span>
          <input
            className={searchInput}
            type="text"
            placeholder="프로젝트 이름으로 검색"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
        <YearDropdown allYears={allYears} selectedYear={selectedYear} onYearChange={onYearChange} />
      </div>

      {selectedYear === 'all' && (
        <span className={yearHint}>
          연도 필터는 프로젝트가 진행 중이었던 모든 해를 기준으로 표시돼요.
        </span>
      )}

      <div className={tagRow}>
        {allTags.map((tag) => {
          const active = selectedTags.includes(tag)
          return (
            <button
              key={tag}
              type="button"
              className={`${tagButton} ${active ? tagButtonActive : ''}`}
              onClick={() => onToggleTag(tag)}
              aria-pressed={active}
            >
              {tag}
            </button>
          )
        })}
      </div>

      {selectedTags.length > 1 && (
        <div className={tagModeRow}>
          <span className={tagModeLabel}>선택한 태그가 여러 개일 때</span>
          <button
            type="button"
            className={`${tagModeButton} ${tagMode === 'any' ? tagModeButtonActive : ''}`}
            onClick={() => onTagModeChange('any')}
            aria-pressed={tagMode === 'any'}
          >
            하나라도 포함
          </button>
          <button
            type="button"
            className={`${tagModeButton} ${tagMode === 'all' ? tagModeButtonActive : ''}`}
            onClick={() => onTagModeChange('all')}
            aria-pressed={tagMode === 'all'}
          >
            모두 포함
          </button>
        </div>
      )}

      <div className={resultRow}>
        <span>{resultCount}개의 프로젝트</span>
        {hasActiveFilters && (
          <button type="button" className={clearButton} onClick={onClear}>
            필터 초기화
          </button>
        )}
      </div>
    </div>
  )
}

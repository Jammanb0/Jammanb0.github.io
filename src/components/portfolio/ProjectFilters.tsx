import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
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
  yearOptions,
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

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      width="16"
      height="16"
      aria-hidden="true"
      focusable="false"
    >
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
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const menuId = useId()
  const hintId = useId()
  const options: Array<{ value: number | 'all'; label: string }> = [
    { value: 'all', label: '전체 연도' },
    ...allYears.map((year) => ({ value: year, label: `${year}년` })),
  ]
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === selectedYear),
  )
  const selectedLabel = options[selectedIndex].label

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus()
  }, [activeIndex, open])

  const openMenu = (index = selectedIndex) => {
    setActiveIndex(index)
    setOpen(true)
  }

  const closeMenu = (restoreFocus = false) => {
    setOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }

  const selectOption = (value: number | 'all') => {
    onYearChange(value)
    closeMenu(true)
  }

  const moveFocus = (index: number) => {
    const nextIndex = (index + options.length) % options.length
    setActiveIndex(nextIndex)
  }

  const handleOptionKeyDown = (event: KeyboardEvent, index: number) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        moveFocus(index + 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        moveFocus(index - 1)
        break
      case 'Home':
        event.preventDefault()
        moveFocus(0)
        break
      case 'End':
        event.preventDefault()
        moveFocus(options.length - 1)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        selectOption(options[index].value)
        break
      case 'Escape':
        event.preventDefault()
        closeMenu(true)
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div className={yearDropdown} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`${yearTrigger} ${open ? yearTriggerOpen : ''}`}
        aria-label={`프로젝트 연도 필터: ${selectedLabel}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          if (open) closeMenu()
          else openMenu()
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            openMenu()
          }
        }}
      >
        <span>{selectedLabel}</span>
        <span className={`${yearChevron} ${open ? yearChevronOpen : ''}`}>
          <ChevronIcon />
        </span>
      </button>

      {open && (
        <div className={yearMenu}>
          <div
            id={menuId}
            className={yearOptions}
            role="listbox"
            aria-label="프로젝트 연도"
            aria-describedby={hintId}
          >
            {options.map((option, index) => {
              const selected = option.value === selectedYear
              return (
                <button
                  key={option.value}
                  ref={(element) => {
                    optionRefs.current[index] = element
                  }}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  tabIndex={index === activeIndex ? 0 : -1}
                  className={`${yearOption} ${selected ? yearOptionActive : ''}`}
                  onFocus={() => setActiveIndex(index)}
                  onClick={() => selectOption(option.value)}
                  onKeyDown={(event) => handleOptionKeyDown(event, index)}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
          <p id={hintId} className={yearHint}>
            프로젝트가 진행 중이었던 모든 해를 기준으로 표시해요.
          </p>
        </div>
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
            aria-label="프로젝트 검색"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
        <YearDropdown allYears={allYears} selectedYear={selectedYear} onYearChange={onYearChange} />
      </div>

      <div className={tagRow} role="group" aria-label="프로젝트 태그 필터">
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
        <div className={tagModeRow} role="group" aria-label="태그 필터 조합 방식">
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
        <span aria-live="polite">{resultCount}개의 프로젝트</span>
        {hasActiveFilters && (
          <button type="button" className={clearButton} onClick={onClear}>
            필터 초기화
          </button>
        )}
      </div>
    </div>
  )
}

import {
  wrapper,
  searchRow,
  searchInputWrap,
  searchIcon,
  searchInput,
  yearDropdown,
  yearTrigger,
  yearChevron,
  visuallyHidden,
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
  return (
    <div className={yearDropdown}>
      <select
        className={yearTrigger}
        value={selectedYear}
        onChange={(event) => {
          const value = event.target.value
          onYearChange(value === 'all' ? 'all' : Number(value))
        }}
        aria-label="프로젝트 연도 필터"
        aria-describedby="project-year-filter-hint"
      >
        <option value="all">전체 연도</option>
        {allYears.map((year) => (
          <option key={year} value={year}>
            {year}년
          </option>
        ))}
      </select>
      <span className={yearChevron}>
        <ChevronIcon />
      </span>
      <span id="project-year-filter-hint" className={visuallyHidden}>
        프로젝트가 진행 중이었던 모든 해를 기준으로 필터링합니다.
      </span>
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

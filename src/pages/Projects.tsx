import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BuildBox,
  BuildProvider,
  BuildReveal,
  BuildSection,
  BuildText,
  FinishOnChange,
} from '@/build/components'
import { CARD, FRAME, THUMB } from '@/components/frame/decls'
import { FrameLabel } from '@/components/frame/FrameLabel'
import { page, section } from '@/components/frame/frame.css'
import { TagSearch, type TagOption } from '@/components/projects/TagSearch'
import { projects, sortedProjects } from '@/data/projects'
import { formatPeriod, getYear } from '@/lib/date'
import { shortRole, shortTitle } from '@/lib/project'
import type { Project } from '@/types/project'
import * as styles from './Projects.css'

const MAX_TAGS = 4

/** 시작한 해. 목록은 이 해로 묶고, 연도 버튼도 이 해를 기준으로 거릅니다 */
const startYear = (project: Project) => getYear(project.date)
const YEARS = [...new Set(sortedProjects.map(startYear))].sort((a, b) => b - a)

/** 모든 태그와 쓴 프로젝트 수. 많이 쓴 순, 같으면 이름순 */
const TAG_OPTIONS: TagOption[] = (() => {
  const counts = new Map<string, number>()
  for (const project of projects) {
    for (const tag of project.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
})()

/** 이름, 요약, 역할, 기술 어디에 들어 있어도 찾습니다 */
function matches(project: Project, query: string) {
  if (!query) return true
  const haystack = [project.title, project.summary, project.role ?? '', ...project.tags]
    .join(' ')
    .toLowerCase()
  return haystack.includes(query)
}

function ProjectTile({
  project,
  activeTags,
  onTag,
}: {
  project: Project
  activeTags: string[]
  onTag: (tag: string) => void
}) {
  const base = `tile-${project.id}`
  const name = shortTitle(project)
  const meta = [formatPeriod(project.date, project.endDate), shortRole(project)]
    .filter(Boolean)
    .join(' · ')

  return (
    <BuildSection id={base} label={name} as="div">
      <BuildBox
        as="article"
        id={`${base}-card`}
        name={`.tile-${project.id}`}
        decls={CARD}
        className={styles.tile}
      >
        <BuildBox id={`${base}-thumb`} name=".thumbnail" decls={THUMB} className={styles.thumb}>
          <BuildReveal id={`${base}-image`} className={styles.thumbInner}>
            {project.thumbnail ? (
              <img className={styles.thumbImage} src={project.thumbnail} alt="" loading="lazy" />
            ) : (
              <div className={styles.thumbFallback}>{name.slice(0, 1)}</div>
            )}
          </BuildReveal>
        </BuildBox>
        <div className={styles.tileBody}>
          <BuildText id={`${base}-meta`} text={meta} className={styles.meta} />
          <h3 className={styles.tileTitle}>
            <Link to={`/projects/${project.id}`} className={styles.stretchedLink}>
              <BuildText id={`${base}-title`} as="span" text={project.title} />
            </Link>
          </h3>
          <BuildText id={`${base}-summary`} text={project.summary} className={styles.summary} />
          <BuildReveal id={`${base}-tags`} as="ul" className={styles.tags} aria-label="기술 태그">
            {project.tags.slice(0, MAX_TAGS).map((tag) => (
              <li key={tag}>
                <button
                  type="button"
                  className={styles.tagButton}
                  aria-pressed={activeTags.includes(tag)}
                  aria-label={`${tag} 태그로 거르기`}
                  onClick={() => onTag(tag)}
                >
                  {tag}
                </button>
              </li>
            ))}
          </BuildReveal>
        </div>
      </BuildBox>
    </BuildSection>
  )
}

export default function Projects() {
  const [query, setQuery] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [year, setYear] = useState<number | 'all'>('all')
  const normalized = query.trim().toLowerCase()

  const addTag = (tag: string) => setTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]))
  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag))

  const groups = useMemo(() => {
    const filtered = sortedProjects.filter(
      (project) =>
        (year === 'all' || startYear(project) === year) &&
        tags.every((tag) => project.tags.includes(tag)) &&
        matches(project, normalized),
    )
    const byYear = new Map<number, Project[]>()
    for (const project of filtered) {
      const key = startYear(project)
      byYear.set(key, [...(byYear.get(key) ?? []), project])
    }
    return [...byYear.entries()].sort((a, b) => b[0] - a[0])
  }, [normalized, tags, year])

  const count = groups.reduce((sum, [, list]) => sum + list.length, 0)
  const filtering = normalized !== '' || tags.length > 0 || year !== 'all'
  // 조건이 바뀌면 남은 조립을 모두 끝내서, 아직 안 그려진 카드가 결과로 올라와도 완성된 모습으로 보입니다
  const filterKey = JSON.stringify([normalized, tags, year])
  const resetFilters = () => {
    setQuery('')
    setTags([])
    setYear('all')
  }

  return (
    <BuildProvider>
      <div className={page}>
        <BuildSection
          id="projects-head"
          label="프로젝트"
          guide="프로젝트 목록을 펼쳐 볼게요."
          className={section}
        >
          <FrameLabel text="프로젝트" />
          <BuildBox id="projects-head-frame" name=".projects" decls={FRAME} className={styles.head}>
            <BuildText id="projects-title" as="h1" text="프로젝트" className={styles.title} />
            <BuildText
              id="projects-lead"
              text={`지금까지 만든 프로젝트 ${projects.length}개를 시작한 연도별로 모았습니다.`}
              className={styles.lead}
            />
            <BuildReveal id="projects-tools" className={styles.tools}>
              <TagSearch
                query={query}
                onQueryChange={setQuery}
                tags={tags}
                onAddTag={addTag}
                onRemoveTag={removeTag}
                options={TAG_OPTIONS}
              />
              <div className={styles.years} role="group" aria-label="시작한 해">
                {(['all', ...YEARS] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={styles.year}
                    aria-pressed={year === value}
                    onClick={() => setYear(value)}
                  >
                    {value === 'all' ? '전체' : value}
                  </button>
                ))}
              </div>
            </BuildReveal>
          </BuildBox>
        </BuildSection>

        <BuildSection id="projects-result" label="결과" as="div" className={styles.resultRow}>
          <BuildText
            id="projects-result-count"
            as="span"
            text={`${count}개의 프로젝트`}
            aria-live="polite"
          />
          {filtering && (
            <BuildReveal id="projects-result-reset" as="span">
              <button type="button" className={styles.reset} onClick={resetFilters}>
                조건 지우기
              </button>
            </BuildReveal>
          )}
        </BuildSection>

        {groups.length === 0 ? (
          <p className={styles.empty}>조건에 맞는 프로젝트가 없어요.</p>
        ) : (
          groups.map(([groupYear, list]) => (
            <section
              key={groupYear}
              className={styles.group}
              aria-label={`${groupYear}년에 시작한 프로젝트`}
            >
              <BuildSection
                id={`year-${groupYear}`}
                label={`${groupYear}년`}
                guide={`${groupYear}년에 시작한 작업이에요.`}
                as="div"
                className={styles.yearHead}
              >
                <BuildText
                  id={`year-${groupYear}-title`}
                  as="h2"
                  text={String(groupYear)}
                  className={styles.yearTitle}
                />
                <BuildText
                  id={`year-${groupYear}-count`}
                  as="span"
                  text={`${list.length}개`}
                  className={styles.yearCount}
                />
              </BuildSection>
              <div className={styles.grid}>
                {list.map((project) => (
                  <ProjectTile
                    key={project.id}
                    project={project}
                    activeTags={tags}
                    onTag={addTag}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
      <FinishOnChange value={filterKey} />
    </BuildProvider>
  )
}

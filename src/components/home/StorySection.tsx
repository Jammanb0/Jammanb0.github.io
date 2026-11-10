import { Link } from 'react-router-dom'
import { BuildBox, BuildReveal, BuildSection, BuildText } from '@/build/components'
import { getProjectById } from '@/data/projects'
import { visibleStory } from '@/data/story'
import { shortTitle } from '@/lib/project'
import type { Project } from '@/types/project'
import type { StoryChapter } from '@/types/story'
import { CARD } from '@/components/frame/decls'
import { FrameLabel } from '@/components/frame/FrameLabel'
import { section } from '@/components/frame/frame.css'
import * as styles from './home.css'

function ProjectChips({ id, ids }: { id: string; ids?: string[] }) {
  const list = (ids ?? [])
    .map((projectId) => {
      const project = getProjectById(projectId)
      if (!project && import.meta.env.DEV) {
        console.warn(`[story] projects.ts에 없는 프로젝트 id입니다: ${projectId}`)
      }
      return project
    })
    .filter((project): project is Project => Boolean(project))
  if (list.length === 0) return null

  return (
    <BuildReveal id={id} as="ul" className={styles.chips} aria-label="관련 프로젝트">
      {list.map((project) => (
        <li key={project.id}>
          <Link className={styles.chipLink} to={`/projects/${project.id}`}>
            {shortTitle(project)}
          </Link>
        </li>
      ))}
    </BuildReveal>
  )
}

function StoryChapterSection({ chapter }: { chapter: StoryChapter }) {
  const base = `story-${chapter.id}`
  return (
    <BuildSection
      id={base}
      label={chapter.title}
      guide={chapter.guide}
      commit={{ message: chapter.commit, date: chapter.date }}
      className={section}
    >
      <FrameLabel text={`내 이야기 / ${chapter.title}`} draft={chapter.draft} />
      <BuildBox
        id={`${base}-card`}
        name={`.${base}`}
        decls={CARD}
        as="article"
        className={styles.card}
      >
        {chapter.date && (
          <BuildText id={`${base}-date`} text={chapter.date} className={styles.eyebrow} />
        )}
        <BuildText id={`${base}-title`} as="h3" text={chapter.title} className={styles.cardTitle} />
        {chapter.paragraphs?.map((paragraph, i) => (
          <BuildText key={i} id={`${base}-p${i}`} text={paragraph} className={styles.paragraph} />
        ))}
        {chapter.items && (
          <ol className={styles.timeline}>
            {chapter.items.map((item, i) => (
              <li key={i} className={styles.timelineItem}>
                <BuildText
                  id={`${base}-i${i}-period`}
                  as="span"
                  text={item.period}
                  className={styles.period}
                />
                <div className={styles.itemBody}>
                  <BuildText
                    id={`${base}-i${i}-text`}
                    text={item.text}
                    className={styles.itemText}
                  />
                  <ProjectChips id={`${base}-i${i}-chips`} ids={item.projectIds} />
                </div>
              </li>
            ))}
          </ol>
        )}
      </BuildBox>
    </BuildSection>
  )
}

export function StorySection() {
  if (visibleStory.length === 0) return null
  return (
    <div id="story" className={styles.group}>
      <BuildSection id="story-head" label="내 이야기" as="div" className={styles.groupHead}>
        <BuildText id="story-head-title" as="h2" text="내 이야기" className={styles.groupTitle} />
      </BuildSection>
      {visibleStory.map((chapter) => (
        <StoryChapterSection key={chapter.id} chapter={chapter} />
      ))}
    </div>
  )
}

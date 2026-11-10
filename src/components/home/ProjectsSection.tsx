import { Link } from 'react-router-dom'
import { BuildBox, BuildReveal, BuildSection, BuildText } from '@/build/components'
import { CARD, THUMB } from '@/components/frame/decls'
import { FrameLabel } from '@/components/frame/FrameLabel'
import { section } from '@/components/frame/frame.css'
import { Tag } from '@/components/ui/Tag'
import { featuredProjects, projects, sortedProjects } from '@/data/projects'
import { formatMonth, formatPeriod } from '@/lib/date'
import { shortRole, shortTitle } from '@/lib/project'
import type { Project } from '@/types/project'
import * as styles from './home.css'

const MAX_TAGS = 5

/** 대표작 순서에 맞춘 안내 문장. 대표작은 최신순입니다 */
function guideFor(index: number, total: number) {
  if (index === 0) return '가장 최근 작업부터 볼게요.'
  if (index === total - 1) return '마지막 대표작이에요.'
  return '다음 작업이에요.'
}

function ProjectSection({
  project,
  index,
  total,
}: {
  project: Project
  index: number
  total: number
}) {
  const base = `project-${project.id}`
  const name = shortTitle(project)
  const meta = [formatPeriod(project.date, project.endDate), shortRole(project)]
    .filter(Boolean)
    .join(' · ')

  return (
    <BuildSection
      id={base}
      label={name}
      guide={guideFor(index, total)}
      commit={{ message: `feat: ${name}`, date: formatMonth(project.date) }}
      className={section}
    >
      <FrameLabel text={`만든 것들 / ${name}`} />
      <BuildBox
        id={`${base}-card`}
        name={`.${base}`}
        decls={CARD}
        as="article"
        className={styles.projectCard}
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
        <div className={styles.projectBody}>
          <BuildText id={`${base}-meta`} text={meta} className={styles.projectMeta} />
          <h3 className={styles.projectTitle}>
            <Link to={`/projects/${project.id}`} className={styles.stretchedLink}>
              <BuildText id={`${base}-title`} as="span" text={project.title} />
            </Link>
          </h3>
          <BuildText id={`${base}-summary`} text={project.summary} className={styles.summary} />
          <BuildReveal id={`${base}-tags`} as="ul" className={styles.tags} aria-label="기술">
            {project.tags.slice(0, MAX_TAGS).map((tag) => (
              <li key={tag}>
                <Tag>{tag}</Tag>
              </li>
            ))}
          </BuildReveal>
          <BuildReveal id={`${base}-more`} as="p" className={styles.more} aria-hidden="true">
            자세히 보기 →
          </BuildReveal>
        </div>
      </BuildBox>
    </BuildSection>
  )
}

export function ProjectsSection() {
  const featured = featuredProjects.length > 0 ? featuredProjects : sortedProjects.slice(0, 3)
  if (featured.length === 0) return null

  return (
    <div id="projects" className={styles.group}>
      <BuildSection id="projects-head" label="만든 것들" as="div" className={styles.groupHead}>
        <BuildText
          id="projects-head-title"
          as="h2"
          text="만든 것들"
          className={styles.groupTitle}
        />
      </BuildSection>
      <BuildSection
        id="projects-intro"
        label="만든 것들"
        guide="이제 직접 만든 것들을 보여드릴게요!"
        as="div"
      >
        <BuildText
          id="projects-intro-text"
          text={`대표 작업 ${featured.length}개입니다. 전체 ${projects.length}개는 프로젝트 목록에서 볼 수 있어요.`}
          className={styles.introText}
        />
      </BuildSection>
      {featured.map((project, i) => (
        <ProjectSection key={project.id} project={project} index={i} total={featured.length} />
      ))}
    </div>
  )
}

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Project } from '@/types/project'
import { Tag } from '@/components/ui/Tag'
import { formatPeriod } from '@/lib/date'
import {
  card,
  thumb,
  thumbFallback,
  body,
  meta,
  title,
  summary,
  tagRow,
  moreTag,
} from './ProjectCard.css'

// Cards stay compact even when a project has many tags; the full list is
// still shown on the detail page, and the tag filter always matches against
// project.tags in full — this only affects what's visible on the card.
const MAX_VISIBLE_TAGS = 4

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const visibleTags = project.tags.slice(0, MAX_VISIBLE_TAGS)
  const hiddenCount = project.tags.length - visibleTags.length
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.4), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
    >
      <Link to={`/projects/${project.id}`} className={card}>
        <div
          className={thumb}
          style={project.thumbnail ? { backgroundImage: `url("${project.thumbnail}")` } : undefined}
        >
          {!project.thumbnail && (
            <div className={thumbFallback}>{project.title.slice(0, 1)}</div>
          )}
        </div>
        <div className={body}>
          <p className={meta}>
            {formatPeriod(project.date, project.endDate)}
            {project.role ? ` · ${project.role}` : ''}
          </p>
          <h3 className={title}>{project.title}</h3>
          <p className={summary}>{project.summary}</p>
          <div className={tagRow}>
            {visibleTags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
            {hiddenCount > 0 && <span className={moreTag}>+{hiddenCount}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

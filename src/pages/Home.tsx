import { Link } from 'react-router-dom'
import { Hero } from '@/components/home/Hero'
import { Container } from '@/components/layout/Container'
import { ProjectCard } from '@/components/portfolio/ProjectCard'
import { Button } from '@/components/ui/Button'
import { featuredProjects, sortedProjects } from '@/data/projects'
import {
  section,
  sectionHead,
  sectionTitle,
  sectionLink,
  grid,
  empty,
  ctaSection,
  ctaTitle,
} from './Home.css'

export default function Home() {
  const projectsToShow = featuredProjects.length ? featuredProjects : sortedProjects.slice(0, 3)

  return (
    <>
      <Hero />

      <Container>
        <section className={section}>
          <div className={sectionHead}>
            <h2 className={sectionTitle}>
              {projectsToShow.length > 0 ? 'Featured Projects' : 'Projects'}
            </h2>
            {projectsToShow.length > 0 && (
              <Link className={sectionLink} to="/projects">
                전체 보기 →
              </Link>
            )}
          </div>
          {projectsToShow.length > 0 ? (
            <div className={grid}>
              {projectsToShow.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>
          ) : (
            <p className={empty}>프로젝트를 준비 중입니다.</p>
          )}
        </section>

        {projectsToShow.length > 0 && (
          <section className={ctaSection}>
            <h2 className={ctaTitle}>더 많은 작업물이 궁금하신가요?</h2>
            <Button to="/projects" tone="primary" size="lg">
              모든 프로젝트 보기
            </Button>
          </section>
        )}
      </Container>
    </>
  )
}

import { useMemo, useState } from 'react'
import { Container } from '@/components/layout/Container'
import { ProjectCard } from '@/components/portfolio/ProjectCard'
import { ProjectFilters, type TagMode } from '@/components/portfolio/ProjectFilters'
import { sortedProjects, allTags, allYears } from '@/data/projects'
import { header, title, subtitle, grid, empty } from './Projects.css'

export default function Projects() {
  const [query, setQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagMode, setTagMode] = useState<TagMode>('any')
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all')

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const clearFilters = () => {
    setQuery('')
    setSelectedTags([])
    setTagMode('any')
    setSelectedYear('all')
  }

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sortedProjects.filter((project) => {
      const matchesQuery = q === '' || project.title.toLowerCase().includes(q)
      const matchesTags =
        selectedTags.length === 0 ||
        (tagMode === 'all'
          ? selectedTags.every((tag) => project.tags.includes(tag))
          : selectedTags.some((tag) => project.tags.includes(tag)))
      const matchesYear =
        selectedYear === 'all' || new Date(project.date).getFullYear() === selectedYear
      return matchesQuery && matchesTags && matchesYear
    })
  }, [query, selectedTags, tagMode, selectedYear])

  return (
    <Container>
      <header className={header}>
        <h1 className={title}>Projects</h1>
        <p className={subtitle}>지금까지 진행한 프로젝트 {sortedProjects.length}개입니다.</p>
      </header>

      <ProjectFilters
        query={query}
        onQueryChange={setQuery}
        allTags={allTags}
        selectedTags={selectedTags}
        onToggleTag={toggleTag}
        tagMode={tagMode}
        onTagModeChange={setTagMode}
        allYears={allYears}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        resultCount={filteredProjects.length}
        onClear={clearFilters}
      />

      {filteredProjects.length > 0 ? (
        <div className={grid}>
          {filteredProjects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      ) : (
        <p className={empty}>조건에 맞는 프로젝트가 없습니다.</p>
      )}
    </Container>
  )
}

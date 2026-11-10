import type { Project } from '@/types/project'

/** '레서담 — PDF 변환·합치기 Windows 도구' → '레서담' */
export function shortTitle(project: Project) {
  return project.title.split(' — ')[0].trim()
}

/** 'Solo Developer (기획 · …)' → 'Solo Developer' */
export function shortRole(project: Project) {
  return project.role?.split(' (')[0].trim()
}

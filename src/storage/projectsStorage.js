const STORAGE_KEY = 'projects'

export function getProjects() {
  const projects = localStorage.getItem(STORAGE_KEY)

  return projects ? JSON.parse(projects) : []
}

export function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function getProjectById(id) {
  const projects = getProjects()

  return projects.find(
    (project) => project.id === Number(id)
  )
}

export function updateProject(updatedProject) {
  const projects = getProjects()

  const updatedProjects = projects.map((project) =>
    project.id === updatedProject.id
      ? updatedProject
      : project
  )

  saveProjects(updatedProjects)
}
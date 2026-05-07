import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  getProjects,
  saveProjects,
} from '../storage/projectsStorage'

function HomePage() {
  const [projects, setProjects] = useState([])
  const [title, setTitle] = useState('')

  useEffect(() => {
    setProjects(getProjects())
  }, [])

  function createProject() {
    if (!title.trim()) return

    const newProject = {
      id: Date.now(),
      title,
      images: [],
    }

    const updatedProjects = [...projects, newProject]

    setProjects(updatedProjects)

    saveProjects(updatedProjects)

    setTitle('')
  }

  function deleteProject(id) {
    const updatedProjects = projects.filter(
      (project) => project.id !== id
    )

    setProjects(updatedProjects)

    saveProjects(updatedProjects)
  }

  return (
    <div className="container">
    <h1 className="page-title">Проекты</h1>   

      <div className="form-group">
        <input
          className="input"
          type="text"
          placeholder="Название проекта"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

        <button
          className="button"
          onClick={createProject}
        >
          Создать проект
        </button>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <div
            key={project.id}
            className="project-card"
          >
            <h2>
              <Link
                to={`/project/${project.id}`}
              >
                {project.title}
              </Link>
            </h2>

            <p>
              Изображения: {project.images.length}
            </p>

            <button
              className="button button-danger"
              onClick={() =>
                deleteProject(project.id)
              }
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HomePage
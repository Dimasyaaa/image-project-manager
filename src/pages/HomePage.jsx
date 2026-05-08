import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function HomePage() {
  const [projects, setProjects] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getProjects().then(setProjects).catch(err => console.error(err))
  }, [])

  async function createProject() {
    if (!title.trim()) return
    setLoading(true)
    try {
      const newProject = await api.createProject(title)
      setProjects(prev => [...prev, newProject])
      setTitle('')
    } catch (err) {
      alert('Ошибка: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function deleteProject(id) {
    if (!confirm('Удалить проект и все изображения?')) return
    try {
      await api.deleteProject(id)
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      alert('Ошибка: ' + err.message)
    }
  }

  return (
    <div className="container">
      <h1 className="page-title">Проекты</h1>
      <div className="form-group">
        <input className="input" type="text" placeholder="Название проекта" value={title} onChange={e => setTitle(e.target.value)} />
        <button className="button" onClick={createProject} disabled={loading}>{loading ? 'Создание...' : 'Создать проект'}</button>
      </div>
      <div className="projects-grid">
        {projects.map(p => (
          <div key={p.id} className="project-card">
            <h2><Link to={`/project/${p.id}`}>{p.title}</Link></h2>
            <p>Изображений: {p.images?.length || 0}</p>
            <button className="button button-danger" onClick={() => deleteProject(p.id)}>Удалить</button>
          </div>
        ))}
      </div>
    </div>
  )
}
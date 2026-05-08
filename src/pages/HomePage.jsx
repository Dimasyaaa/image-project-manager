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
      <section className="hero-section">
        <h2 className="hero-title">Система создания проектов</h2>
        <p className="hero-subtitle">
          Платформа для управления проектами. 
          Загружайте данные, размечайте объекты и управляйте датасетами в едином интерфейсе.
        </p>
        
        <div className="features-grid">
          <div className="feature-card">
            <h3>Управление проектами</h3>
            <p>Создавайте проекты и организуйте изображения по категориям.</p>
          </div>
          <div className="feature-card">
            <h3>Аннотация данных</h3>
            <p>Рисуйте bounding boxes прямо в браузере с точностью до пикселя.</p>
          </div>
        </div>
      </section>

      <section className="projects-section">
        <div className="section-header">
          <h2 className="section-title">Ваши проекты</h2>
          <div className="form-group">
            <input 
              className="input" 
              type="text" 
              placeholder="Введите название проекта" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
            />
            <button className="button" onClick={createProject} disabled={loading}>
              {loading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </div>

        <div className="projects-grid">
          {projects.map(p => (
            <div key={p.id} className="project-card">
              <h2><Link to={`/project/${p.id}`}>{p.title}</Link></h2>
              <p className="project-stat">Изображений: {p.images?.length || 0}</p>
              <button className="button button-danger" onClick={() => deleteProject(p.id)}>
                Удалить
              </button>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="empty-state">
              <p>Нет проектов. Создайте первый выше!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
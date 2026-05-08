// src/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(url, options = {}) {
  // По умолчанию отправляем JSON, но для FormData заголовок уберём (браузер сам поставит boundary)
  const headers = options.body instanceof FormData ? {} : { 'Content-Type': 'application/json', ...options.headers }
  
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers })
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Network error' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.status === 204 ? null : res.json()
}

export const api = {
  // Проекты
  getProjects: () => request('/projects'),
  createProject: (title) => request('/projects', { method: 'POST', body: JSON.stringify({ title }) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  // Изображения
  getImages: (projectId) => request(`/projects/${projectId}/images`),
  uploadImages: async (projectId, files) => {
    const formData = new FormData()
    Array.from(files).forEach(f => formData.append('files', f))
    return request(`/projects/${projectId}/images`, { method: 'POST', body: formData })
  },
  deleteImage: (id) => request(`/images/${id}`, { method: 'DELETE' }),

  // Аннотации
  getAnnotations: (imageId) => request(`/images/${imageId}/annotations`),
  createAnnotation: (imageId, data) => request(`/images/${imageId}/annotations`, {
    method: 'POST',
    body: JSON.stringify({
      class_name: data.class_name || data.className,
      x: data.x, y: data.y, width: data.width, height: data.height
    })
  }),
  deleteAnnotation: (imageId, annoId) => request(`/images/${imageId}/annotations/${annoId}`, { method: 'DELETE' })
}
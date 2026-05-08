import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'

export default function ProjectPage() {
  const { id } = useParams()
  const fileInputRef = useRef(null)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getImages(id).then(setImages).catch(err => console.error(err))
  }, [id])

  function handleUpload(e) {
    const files = Array.from(e.target.files)
    if (files.length) processFiles(files)
  }

  function handleDrop(e) {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length) processFiles(files)
  }

  async function processFiles(files) {
    setLoading(true)
    try {
      const uploaded = await api.uploadImages(id, files)
      setImages(prev => [...prev, ...uploaded])
    } catch (err) {
      alert('Ошибка загрузки: ' + err.message)
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function deleteImage(imageId) {
    if (!confirm('Удалить изображение?')) return
    try {
      await api.deleteImage(imageId)
      setImages(prev => prev.filter(img => img.id !== imageId))
    } catch (err) {
      alert('Ошибка: ' + err.message)
    }
  }

  return (
    <div className="container">
      <Link to="/">Назад</Link>
      <h1 className="page-title">Проект #{id}</h1>
      <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
        <p>Перетащите изображения сюда или нажмите</p>
        <input ref={fileInputRef} type="file" multiple accept="image/*" hidden onChange={handleUpload} />
      </div>
      <div className="images-grid">
        {images.map(img => (
          <div key={img.id} className="image-card">
            <img src={img.url} alt={img.name} />
            <div className="image-content">
              <p>{img.name}</p>
              <Link to={`/image/${id}/${img.id}`}><button className="button">Открыть</button></Link>
              <button className="button button-danger" onClick={() => deleteImage(img.id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
      {loading && <p style={{textAlign:'center', marginTop:10}}>Загрузка...</p>}
    </div>
  )
}
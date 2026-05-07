import { Link, useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { getProjectById } from '../storage/projectsStorage'
import { getImageAnnotations, saveImageAnnotations } from '../storage/annotationsStorage'

function ImagePage() {
  const { projectId, imageId } = useParams()
  const containerRef = useRef(null)
  const imgRef = useRef(null)

  const project = getProjectById(projectId)
  const [annotations, setAnnotations] = useState([])
  
  const [drawing, setDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState(null)
  const [currentBox, setCurrentBox] = useState(null)

  const [hovered, setHovered] = useState(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const saved = getImageAnnotations(imageId)
    setAnnotations(saved || [])
  }, [imageId])

  if (!project) return <h1>Проект не найден</h1>

  const image = project.images.find((img) => img.id === Number(imageId))
  if (!image) return <h1>Изображение не найдено</h1>

  function getMousePercentages(e) {
    if (!imgRef.current) return { x: 0, y: 0 }
    const rect = imgRef.current.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    }
  }

  function handleMouseDown(e) {
    if (e.button !== 0) return
    const pos = getMousePercentages(e)
    setDrawing(true)
    setStartPoint(pos)
    setCurrentBox({ x: pos.x, y: pos.y, width: 0, height: 0 })
  }

  function handleMouseMove(e) {
    if (!drawing || !startPoint) return
    const pos = getMousePercentages(e)
    setCurrentBox({
      x: Math.min(startPoint.x, pos.x),
      y: Math.min(startPoint.y, pos.y),
      width: Math.abs(pos.x - startPoint.x),
      height: Math.abs(pos.y - startPoint.y),
    })
  }

  function handleMouseUp() {
    if (!currentBox) return
    setDrawing(false)
    if (currentBox.width < 0.3 || currentBox.height < 0.3) {
      setCurrentBox(null)
      return
    }
    const className = prompt('Введите класс объекта')
    if (!className) { setCurrentBox(null); return }

    const newAnno = { id: Date.now(), className, ...currentBox }
    const updated = [...annotations, newAnno]
    setAnnotations(updated)
    saveImageAnnotations(imageId, updated)
    setCurrentBox(null)
  }

  function deleteAnnotation(id, e) {
    e.stopPropagation()
    const updated = annotations.filter((a) => a.id !== id)
    setAnnotations(updated)
    saveImageAnnotations(imageId, updated)
  }

  function editAnnotation(a, e) {
    e.stopPropagation()
    const newClass = prompt('Новый класс', a.className)
    if (!newClass) return
    const updated = annotations.map((item) =>
      item.id === a.id ? { ...item, className: newClass } : item
    )
    setAnnotations(updated)
    saveImageAnnotations(imageId, updated)
  }

  function getPixelCoords(a) {
    const img = imgRef.current
    if (!img || !img.complete || img.naturalWidth === 0) {
    return { x: 0, y: 0, w: 0, h: 0 }
    }
    return {
      x: Math.round((a.x / 100) * img.naturalWidth),
      y: Math.round((a.y / 100) * img.naturalHeight),
      w: Math.round((a.width / 100) * img.naturalWidth),
      h: Math.round((a.height / 100) * img.naturalHeight),
    }
  }

  return (
    <div className="container">
      <Link to={`/project/${projectId}`}>Назад</Link>
      <h1 className="page-title">{image.name}</h1>

      <div className="zoom-controls" style={{ marginBottom: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="button" onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}>−</button>
        <span style={{ minWidth: 40, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
        <button className="button" onClick={() => setZoom((z) => Math.min(5, z + 0.1))}>+</button>
        <button className="button" onClick={() => setZoom(1)}>Сброс</button>
      </div>

      <div style={{ overflow: 'auto', border: '1px solid #ccc', maxWidth: '100%', maxHeight: '80vh' }}>
        <div
          ref={containerRef}
          className="image-wrapper"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            position: 'relative',
            display: 'inline-block',
            transformOrigin: 'top left',
            transform: `scale(${zoom})`,
            cursor: drawing ? 'crosshair' : 'default',
            userSelect: 'none',
          }}
        >
          <img
            ref={imgRef}
            src={image.url}
            alt={image.name}
            draggable={false}
            style={{ display: 'block', maxWidth: '100%' }}
          />

          {annotations.map((a) => {
            const px = getPixelCoords(a)
            return (
              <div
                key={a.id}
                onMouseEnter={() => setHovered(a.id)}
                onMouseLeave={() => setHovered(null)}
                onDoubleClick={(e) => editAnnotation(a, e)}
                style={{
                  position: 'absolute',
                  left: `${a.x}%`,
                  top: `${a.y}%`,
                  width: `${a.width}%`,
                  height: `${a.height}%`,
                  border: hovered === a.id ? '2px solid red' : '2px solid #00ff00',
                  background: hovered === a.id ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.05)',
                  boxSizing: 'border-box',
                  pointerEvents: 'auto',
                }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0,
                  background: 'rgba(0,0,0,0.6)', color: '#fff',
                  padding: '2px 5px', fontSize: '12px', lineHeight: '1',
                  pointerEvents: 'none', userSelect: 'none'
                }}>
                  {a.className}
                </div>

                {hovered === a.id && (
                  <div style={{
                    position: 'absolute', bottom: '100%', left: 0,
                    background: '#fff', color: '#000',
                    padding: '8px 10px', border: '1px solid #ccc', borderRadius: '4px',
                    fontSize: '12px', whiteSpace: 'pre', zIndex: 100,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)', pointerEvents: 'auto',
                    minWidth: 140
                  }}>
                    <div><b>Класс:</b> {a.className}</div>
                    <div>X: {px.x}px | Y: {px.y}px</div>
                    <div>W: {px.w}px | H: {px.h}px</div>
                    <button
                      className="button button-danger"
                      style={{ marginTop: 6, fontSize: '11px', padding: '2px 8px', cursor: 'pointer' }}
                      onClick={(e) => deleteAnnotation(a.id, e)}
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {currentBox && (
            <div
              style={{
                position: 'absolute',
                left: `${currentBox.x}%`,
                top: `${currentBox.y}%`,
                width: `${currentBox.width}%`,
                height: `${currentBox.height}%`,
                border: '2px dashed #0066ff',
                background: 'rgba(0,102,255,0.15)',
                pointerEvents: 'none',
                boxSizing: 'border-box', 
                }}
            />
          )}
        </div>
      </div>

      <div style={{ marginTop: 20, fontSize: '14px', color: '#666' }}>
        <p>ЛКМ: Создать аннотацию</p>
        <p>Наведение: Показать координаты и удалить</p>
        <p>Двойной клик: Редактировать класс</p>
      </div>
    </div>
  )
}

export default ImagePage
import { Link, useParams } from 'react-router-dom'
import { useEffect, useRef, useState, useMemo } from 'react'
import { api } from '../api'

export default function ImagePage() {
  const { projectId, imageId } = useParams()
  const imgRef = useRef(null)
  const [image, setImage] = useState(null)
  const [annotations, setAnnotations] = useState([])
  const [drawing, setDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState(null)
  const [currentBox, setCurrentBox] = useState(null)
  const [hovered, setHovered] = useState(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    Promise.all([api.getImages(projectId), api.getAnnotations(imageId)])
      .then(([images, annos]) => {
        const found = images.find(i => i.id === Number(imageId))
        if (found) { setImage(found); setAnnotations(annos || []) }
      })
      .catch(err => console.error(err))
  }, [projectId, imageId])

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

  async function handleMouseUp() {
    if (!currentBox) return
    setDrawing(false)
    if (currentBox.width < 0.3 || currentBox.height < 0.3) { setCurrentBox(null); return }
    
    const className = prompt('Введите класс объекта')
    if (!className) { setCurrentBox(null); return }

    try {
      const newAnno = await api.createAnnotation(imageId, { class_name: className, ...currentBox })
      setAnnotations(prev => [...prev, newAnno])
    } catch (err) { alert('Ошибка: ' + err.message) }
    setCurrentBox(null)
  }

  async function deleteAnnotation(id, e) {
    e.stopPropagation()
    try {
      await api.deleteAnnotation(imageId, id)
      setAnnotations(prev => prev.filter(a => a.id !== id))
    } catch (err) { alert('Ошибка: ' + err.message) }
  }

  async function editAnnotation(a, e) {
    e.stopPropagation()
    const newClass = prompt('Новый класс', a.class_name)
    if (!newClass || newClass === a.class_name) return
    try {
      await api.deleteAnnotation(imageId, a.id)
      const updated = await api.createAnnotation(imageId, { class_name: newClass, x: a.x, y: a.y, width: a.width, height: a.height })
      setAnnotations(prev => prev.map(item => item.id === a.id ? updated : item))
    } catch (err) { alert('Ошибка: ' + err.message) }
  }

  const pixelCoordsMap = useMemo(() => {
    const map = {}
    const img = imgRef.current
    if (!img || img.naturalWidth === 0) {
      annotations.forEach(a => map[a.id] = {x:0,y:0,w:0,h:0})
      return map
    }
    annotations.forEach(a => {
      map[a.id] = {
        x: Math.round((a.x / 100) * img.naturalWidth),
        y: Math.round((a.y / 100) * img.naturalHeight),
        w: Math.round((a.width / 100) * img.naturalWidth),
        h: Math.round((a.height / 100) * img.naturalHeight),
      }
    })
    return map
  }, [annotations, image?.url])

  if (!image) return <div className="container"><p className="text-center">Загрузка...</p></div>

  return (
    <div className="container">
      <div className="section-header">
        <div>
          <Link to={`/project/${projectId}`} style={{color: 'var(--gold)', textDecoration: 'none'}}>← Назад</Link>
          <h1 className="section-title" style={{marginTop: '10px'}}>{image.name}</h1>
        </div>
      </div>

      <div className="zoom-controls">
        <button className="button" onClick={() => setZoom(z => Math.max(0.1, z - 0.1))}>−</button>
        <span>{Math.round(zoom * 100)}%</span>
        <button className="button" onClick={() => setZoom(z => Math.min(5, z + 0.1))}>+</button>
        <button className="button button-outline" onClick={() => setZoom(1)}>Сброс</button>
      </div>

      <div style={{overflow:'auto', border:'1px solid var(--border)', borderRadius:'8px', maxWidth:'100%'}}>
        <div 
          className="image-wrapper" 
          onMouseDown={handleMouseDown} 
          onMouseMove={handleMouseMove} 
          onMouseUp={handleMouseUp}
          style={{
            position:'relative', 
            display:'inline-block', 
            transformOrigin:'top left', 
            transform:`scale(${zoom})`, 
            cursor:drawing?'crosshair':'default', 
            userSelect:'none'
          }}
        >
          <img 
            ref={imgRef} 
            src={image.url} 
            alt={image.name} 
            draggable={false} 
            style={{display:'block', maxWidth:'100%'}} 
          />

          {annotations.map(a => {
            const px = pixelCoordsMap[a.id] || {x:0,y:0,w:0,h:0}
            return (
              <div 
                key={a.id} 
                className="annotation-box"
                onMouseEnter={() => setHovered(a.id)} 
                onMouseLeave={() => setHovered(null)} 
                onDoubleClick={e => editAnnotation(a, e)}
                style={{
                  position:'absolute', 
                  left:`${a.x}%`, 
                  top:`${a.y}%`, 
                  width:`${a.width}%`, 
                  height:`${a.height}%`
                }}
              >
                <div className="annotation-label">{a.class_name}</div>
                
                {hovered === a.id && (
                  <div className="tooltip">
                    <div><b>Класс:</b> {a.class_name}</div>
                    <div>X: {px.x}px | Y: {px.y}px</div>
                    <div>W: {px.w}px | H: {px.h}px</div>
                    <button className="button button-danger" style={{marginTop:'8px', fontSize:'0.8rem', padding:'4px 8px', width:'100%'}} onClick={e => deleteAnnotation(a.id, e)}>
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
                position:'absolute', 
                left:`${currentBox.x}%`, 
                top:`${currentBox.y}%`, 
                width:`${currentBox.width}%`, 
                height:`${currentBox.height}%`, 
                border:'2px dashed var(--gold)', 
                background:'rgba(212, 175, 55, 0.15)', 
                pointerEvents:'none', 
                boxSizing:'border-box'
              }} 
            />
          )}
        </div>
      </div>

      <div style={{marginTop:20, fontSize:'14px', color:'#666'}}>
        <p> ЛКМ: Создать аннотацию</p>
        <p>️ Наведение: Показать координаты и удалить</p>
        <p> Двойной клик: Редактировать</p>
      </div>
    </div>
  )
}
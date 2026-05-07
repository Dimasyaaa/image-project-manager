import { useEffect, useRef, useState } from 'react'
import {
  Link,
  useParams,
} from 'react-router-dom'

import {
  getProjectById,
  updateProject,
} from '../storage/projectsStorage'

function ProjectPage() {
  const { id } = useParams()

  const fileInputRef = useRef()

  const [project, setProject] = useState(null)

  useEffect(() => {
    const foundProject =
      getProjectById(id)

    setProject(foundProject)
  }, [id])

  function processFiles(files) {
    const imagePromises = Array.from(files).map(
      (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader()

          reader.onload = () => {
            resolve({
              id:
                Date.now(),
              name: file.name,
              url: reader.result,
            })
          }

          reader.readAsDataURL(file)
        })
      }
    )

    Promise.all(imagePromises).then(
      (images) => {
        const updatedProject = {
          ...project,
          images: [
            ...project.images,
            ...images,
          ],
        }

        setProject(updatedProject)

        updateProject(updatedProject)
      }
    )
  }

  function handleUpload(event) {
    processFiles(event.target.files)
  }

  function handleDrop(event) {
    event.preventDefault()

    processFiles(event.dataTransfer.files)
  }

  function deleteImage(imageId) {
    const updatedProject = {
      ...project,
      images: project.images.filter(
        (image) =>
          image.id !== imageId
      ),
    }

    setProject(updatedProject)

    updateProject(updatedProject)
  }

  if (!project) {
    return <h1>Project not found</h1>
  }

  return (
    <div className="container">
      <Link to="/">
        Назад
      </Link>

      <h1 className="page-title">
        {project.title}
      </h1>

      <div
        className="dropzone"
        onDragOver={(e) =>
          e.preventDefault()
        }
        onDrop={handleDrop}
        onClick={() =>
          fileInputRef.current.click()
        }
      >
        <p>
          Перетащите изображения сюда или нажмите
          для загрузки
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          hidden
          onChange={handleUpload}
        />
      </div>

      <div className="images-grid">
        {project.images.map((image) => (
          <div
            key={image.id}
            className="image-card"
          >
            <img
              src={image.url}
              alt={image.name}
            />

            <div className="image-content">
              <p>{image.name}</p>
              <Link
                    to={`/image/${project.id}/${image.id}`}
              >
              <button className="button">
                Открыть
              </button>
              </Link>

              <button
                className="button button-danger"
                onClick={() =>
                  deleteImage(image.id)
                }
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectPage
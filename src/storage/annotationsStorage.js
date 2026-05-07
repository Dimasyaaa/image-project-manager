const STORAGE_KEY = 'annotations'

export function getAnnotations() {
  const data = localStorage.getItem(STORAGE_KEY)

  return data ? JSON.parse(data) : {}
}

export function getImageAnnotations(imageId) {
  const annotations = getAnnotations()

  return annotations[imageId] || []
}

export function saveImageAnnotations(
  imageId,
  imageAnnotations
) {
  const annotations = getAnnotations()

  annotations[imageId] = imageAnnotations

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(annotations)
  )
}
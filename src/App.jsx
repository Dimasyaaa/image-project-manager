import { BrowserRouter, Routes, Route } from 'react-router-dom'

import HomePage from './pages/HomePage'
import ProjectPage from './pages/ProjectPage'
import ImagePage from './pages/ImagePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/project/:id"
          element={<ProjectPage />}
        />

        <Route
          path="/image/:projectId/:imageId"
          element={<ImagePage />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
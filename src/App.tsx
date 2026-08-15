import { RouterProvider } from 'react-router-dom'
import router from './router'
import { PharmacyProvider } from './context/PharmacyContext'

function App() {
  return (
    <PharmacyProvider>
      <RouterProvider router={router} />
    </PharmacyProvider>
  )
}

export default App


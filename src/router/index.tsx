import { createBrowserRouter } from 'react-router-dom'
import HomePage from '../pages/HomePage/HomePage'
import Login from '../pages/Login/Login'

const router = createBrowserRouter([
  {
    path: '/homepage',
    element: <HomePage />,
  },
  {
    path: '/',
    element: <Login />,
  },
])

export default router

import { createBrowserRouter } from 'react-router-dom'
import HomePage from '../pages/HomePage/HomePage'
import Login from '../pages/Login/Login'

const router = createBrowserRouter([
  {
    path: '/homepage',
    element: <HomePage />,
  },
  {
    path: '/pharmacies',
    element: <HomePage />,
  },
  {
    path: '/users',
    element: <HomePage />,
  },
  {
    path: '/tickets',
    element: <HomePage />,
  },
  {
    path: '/notifications',
    element: <HomePage />,
  },
  {
    path: '/',
    element: <Login />,
  },
])

export default router

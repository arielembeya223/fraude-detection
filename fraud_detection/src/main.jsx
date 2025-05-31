import { StrictMode } from 'react'
import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import Dashboard from './components/Dashboard/Dashboard.jsx'
import ReactDOM from 'react-dom/client'
import Welcome from './components/Welcome/Welcome.jsx';
import NotFound from './components/NotFound/NotFound.jsx'
import FullScreenMap from './components/Map/FullScreenMap.jsx'
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: "/",
        element: <Welcome />,
        
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
        
      },
      {
        path: "/map",
        element: <FullScreenMap />,
        
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)

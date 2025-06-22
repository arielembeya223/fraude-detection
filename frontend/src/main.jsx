import { StrictMode } from 'react'
import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import Dashboard from './components/Dashboard/Dashboard.jsx'
import ReactDOM from 'react-dom/client'
import Welcome from './components/Welcome/Welcome.jsx';
import NotFound from './components/NotFound/NotFound.jsx'
import FullScreenMap from './components/Map/FullScreenMap.jsx'
import FinancialReport from './components/UploadReport/FinancialReport.jsx'
import ReportConfiguration from './components/ReportConfiguration/ReportConfiguration.jsx'
import ReportPreview from './components/ReportPreview/ReportPreview.jsx'
import LoginForm from './components/Auth/LoginForm.jsx'
import RegisterForm from './components/Auth/RegisterForm.jsx'
import FraudMonitoringDashboard from './components/FraudMonitoringDashboard/FraudMonitoringDashboard.jsx'
import FraudAccountManagement from './components/FraudAccountManagement/FraudAccountManagement.jsx'
import ReportDetails from './components/UploadReport/ReportDetails.jsx'
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
      {
        path: "/report",
        element: <FinancialReport/>,
        
      },
      {
        path:"/report/:id",
        element: <ReportDetails/>,
        
      },
     {
        path: "/reportConfiguration",
        element: <ReportConfiguration/>,
        
      },
      {
        path: "/reportView",
        element: <ReportPreview/>,
        
      }
      ,{
        path: "/login",
        element: <LoginForm/>,
        
      }
      ,{
        path: "/register",
        element: <RegisterForm/>,
        
      }
       ,{
        path: "/FraudMonitoringDashboard",
        element: <FraudMonitoringDashboard/>,
        
      },
      {
        path: "/FraudAccountManagement",
        element: <FraudAccountManagement/>,
        
      }
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)

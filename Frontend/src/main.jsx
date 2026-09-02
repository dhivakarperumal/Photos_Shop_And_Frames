import { StrictMode, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Home from './Componets/Home/Home.jsx'
import Login from './Componets/Auth/Login.jsx'
import Register from './Componets/Auth/Register.jsx'
import PrivateRoute from './PrivateRouter/PrivateRouter.jsx'

import AdminDashboard from './Admin/AdminDashboard.jsx'
import AdminProducts from './Admin/AdminProducts/AdminProducts.jsx'
import AdminCategories from './Admin/AdminProducts/Categories.jsx'
import AddCategory from './Admin/AdminProducts/AddCategory.jsx'
import StockDetails from './Admin/AdminProducts/StockDetails.jsx'
import AdminAlbums from './Admin/AdminAlbums.jsx'
import AddAlbum from './Admin/AddAlbum.jsx'
import BannerManagement from './Admin/Marketting/BannerManagement.jsx'
import VideoManagement from './Admin/Marketting/VideoManagement.jsx'
import GalleryManagement from './Admin/Marketting/GalleryManagement.jsx'
import AddGalleryAlbum from './Admin/Marketting/AddGalleryAlbum.jsx'
import Coupons from './Admin/Marketting/Coupons.jsx'
import AdminCustomers from './Admin/AdminCustomers.jsx'
import AdminLayout from './Admin/Adminpanel.jsx'


import { AuthProvider } from './PrivateRouter/AuthContext.jsx'
import { StoreProvider } from './PrivateRouter/StoreContext.jsx'
import { AdminProvider } from './PrivateRouter/AdminContext';
import RouteError from './Componets/CommonComponents/RouteError.jsx'



const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },

      {
        path: 'admin',
        element: (
          <PrivateRoute allowedRoles={["Super Admin", "Admin"]}>
            <AdminLayout />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: 'products',
            element: <AdminProducts />,
          },
          {
            path: 'products/categories',
            element: <AdminCategories />,
          },
          {
            path: 'products/categories/add',
            element: <AddCategory />,
          },
          {
            path: 'products/stock-details',
            element: <StockDetails />,
          },
          {
            path: 'albums',
            element: <AdminAlbums />,
          },
          {
            path: 'albums/add',
            element: <AddAlbum />,
          },
          {
            path: 'banners',
            element: <BannerManagement />,
          },
          {
            path: 'videos',
            element: <VideoManagement />,
          },
          {
            path: 'gallery',
            element: <GalleryManagement />,
          },
          {
            path: 'gallery/add',
            element: <AddGalleryAlbum />,
          },
          {
            path: 'coupons',
            element: <Coupons />,
          },
          {
            path: 'customers',
            element: <AdminCustomers />,
          },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <StoreProvider>
        <AdminProvider>
          <RouterProvider router={router} />
        </AdminProvider>
      </StoreProvider>
    </AuthProvider>
  </StrictMode>,
)

// Make token debugger available globally in browser console
if (import.meta.env.DEV) {
  console.log("🔐 Token debugger available. Run checkTokenStatus() in console to debug authentication.");
}

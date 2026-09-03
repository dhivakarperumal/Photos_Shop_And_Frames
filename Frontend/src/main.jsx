import { StrictMode, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Home from './Componets/Home/Home.jsx'
import Shop from './Componets/Shop/Shop.jsx'
import ProductDetails from './Componets/Shop/ProductDetails.jsx'
import Cart from './Componets/Cart/Cart.jsx'
import Login from './Componets/Auth/Login.jsx'
import Register from './Componets/Auth/Register.jsx'
import PrivateRoute from './PrivateRouter/PrivateRouter.jsx'
import AdminOrders from './Admin/AdminOrders/AdminOrders.jsx'

import AdminDashboard from './Admin/AdminDashboard.jsx'
import AdminProducts from './Admin/AdminProducts/AdminProducts.jsx'
import AddProducts from './Admin/AdminProducts/AddProducts.jsx'
import AddFrame from './Admin/AdminProducts/AddFrame.jsx'
import FramesList from './Admin/AdminProducts/FramesList.jsx'
import AdminReviews from './Admin/AdminReviews/AdminReviews.jsx'
import AdminCategories from './Admin/AdminProducts/Categories.jsx'
import AddCategory from './Admin/AdminProducts/AddCategory.jsx'
import StockDetails from './Admin/AdminProducts/StockDetails.jsx'
import AdminAlbums from './Admin/AdminAlbums.jsx'
import AddAlbum from './Admin/AddAlbum.jsx'
import AlbumDetails from './Admin/AlbumDetails.jsx'
import BannerManagement from './Admin/Marketting/BannerManagement.jsx'
import VideoManagement from './Admin/Marketting/VideoManagement.jsx'
import GalleryManagement from './Admin/Marketting/GalleryManagement.jsx'
import AddGalleryAlbum from './Admin/Marketting/AddGalleryAlbum.jsx'
import GalleryDetails from './Admin/Marketting/GalleryDetails.jsx'
import Coupons from './Admin/Marketting/Coupons.jsx'
import AdminCustomers from './Admin/AdminCustomers.jsx'
import CustomerDetails from './Admin/CustomerDetails.jsx'
import Billing from './Admin/Billings/Billing.jsx'
import NewBilling from './Admin/Billings/NewBilling.jsx'
import OrderDetails from './Admin/Billings/OrderDetails.jsx'
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
        path: 'shop',
        element: <Shop />,
      },
      {
        path: 'products/:id',
        element: <ProductDetails />,
      },
      {
        path: 'product/:id',
        element: <ProductDetails />,
      },
      {
        path: 'cart',
        element: <Cart />,
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
            path: 'products/add',
            element: <AddProducts />,
          },
          {
            path: 'products/edit/:id',
            element: <AddProducts />,
          },
          {
            path: 'frames/add',
            element: <AddFrame />,
          },
          {
            path: 'frames/edit/:id',
            element: <AddFrame />,
          },
          {
            path: 'products/frames',
            element: <FramesList />,
          },
          {
            path: 'frames',
            element: <FramesList />,
          },
          {
            path: 'frames/edit/:id',
            element: <AddFrame />,
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
            path: 'products/categories/edit/:categoryId',
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
            path: 'albums/:albumId',
            element: <AlbumDetails />,
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
            path: 'gallery/:albumId',
            element: <GalleryDetails />,
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
          {
            path: 'customers/:userId',
            element: <CustomerDetails />,
          },
          {
            path: 'billing',
            element: <Billing />,
          },
          {
            path: 'billing/new',
            element: <NewBilling />,
          },
          {
            path: 'billing/:orderId',
            element: <OrderDetails />,
          },
          {
            path: 'reviews',
            element: <AdminReviews />,
          },
          {
            path: 'orders',
            element: <AdminOrders />,
          },
          {
            path: 'getorders',
            element: <AdminOrders showNewOrderButton />,
          },
          {
            path: 'orders/new',
            element: <AdminOrders todayOnly />,
          },
          {
            path: 'orders/delivery',
            element: <AdminOrders allowedStatuses={["Delivered", "Completed"]} />,
          },
          {
            path: 'orders/cancelled',
            element: <AdminOrders allowedStatuses={["Cancelled"]} />,
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

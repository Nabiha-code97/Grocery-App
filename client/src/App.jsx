import React, { useEffect } from 'react'
import NavBar from './components/NavBar'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import {Toaster, useToasterStore, toast} from "react-hot-toast"
import Footer from "./components/Footer"
import Login from "./components/Login"
import AllProducts from "./pages/AllProducts";
import { useAppContext } from './context/AppContext'
import ProductCategory from './pages/ProductCategory'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import AddAddress from './pages/AddAddress'
import MyOrders from './pages/MyOrders'
import Loader from './pages/Loader'
import Spinner from './components/Spinner'
import NotFound from './pages/NotFound'
import SellerLayout from './pages/seller/SellerLayout'
import AddProduct from './pages/seller/AddProduct'
import ProductList from './pages/seller/ProductList'
import Orders from './pages/seller/Orders'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import SellersList from './pages/admin/SellersList'
import CustomersList from './pages/admin/CustomersList'
import CustomerAnalytics from './pages/admin/CustomerAnalytics'
import SalesTrends from './pages/admin/SalesTrends'


const RequireRole = ({ allow, children, redirect = "/" }) => {
  const { user, role, authResolved, setShowUserLogin } = useAppContext();

  useEffect(() => {
    if (authResolved && !user) setShowUserLogin(true)
  }, [authResolved, user])

  if (!authResolved) return <Spinner />
  if (!user) return <Navigate to="/" replace />
  if (!allow.includes(role)) return <Navigate to={redirect} replace />
  return children
};

const TOAST_LIMIT = 1;

// Dismiss the oldest toasts so only TOAST_LIMIT stay on screen at once.
const useToastLimit = () => {
  const { toasts } = useToasterStore();

  useEffect(() => {
    toasts
      .filter(t => t.visible)
      .slice(TOAST_LIMIT)
      .forEach(t => toast.dismiss(t.id))
  }, [toasts])
};

const BlockSeller = ({ children }) => {
  const { isSeller } = useAppContext();
  if (isSeller) return <Navigate to="/seller" replace />
  return children
};

function App() {
  const pathname = useLocation().pathname;
  const hideChrome = pathname.startsWith("/seller") || pathname.startsWith("/admin");
  const {showUserLogin, isAdmin, adminResolved} = useAppContext();
  useToastLimit();
  return (
    <div className='text-default min-h-screen text-gray-700 bg-white'>
      {hideChrome ? null : <NavBar />}
      {showUserLogin ? <Login />: null}
      <Toaster />
      <div className={hideChrome ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}>
        <Routes>
          <Route path= "/" element={<Home/>}/>
          <Route path= "/products" element={<AllProducts/>}/>
          <Route path= "/products/:category" element={<ProductCategory/>}/>
          <Route path= "/products/:category/:id" element={<ProductDetails/>}/>
          <Route path= "/cart" element={<BlockSeller><Cart/></BlockSeller>}/>
          <Route path= "/add-address" element={<RequireRole allow={['user']}><AddAddress/></RequireRole>}/>
          <Route path= "/my-orders" element={<RequireRole allow={['user']}><MyOrders/></RequireRole>}/>
          <Route path= "/loader" element={<Loader/>}/>
          <Route path= "/seller" element={<RequireRole allow={['seller']}><SellerLayout /></RequireRole>}>
          <Route index element={<AddProduct />}/>
          <Route path='product-list' element={<ProductList/>} />
          <Route path='orders' element={<Orders/>} />
          </Route>
          <Route path= "/admin/login" element={<AdminLogin/>}/>
          <Route path= "/admin" element={adminResolved ? (isAdmin ? <AdminLayout /> : <Navigate to="/admin/login" replace/>) : <Spinner/>}>
          <Route index element={<SellersList/>}/>
          <Route path='customers' element={<CustomersList/>} />
          <Route path='analytics' element={<CustomerAnalytics/>} />
          <Route path='sales-trends' element={<SalesTrends/>} />
          </Route>
          <Route path= "*" element={<NotFound/>}/>

        </Routes>
      </div>
        {!hideChrome && <Footer />}
    </div>
  )
}

export default App

import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios"

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL

const savedAdminToken = localStorage.getItem('adminToken')
if (savedAdminToken) {
  axios.defaults.headers.common['admin-token'] = savedAdminToken
}

const savedUserToken = localStorage.getItem('userToken')
if (savedUserToken) {
  axios.defaults.headers.common['user-token'] = savedUserToken
}
export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {

  const currency = import.meta.env.VITE_CURRENCY;

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);
  const [adminResolved, setAdminResolved] = useState(false);
  const role = user?.role ?? null;
  const isSeller = role === 'seller';
  const isCustomer = role === 'user';
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch All Products from backend
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/product/list')
      if (data.success) {
        setProducts(data.products)
      } else {
        setProducts([])
        toast.error(data.message)
      }
    } catch (error) {
      setProducts([])
    }
  }

  // Check user auth on load (restore session after page refresh)
  const fetchUser = async () => {
    try {
      const { data } = await axios.get('/api/user/is-auth')
      if (data.success) {
        setUser(data.user)
        setCartItems(data.user.cartItem || {})
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setAuthResolved(true)
    }
  }

  // Check admin auth on load
  const fetchAdmin = async () => {
    try {
      const { data } = await axios.get('/api/admin/is-auth')
      setIsAdmin(!!data.success)
    } catch (error) {
      setIsAdmin(false)
    } finally {
      setAdminResolved(true)
    }
  }

  const logout = async () => {
    try {
      await axios.get('/api/user/logout')
    } catch (error) {
      // session is being discarded either way
    }
    localStorage.removeItem('userToken')
    delete axios.defaults.headers.common['user-token']
    setUser(null)
    setCartItems({})
    navigate('/')
    toast.success('Logged out successfully')
  }

  // Sync cart to backend whenever cartItems changes (customers only)
  useEffect(() => {
    if (!authResolved || role !== 'user') return
    axios.post('/api/cart/update', { cartItems }).catch(() => {})
  }, [cartItems, role, authResolved])

  //Add to cart
  const addToCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success("Added to Cart")
  }

  //update cart item quantity
  const updateCartItem = (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData)
    toast.success("Cart Updated")
  }

  // Remove Product from Cart
  const removeFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }
    }
    toast.success("Removed from Cart")
    setCartItems(cartData)
  }

  useEffect(() => {
    fetchProducts()
    fetchUser()
    fetchAdmin()
  }, [])

  // Get Cart Item Count
  const getCartCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      totalCount += cartItems[item];
    }
    return totalCount;
  }

  // Get Cart Total Amount
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      if (itemInfo && cartItems[items] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[items];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  }

  const value = {
    user,
    setUser,
    fetchUser,
    role,
    isSeller,
    isCustomer,
    isAdmin,
    setIsAdmin,
    authResolved,
    adminResolved,
    logout,
    navigate,
    showUserLogin,
    setShowUserLogin,
    products,
    fetchProducts,
    currency,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartItems,
    setCartItems,
    searchQuery,
    setSearchQuery,
    getCartCount,
    getCartAmount,
    axios
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};

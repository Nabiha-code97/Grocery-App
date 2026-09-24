import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const NavBar = () => {
  const [open, setOpen] = React.useState(false);

  const { user, isSeller, isCustomer, setShowUserLogin, navigate, searchQuery, setSearchQuery, getCartCount, logout } = useAppContext();

  useEffect(()=>{
    if(searchQuery.length > 0){
      navigate("/products")
    }
  },[searchQuery])

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">
      <NavLink to={"/"} onClick={()=>{ setOpen(false); setSearchQuery(""); }} >
        <img className="h-9" src={assets.logo} alt="Greencart_Logo" />
      </NavLink>

      {/* Desktop Menu */}
      <div className="hidden sm:flex items-center gap-8">
        {isSeller && (
          <button onClick={() => navigate("/seller")} className="cursor-pointer px-5 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition">
            Seller Dashboard
          </button>
        )}
        <NavLink to={"/"} onClick={() => setSearchQuery("")}>Home</NavLink>
        <NavLink to={"/products"}>All Products</NavLink>

        <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
          <input
            value={searchQuery}
            onChange={(e)=>setSearchQuery(e.target.value)}
            className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
            type="text"
            placeholder="Search products"
          />
          <img src={assets.search_icon} alt="search_icon" className="w-4 h-4 cursor-pointer" onClick={() => navigate("/products")} />
        </div>

        {!isSeller && (
          <div onClick={()=> navigate("/cart")} className="relative cursor-pointer">
            <img src={assets.nav_cart_icon} alt="nav_cart_icon" className="w-6 opacity-80" />
            <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">
              {getCartCount()}
            </button>
          </div>
        )}

        {!user ? (
          <button
            onClick={() => setShowUserLogin(true)}
            className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full"
          >
            Login
          </button>
        ) : (
          <div className="relative group">
            <img src={assets.profile_icon} className="w-10" alt="Profile icon" />
            <ul className='hidden group-hover:block absolute top-10 right-0 bg-white shadow border border-gray-200 py-2.5 w-30 rounded-md text-sm z-40'>
                {isCustomer && (
                <li onClick={() => navigate("/my-orders")} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'>
                     My Orders
                </li>
                )}
                {isSeller && (
                <li onClick={() => navigate("/seller")} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'>
                     Dashboard
                </li>
                )}
                <li onClick={logout} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'>
                     Logout
                </li>
            </ul>
          </div>
        )}
      </div>

<div className="flex items-center gap-6 sm:hidden">
  {!isSeller && (
  <div onClick={()=> navigate("/cart")} className="relative cursor-pointer">
          <img src={assets.nav_cart_icon} alt="nav_cart_icon" className="w-6 opacity-80" />
          <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">
            {getCartCount()}
          </button>
        </div>
  )}
<button onClick={() => setOpen(!open)} aria-label="Menu" className="">
        <img src={assets.menu_icon} alt="menu_icon" />
      </button>
</div>
      

      {/* Mobile Menu */}
      {open && (
        <div className="absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex flex-col items-start gap-2 px-5 text-sm md:hidden z-50">
          <NavLink to={"/"} onClick={() => { setOpen(false); setSearchQuery(""); }}>Home</NavLink>
          <NavLink to={"/products"} onClick={() => setOpen(false)}>All Products</NavLink>
          {isCustomer && <NavLink to={"/my-orders"} onClick={() => setOpen(false)}>My Orders</NavLink>}
          {isSeller && (
            <button onClick={() => { setOpen(false); navigate("/seller"); }} className="cursor-pointer text-left">
              Seller Dashboard
            </button>
          )}

          {!user ? (
            <button
              onClick={() => { setOpen(false); setShowUserLogin(true); }}
              className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm"
            >
              Login
            </button>
          ) : (
            <button
              onClick={logout}
              className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
import React from 'react'
import NavBar from './components/NavBar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import {Toaster} from "react-hot-toast"
import Footer from "./components/Footer"
import Login from "./components/Login"
import { useAppContext } from './context/AppContext'


function App() {
  const isSellerPath = useLocation().pathname.includes("seller");
  const {showUserLogin} = useAppContext();
  return (
    <div>
      {isSellerPath ? null : <NavBar />} 
      {showUserLogin ? <Login />: null}
      <Toaster />
      <div className={isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}>
      {/* <div className="py-6 px-6 md:px-16 lg:px-24 xl:px-32"> */}
        <Routes>
          <Route path= "/" element={<Home/>}/>
        </Routes>
      </div>
        {!isSellerPath && <Footer />}
    </div>
  )
}

export default App

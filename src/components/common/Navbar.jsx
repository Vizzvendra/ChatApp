import React, { useRef } from 'react'

import logo from "../../assets/Logo/Logo-Full-Light.png"
import { Link, matchPath,useNavigate } from 'react-router-dom'
import {NavbarLinks} from "../../data/navbar-links"
import useOnClickOutside from "../../hooks/useOnClickOutside"

import { useLocation } from 'react-router-dom' //for current path (location.pathname)
import { useSelector,useDispatch } from 'react-redux'
import ProfileDropDown from '../core/Auth/ProfileDropDown'
import { useState } from 'react'
import { logout } from "../../services/operations/authAPI"
import { FaBars, FaTimes } from "react-icons/fa"; 


const Navbar = () => {
    console.log("Printing base url: ",process.env.REACT_APP_BASE_URL);
    const {token} = useSelector( (state) => state.auth );



    const location = useLocation();
    const dispatch = useDispatch()
    const navigate = useNavigate()

    // it will return true if current route is equal to the recevied route
    const matchRoute = (route) => {
        return matchPath({path:route}, location.pathname);
    }

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    
    const ref = useRef(null)
    useOnClickOutside(ref, () => toggleMenu())





  return (
    <div className={`navbarHere flex h-16 items-center justify-center border-b-[1px] border-b-richblack-700
    ${ location.pathname === "/about" ? "bg-richblack-700" : "" } transition-all duration-200`}>

        <div className='flex w-11/12 max-w-maxContent items-center justify-between'>

            <Link className="" to="/">
                <img src={logo} width={160} height={42} loading='lazy'/>
            </Link>

  

            {/* Nav Links */}
            <nav className="hidden sm:block">
                <ul className='flex gap-x-6 text-richblack-25'>
                {
                    NavbarLinks.map( (link, index) => (
                            <li key={index}>
                                {
                                    <Link to={link?.path}>
                                        {/* makes the selected navbar link as yellow and other as white */}
                                        <p className={`${ matchRoute(link?.path) ? "text-yellow-25" : "text-richblack-25"}`}>
                                            {link.title}
                                        </p>
                                    </Link>
                                }
                            </li>
                        ) 
                    )
                }
                </ul>
            </nav>


            <div className='hidden sm:flex items-center gap-x-4 mx-auto sm:mx-0'>

                {
                    token === null && (
                        <Link to="/login">
                            <button className='border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 rounded-md'>
                                Log in
                            </button>
                        </Link>
                    )
                }
                {
                    token === null && (
                        <Link to="/signup">
                            <button  className='border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 rounded-md'>
                                Sign Up
                            </button>
                        </Link>
                    )
                }
                {
                    token !== null && <ProfileDropDown />
                }
                
            </div>

            <div className="sm:hidden ml-auto ">
                <button onClick={toggleMenu} className="text-white">
                    {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
            </div>

            {/* Hamburger Menu */}
            { isMenuOpen && (
                <div ref={ref} className="absolute top-14 right-1 w-[150px] bg-richblack-800 p-6 shadow-lg rounded-lg sm:hidden z-50 transition-transform transform translate-x-0">
                    <ul className="flex flex-col  gap-y-4">
                        {
                            NavbarLinks.map((link, index) => (
                                
                                <li key={index}>
                                    <Link to={link.path} onClick={toggleMenu}>
                                        <p
                                        className={`${
                                            matchRoute(link?.path)
                                            ? "text-yellow-25"
                                            : "text-richblack-25"
                                        }`}
                                        >
                                        {link.title}
                                        </p>
                                    </Link>
                                </li>
                                )
                            )
                        }
                        {
                            token === null ? (
                                <>
                                    <li>
                                        <Link to="/login" onClick={toggleMenu}>
                                            <p
                                                className={`${
                                                    matchRoute("/login")
                                                    ? "text-yellow-25"
                                                    : "text-richblack-25"
                                                }`}
                                            >
                                                Login
                                            </p>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/signup" onClick={toggleMenu}>
                                            <p
                                                className={`${
                                                    matchRoute("/signup")
                                                    ? "text-yellow-25"
                                                    : "text-richblack-25"
                                                }`}
                                            >
                                                Sign Up
                                            </p>
                                        </Link>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <Link to="/dashboard/my-profile" onClick={toggleMenu}>
                                            <p
                                                className={`flex items-center gap-x-2 ${
                                                    matchRoute("/dashboard/my-profile")
                                                    ? "text-yellow-25"
                                                    : "text-richblack-25"
                                                }`}
                                            >
                                                Dashboard
                                            </p>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/dashboard/chat" onClick={toggleMenu}>
                                            <p
                                                className={`flex items-center gap-x-2 ${
                                                    matchRoute("/dashboard/Chat")
                                                    ? "text-yellow-25"
                                                    : "text-richblack-25"
                                                }`}
                                            >
                                                Chat
                                            </p>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/documents" onClick={toggleMenu}>
                                            <p
                                                className={`flex items-center gap-x-2 ${
                                                    matchRoute("/documents")
                                                    ? "text-yellow-25"
                                                    : "text-richblack-25"
                                                }`}
                                            >
                                                Document
                                            </p>
                                        </Link>
                                    </li>
                                    
                                    <li>
                                        <div
                                            onClick={() => {
                                                toggleMenu();
                                                dispatch(logout(navigate))
                                            }}
                                            
                                            className='flex items-center gap-x-2 text-richblack-25'
                                        >
                                            Logout
                                        </div>
                                    </li>
                                </>
                            )
                        }
                    </ul>
                </div>
            )}

        </div>
    </div>
  )
}

export default Navbar

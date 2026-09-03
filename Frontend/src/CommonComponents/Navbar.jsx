import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../PrivateRouter/AuthContext";
import { isAdminRole } from "../PrivateRouter/roleUtils";
import {
  FiChevronDown,
  FiMenu,
  FiX,
  FiLogOut,
  FiArrowRight,
  FiHeart,
  FiShoppingCart,
  FiUser,
  FiMapPin,
  FiClock,
  FiPhone,
  FiSearch,
  FiFacebook,
  FiInstagram,
} from "react-icons/fi";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import api from "../api";
import {
  FaCode,
  FaLaptopCode,
  FaPaintBrush,
  FaSearch,
  FaMobileAlt,
  FaUsersCog,
  FaShoppingCart,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBullhorn,
} from "react-icons/fa";
import PageContainer from "./PageContainer";

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mobileSubMenu, setMobileSubMenu] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [services, setServices] = useState([]);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [favoritesDropdown, setFavoritesDropdown] = useState(false);
  const [cartDropdown, setCartDropdown] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, userProfile, role } = useAuth();

  const isLoggedIn = Boolean(user || userProfile);
  const userDisplayName = userProfile?.displayName || userProfile?.name || user?.displayName || user?.name || user?.username || "User";
  const userInitial = userDisplayName.charAt(0).toUpperCase();

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    setProfileDropdown(false);
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await api.get("/services/public/all");
        if (data.success && Array.isArray(data.data)) {
          setServices(data.data);
        }
      } catch (err) {
        console.warn("Failed to fetch services for navbar:", err?.message);
      }
    };

    fetchServices();
  }, []);

  const whoWeAreLinks = [
    { id: 1, title: "Why Choose Us", path: "/whychooseus" },
    { id: 2, title: "Who We Work With", path: "/whoweworkwith" },
    { id: 3, title: "What We Do", path: "/whatwedo" },
  ];

  const iconMap = {
    FaCode,
    FaLaptopCode,
    FaPaintBrush,
    FaSearch,
    FaMobileAlt,
    FaUsersCog,
    FaShoppingCart,
    FaUserGraduate,
    FaChalkboardTeacher,
    FaBullhorn,
  };

  useEffect(() => {
    setOpenMenu(null);
    setMobileSubMenu(null);
    setMobileMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdown(false);
        setFavoritesDropdown(false);
        setCartDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (menu) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  const isServicesActive =
    location.pathname === "/services" || location.pathname.startsWith("/services/");

  const isWhoWeAreActive =
    whoWeAreLinks.some(
      (link) => location.pathname === link.path || location.pathname.startsWith(link.path + "/")
    ) || location.pathname === "/achievements";

  const desktopLinkClass = ({ isActive }) =>
    `text-base font-semibold  transition-colors ${isActive ? "text-primary" : "text-white hover:text-primary"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center justify-between rounded-xl px-3 py-3 text-base font-medium transition ${isActive ? "bg-primary/10 text-primary" : "text-white/80 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full">
        <div className="bg-[#0d0d0d] text-white">
          <PageContainer>
            <div className="flex h-[42px] items-center justify-between text-[11px] font-medium tracking-wide text-[#f3f3f3]">
              <div className="flex items-center gap-5">
                <span className="flex items-center gap-2">
                  <FiMapPin className="text-[#d79d4a]" />
                  123, MG Road, Coimbatore, Tamil Nadu
                </span>
                <span className="hidden items-center gap-2 sm:flex">
                  <FiClock className="text-[#d79d4a]" />
                  Mon - Sun: 9:00 AM - 9:00 PM
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2">
                  <FiPhone className="text-[#d79d4a]" />
                  +91 98765 43210
                </span>
                <div className="flex items-center gap-2">
                  <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-[13px] text-white transition hover:bg-white/10" aria-label="Facebook">
                    <FiFacebook />
                  </button>
                  <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-[13px] text-white transition hover:bg-white/10" aria-label="Instagram">
                    <FiInstagram />
                  </button>
                </div>
              </div>
            </div>
          </PageContainer>
        </div>

        <div className="border-b border-[#d79d4a]/40 bg-white shadow-[0_4px_18px_rgba(0,0,0,0.08)]">
          <PageContainer>
            <div className="flex h-[88px] items-center justify-between gap-4 bg-white">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-14 w-14 bg-white items-center justify-center overflow-hidden rounded-xl border border-[#d79d4a]/50  shadow-inner">
                  <img
                    src="/images/logo.png"
                    alt="Q Frame logo"
                    className="h-full bg-white w-full object-contain"
                  />
                </div>
                <div className="leading-none">
                  <div className="text-[26px] font-black tracking-[-0.06em] text-[#1c1c1c]">Frame</div>
                  <div className="mt-1 text-[9px] font-semibold tracking-[0.28em] text-[#6a5a49]">PHOTO STUDIO &amp; FRAME SHOP</div>
                </div>
              </Link>

              <nav className="hidden items-center gap-7 xl:flex">
                <NavLink to="/" className={({ isActive }) => `text-sm font-semibold transition ${isActive ? "text-[#d79d4a]" : "text-[#1d1d1d] hover:text-[#d79d4a]"}`}>
                  Home
                </NavLink>
                <div className="flex items-center gap-1 text-sm font-semibold text-[#1d1d1d]">
                  <NavLink to="/shop" className="hover:text-[#d79d4a]">Shop</NavLink>
               
                </div>
               
                <div className="flex items-center gap-1 text-sm font-semibold text-[#1d1d1d]">
                  <NavLink to="/frames" className="hover:text-[#d79d4a]">Frames</NavLink>
                 
                </div>
                <NavLink to="/custom-frame" className={({ isActive }) => `text-sm font-semibold transition ${isActive ? "text-[#d79d4a]" : "text-[#1d1d1d] hover:text-[#d79d4a]"}`}>
                  Custom Frame
                </NavLink>
               
                <NavLink to="/gifts" className={({ isActive }) => `text-sm font-semibold transition ${isActive ? "text-[#d79d4a]" : "text-[#1d1d1d] hover:text-[#d79d4a]"}`}>
                  Gifts
                </NavLink>
                <NavLink to="/gallery" className={({ isActive }) => `text-sm font-semibold transition ${isActive ? "text-[#d79d4a]" : "text-[#1d1d1d] hover:text-[#d79d4a]"}`}>
                  Gallery
                </NavLink>
                <NavLink to="/about" className={({ isActive }) => `text-sm font-semibold transition ${isActive ? "text-[#d79d4a]" : "text-[#1d1d1d] hover:text-[#d79d4a]"}`}>
                  About Us
                </NavLink>
                <NavLink to="/contact" className={({ isActive }) => `text-sm font-semibold transition ${isActive ? "text-[#d79d4a]" : "text-[#1d1d1d] hover:text-[#d79d4a]"}`}>
                  Contact Us
                </NavLink>
              </nav>

              <div className="flex items-center gap-3">
                <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d79d4a]/30 bg-[#f2eadb] text-[#1d1d1d] transition hover:border-[#d79d4a] hover:bg-[#f8f1e6]" aria-label="Search">
                  <FiSearch className="text-lg" />
                </button>

                <button type="button" className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#d79d4a]/30 bg-[#f2eadb] text-[#1d1d1d] transition hover:border-[#d79d4a] hover:bg-[#f8f1e6]" aria-label="Favorites">
                  <FiHeart className="text-lg" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#d79d4a] text-[10px] font-bold text-[#111]">3</span>
                </button>

                <button type="button" className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#d79d4a]/30 bg-[#f2eadb] text-[#1d1d1d] transition hover:border-[#d79d4a] hover:bg-[#f8f1e6]" aria-label="Cart">
                  <FiShoppingCart className="text-lg" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#d79d4a] text-[10px] font-bold text-[#111]">2</span>
                </button>

                {isLoggedIn ? (
                  <div ref={profileRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setProfileDropdown((prev) => !prev)}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1b1a18] text-sm font-bold text-white shadow-[0_8px_18px_rgba(0,0,0,0.12)] transition hover:bg-[#2a2623]"
                      aria-label="Open profile menu"
                    >
                      {userInitial}
                    </button>

                    {profileDropdown && (
                      <div className="absolute right-0 top-[calc(100%+12px)] w-64 overflow-hidden rounded-2xl border border-[#ede5da] bg-white shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
                        <div className="border-b border-[#f0e8df] bg-[#faf6f2] px-4 py-3">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b8b8b]">Profile</div>
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1b1a18] text-sm font-bold text-white">
                              {userInitial}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-[#1d1d1d]">{userDisplayName}</div>
                              <div className="text-[11px] text-[#777]">{user?.email || "premium customer"}</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-2">
                          {isAdminRole(role) && (
                            <button
                              type="button"
                              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#1d1d1d] transition hover:bg-[#f7f3ee]"
                              onClick={() => {
                                setProfileDropdown(false);
                                navigate("/admin");
                              }}
                            >
                              <span>Admin Panel</span>
                              <FiUser className="text-base text-[#7a7a7a]" />
                            </button>
                          )}

                          <button
                            type="button"
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#1d1d1d] transition hover:bg-[#f7f3ee]"
                            onClick={() => setProfileDropdown(false)}
                          >
                            <span>My Account</span>
                            <FiUser className="text-base text-[#7a7a7a]" />
                          </button>

                          <button
                            type="button"
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#1d1d1d] transition hover:bg-[#f7f3ee]"
                            onClick={() => setProfileDropdown(false)}
                          >
                            <span>My Order</span>
                            <FiShoppingCart className="text-base text-[#7a7a7a]" />
                          </button>

                          <button
                            type="button"
                            onClick={handleConfirmLogout}
                            className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#d94d4d] transition hover:bg-[#fff1f1]"
                          >
                            <span>Logout</span>
                            <FiLogOut className="text-base" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/login" className="rounded-xl bg-[#1b1a18] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(0,0,0,0.12)] transition hover:bg-[#2a2623]">
                    Login
                  </Link>
                )}
              </div>
            </div>
          </PageContainer>
        </div>
      </header>

      <div className="h-[130px]" />
    </>
  );
};

export default Navbar;

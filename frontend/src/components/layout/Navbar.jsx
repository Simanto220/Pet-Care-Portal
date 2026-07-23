import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {
  Heart,
  Menu,
  X,
  Search,
  User,
  Settings,
  LogOut,
  Home,
  Users,
  Stethoscope,
  ShoppingCart,
  MessageCircle,
  PlusCircle,
  ChevronDown,
  Shield,
  Calendar,
} from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = ({
  isAuthenticated = false,
  userRole = "user",
  userName = "John Doe",
  userAvatar = "https://via.placeholder.com/40", // Default placeholder
  cartCount = 3,
  onLogout,
  onSearch,
  currentPage = "home",
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);

  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    if (onLogout) {
      onLogout();
    }
    navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setIsUserMenuOpen(false);
      setActiveDropdown(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const getHomePath = () => {
    return isAuthenticated ? "/dashboard" : "/";
  };

  const getNavigationItems = () => {
    const baseItems = [];

    if (isAuthenticated) {
      baseItems.push({
        name: "Home",
        to: "/dashboard",
        icon: Home,
        key: "home",
      });
      baseItems.push({
        name: "My Pets",
        to: "/pets",
        icon: Heart, // Using Heart icon for pets, can be changed
        key: "pets",
      });
      baseItems.push({
        name: "Shop",
        to: "/shop",
        icon: ShoppingCart,
        key: "shop",
      });
      if (userRole !== "vet") {
        baseItems.push({
          name: "Services",
          to: "/care",
          icon: Users, // Added icon
          key: "care", // Added key
        });
        baseItems.push({
          name: "My Bookings",
          to: "/bookings",
          icon: Calendar,
          key: "bookings",
        });
      }
    }

    if (userRole === "vet") {
      // Insert "Vet Portal" after "Home" and "Care & Services" but before "Shop"
      const insertIndex = isAuthenticated ? 2 : 0; // Adjust based on authentication
      baseItems.splice(insertIndex, 0, {
        name: "Vet Portal",
        to: "/vet",
        icon: Stethoscope,
        key: "vet",
        dropdown: [
          { name: "My Patients", to: "/vet/patients" },
          { name: "Appointments", to: "/vet/appointments" },
          { name: "Medical Records", to: "/vet/records" },
          { name: "Reminders", to: "/vet/reminders" },
        ],
      });
    }

    if (userRole === "admin") {
      baseItems.push({
        name: "Admin",
        to: "/admin",
        icon: Shield,
        key: "admin",
        dropdown: [
          { name: "Dashboard", to: "/admin/dashboard" },
          { name: "Users", to: "/admin/users" },
          { name: "Reports", to: "/admin/reports" },
          { name: "Settings", to: "/admin/settings" },
        ],
      });
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const DropdownMenu = ({ items, isOpen }) => (
    <div
      className={`absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 transform transition-all duration-200 ${
        isOpen
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 pointer-events-none"
      }`}
    >
      {items.map((item, index) => (
        <Link
          key={index}
          to={item.to}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition-colors cursor-pointer"
        >
          {item.name}
        </Link>
      ))}
    </div>
  );

  const UserMenu = () => (
    <div
      className={`absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 transform transition-all duration-200 ${
        isUserMenuOpen
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <img
            src={
              userAvatar.startsWith("/uploads")
                ? `http://localhost:7000${userAvatar}`
                : userAvatar
            }
            alt={userName}
            className="w-10 h-10 rounded-full"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/40"; // Fallback on error
            }}
          />
          <div>
            <p className="font-semibold text-gray-800">{userName}</p>
            <p className="text-sm text-gray-500 capitalize">
              {userRole} Account
            </p>
          </div>
        </div>
      </div>

      <div className="py-2">
        <Link
          to="/profile"
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition-colors cursor-pointer"
        >
          <User className="h-4 w-4 mr-3" />
          My Profile
        </Link>
        {userRole === "vet" ? (
          <Link
            to="/vet"
            className="flex items-center px-4 py-2 text-sm text-purple-700 font-bold hover:bg-purple-50 transition-colors cursor-pointer"
          >
            <Stethoscope className="h-4 w-4 mr-3 text-purple-600" />
            Vet Portal
          </Link>
        ) : (
          <>
            <Link
              to="/purchase-history"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition-colors cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4 mr-3" />
              Purchase History
            </Link>
            <Link
              to="/bookings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition-colors cursor-pointer"
            >
              <Calendar className="h-4 w-4 mr-3" />
              My Bookings
            </Link>
          </>
        )}
      
    
        <div className="border-t border-gray-100 mt-2 pt-2">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
            : "bg-white/80 backdrop-blur-sm"
        }`}
      >
        <div className="mr-2 px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex">
              <Link
                to={getHomePath()}
                className="flex items-center group cursor-pointer"
              >
                <Heart className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  PetCare
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <div
                  key={item.key}
                  className={`relative ${item.key === "home" ? "ml-4" : ""}`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.dropdown) {
                        setActiveDropdown(
                          activeDropdown === item.key ? null : item.key
                        );
                      } else {
                        navigate(item.to); // Navigate directly if no dropdown
                      }
                    }}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                      currentPage === item.key
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-purple-600"
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                    {item.dropdown && <ChevronDown className="h-4 w-4 ml-1" />}
                  </button>

                  {item.dropdown && (
                    <DropdownMenu
                      items={item.dropdown}
                      isOpen={activeDropdown === item.key}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {/* Quick Actions */}
                  <Link
                    to="/create-post"
                    className="hidden md:flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium hover:scale-105 transform transition-all cursor-pointer"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Post Pet
                  </Link>

                  {/* Notifications */}
                  <NotificationDropdown />

                  {/* Shopping Cart */}
                  <div className="relative">
                    <button
                      onClick={() => navigate("/shop/cart")}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {cartCount > 9 ? "9+" : cartCount}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsUserMenuOpen(!isUserMenuOpen);
                      }}
                      className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <img
                        src={
                          userAvatar.startsWith("/uploads")
                            ? `http://localhost:7000${userAvatar}`
                            : userAvatar
                        }
                        alt={userName}
                        className="w-8 h-8 rounded-full border-2 border-gray-200"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/40"; // Fallback on error
                        }}
                      />
                      <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
                    </button>
                    <UserMenu />
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/signin"
                    className="text-gray-700 hover:text-purple-600 font-medium transition-colors cursor-pointer"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-medium hover:scale-105 transform transition-all shadow-lg cursor-pointer"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`lg:hidden transition-all duration-300 overflow-hidden ${
              isMobileMenuOpen ? "max-h-screen pb-4" : "max-h-0"
            }`}
          >
            {/* Mobile Search */}
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search pets, services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Mobile Navigation Items */}
            <div className="px-4 py-2 space-y-1">
              {navigationItems.map((item) => (
                <div key={item.key}>
                  <Link
                    to={item.to}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      currentPage === item.key
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </Link>
                  {/* Mobile Dropdown Items */}
                  {item.dropdown && (
                    <div className="ml-7 mt-1 space-y-1">
                      {item.dropdown.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.to}
                          className="block px-3 py-1 text-sm text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile User Section */}
            {isAuthenticated && (
              <div className="px-4 py-3 border-t border-gray-100">
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={
                      userAvatar.startsWith("/uploads")
                        ? `http://localhost:7000${userAvatar}`
                        : userAvatar
                    }
                    alt={userName}
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/40"; // Fallback on error
                    }}
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{userName}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {userRole} Account
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    <User className="h-4 w-4 mr-3" />
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;

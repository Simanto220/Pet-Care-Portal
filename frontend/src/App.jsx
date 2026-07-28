import React, { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage/LandingPage";
import SignInPage from "./pages/Auth/Login";
import SignUpPage from "./pages/Auth/SignUp";
import Dashboard from "./pages/Dashboard/Home";
import Favorites from "./pages/Dashboard/Favorites";
import Navbar from "./components/layout/Navbar";
import Profile from "./pages/Profile";
import PetProfile from "./pages/Pet/PetProfile";
import PetManagement from "./pages/PetManagement";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { signOut, onAuthStateChanged, auth } from "./firebase";
import About from "./pages/About/About";
import CarePage from "./pages/CarePage";
import ShopPage from "./pages/ShopPage";
import CartPage from "./pages/Shop/CartPage";
import PaymentPage from "./pages/Shop/PaymentPage";
import Adopt from "./pages/Adopt/adopt.jsx";
import Browse from "./pages/Adopt/browse.jsx";
import Homes from "./pages/Adopt/homes.jsx";
import Post from "./pages/Adopt/post";
import Requests from "./pages/Adopt/requests.jsx";
import NewAdoptionPostPage from "./pages/Adopt/NewAdoptionPostPage.jsx"; // Import NewAdoptionPostPage
import { shopApi } from "./lib/api";
import PurchaseHistory from "./pages/PurchaseHistory";
import ServiceDetails from "./pages/ServiceDetails";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BookingsHistory from "./pages/BookingsHistory";
import VetPortal from "./pages/VetPortal";
import AdminDashboard from "./pages/AdminDashboard";

// ProtectedRoute component
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

const AppContent = ({ user, setUser, handleLogout }) => {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        setCartCount(0);
        return;
      }
      try {
        const c = await shopApi.getCart();
        setCartCount(c?.items?.reduce((s, i) => s + i.quantity, 0) || 0);
      } catch {
        setCartCount(0);
      }
    };
    loadCart();
  }, [user, location.pathname]);

  useEffect(() => {
    const onCartUpdated = () => {
      if (!user) return;
      shopApi
        .getCart()
        .then((c) => {
          setCartCount(c?.items?.reduce((s, i) => s + i.quantity, 0) || 0);
        })
        .catch(() => {});
    };
    window.addEventListener("cart:updated", onCartUpdated);
    return () => window.removeEventListener("cart:updated", onCartUpdated);
  }, [user]);

  const getNavbarProps = () => {
    if (user) {
      return {
        isAuthenticated: true,
        userName: user.displayName || user.email || "User",
        userAvatar:
          user.photoURL ||
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
        userRole: user.role || "user",
        cartCount,
        notificationCount: 5,
        onLogout: handleLogout,
        currentPage: getCurrentPage(location.pathname),
      };
    } else {
      return {
        isAuthenticated: false,
        onLogout: handleLogout,
        currentPage: getCurrentPage(location.pathname),
      };
    }
  };

  const getCurrentPage = (pathname) => {
    if (pathname === "/dashboard") return "home";
    if (pathname === "/favorites") return "favorites";
    if (pathname.startsWith("/adopt")) return "adopt";
    if (pathname.startsWith("/care")) return "care";
    if (pathname.startsWith("/shop")) return "shop";
    if (pathname.startsWith("/pets")) return "pets";
    if (pathname.startsWith("/bookings")) return "bookings";
    if (pathname.startsWith("/vet")) return "vet";
    if (pathname.startsWith("/admin")) return "admin";
    return "";
  };

  return (
    <>
      <Navbar {...getNavbarProps()} />
      <div className="pt-20">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignInPage onSignIn={setUser} />} />
          <Route path="/signup" element={<SignUpPage onSignUp={setUser} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute user={user}>
              <Favorites user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route path="/about" element={<About />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pet/:id"
          element={
            <ProtectedRoute user={user}>
              <PetProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pets"
          element={
            <ProtectedRoute user={user}>
              <PetManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-history"
          element={
            <ProtectedRoute user={user}>
              <PurchaseHistory />
            </ProtectedRoute>
          }
        />
        {/* Routes for navigation items */}
        <Route
          path="/care"
          element={
            // <ProtectedRoute user={user}>
            //   <CarePage />
            // </ProtectedRoute>
            <CarePage />
          }
        />
        <Route path="/care/services/:id" element={<ServiceDetails />} />
        <Route
          path="/shop"
          element={
            <ProtectedRoute user={user}>
              <ShopPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop/cart"
          element={
            <ProtectedRoute user={user}>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop/payment"
          element={
            <ProtectedRoute user={user}>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adopt"
          element={
            <ProtectedRoute user={user}>
              <Adopt />
            </ProtectedRoute>
          }
        />
        <Route path="/adopt/browse" element={<Browse />} />{" "}
        <Route path="/adopt/homes" element={<Homes />} />
        <Route path="/adopt/post" element={<Post />} />
        <Route path="/adopt/requests" element={<Requests />} />
        <Route path="/my-posts" element={<Navigate to="/adopt/post" replace />} />
        <Route
          path="/create-post"
          element={
            <ProtectedRoute user={user}>
              <NewAdoptionPostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vet"
          element={
            <ProtectedRoute user={user}>
              <VetPortal />
            </ProtectedRoute>
          }
        />
        <Route path="/vet/patients" element={<VetPortal />} />
        <Route path="/vet/appointments" element={<VetPortal />} />
        <Route path="/vet/records" element={<VetPortal />} />
        <Route path="/vet/reminders" element={<VetPortal />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/bookings" element={<BookingsHistory />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminDashboard />} />
        <Route path="/admin/reports" element={<AdminDashboard />} />
        <Route path="/admin/settings" element={<AdminDashboard />} />
      </Routes>
      </div>
    </>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setLoading(false);
        return;
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && !storedUser) {
        setUser(firebaseUser);
      } else if (!storedUser) {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (auth.currentUser) {
        await signOut(auth);
      }
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <AppContent user={user} setUser={setUser} handleLogout={handleLogout} />
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
};

export default App;

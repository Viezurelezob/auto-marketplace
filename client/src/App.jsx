import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import { CompareProvider } from './context/CompareContext.jsx';
import CompareBar from './components/CompareBar.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';

import Home from './pages/Home.jsx';
import Listings from './pages/Listings.jsx';
import CarDetail from './pages/CarDetail.jsx';
import PostListing from './pages/PostListing.jsx';
import EditListing from './pages/EditListing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Pricing from './pages/Pricing.jsx';
import MyListings from './pages/MyListings.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Favorites from './pages/Favorites.jsx';
import Profile from './pages/Profile.jsx';
import SellerPage from './pages/SellerPage.jsx';
import Messages from './pages/Messages.jsx';
import Conversation from './pages/Conversation.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import PaymentCancel from './pages/PaymentCancel.jsx';
import MapPage from './pages/MapPage.jsx';
import ComparePage from './pages/ComparePage.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
        <CompareProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/listings/:id" element={<CarDetail />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />
              <Route path="/sellers/:id" element={<SellerPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/compare" element={<ComparePage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/post" element={<PostListing />} />
                <Route path="/listings/:id/edit" element={<EditListing />} />
                <Route path="/my-listings" element={<MyListings />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/messages/:id" element={<Conversation />} />
              </Route>

              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <CompareBar />
          <Footer />
        </div>
        </CompareProvider>
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

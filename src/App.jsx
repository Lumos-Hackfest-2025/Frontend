import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/LandingPage";
import Register from "./pages/registration/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Catalog from "./pages/Catalog";
import CatalogDetail from "./pages/CatalogDetail";
import LandingPage from "./pages/LandingPage";
import BuyerType from "./pages/registration/BuyerType";
import SellerRegistration from "./pages/registration/SellerRegistration";
import BuyerLargeRegistration from "./pages/registration/BuyerLargeRegistration";
import BuyerSmallRegistration from "./pages/registration/BuyerSmallRegistration";
import SellerProduct from "./pages/SellerProduct";
import SellerDashboard from "./pages/SellerDashboard";
import SellerAddProduct from "./pages/SellerAddProduct";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/buyer-type" element={<BuyerType />} />
        <Route path="/register/seller" element={<SellerRegistration />} />
        <Route path="/register/buyer/large" element={<BuyerLargeRegistration />} />
        <Route path="/register/buyer/small" element={<BuyerSmallRegistration />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/:id" element={<CatalogDetail />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/seller/product/:id" element={<SellerProduct />} />
        <Route path="/seller/add-product" element={<SellerAddProduct />} />
      </Routes>
    </Router>
  );
}

export default App;

import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Verify from "./pages/Verify.jsx";
import Legacy from "./pages/Legacy.jsx";
import Products from "./pages/Products.jsx";
import Expo from "./pages/Expo.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/legacy" element={<Legacy />} />
          <Route path="/products" element={<Products />} />
          <Route path="/expo" element={<Expo />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

import { Link, useNavigate } from "react-router-dom";
import LoginIllustration from "../../assets/login-illustration.png";
import Logo from "../../assets/logo.png";
import { useState } from "react";
import { registerWithEmail } from "../../firebase/auth";

function SellerRegistration() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nik, setNik] = useState("");
    const [id, setId] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();
    const handleRegisterSeller = async (e) => {
      e.preventDefault();
      setError("");
      setSuccess("");
      
      if (!email || !password || !nik || !id) {
        setError("Semua kolom harus diisi");
        return;
      }
      
      try {
        const userData = {
          nik: nik,
          idfarmer: id
        };
        
        // Register the seller
        await registerWithEmail(email, password, 'seller', userData);
        
        setSuccess("Pendaftaran berhasil! Mengalihkan ke halaman login...");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } catch (err) {
        console.error("Registration error:", err);
        setError(err.message || "Terjadi kesalahan saat mendaftar");
      }
    };

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      {/* Logo and Title Section */}
      <div className="flex items-center justify-center pt-10 pb-6 gap-4">
        <img src={Logo} alt="Lumos Logo" className="w-12 h-12 mb-2" />
        <h1 className="text-3xl font-semibold text-black pb-2">Nusatani</h1>
      </div>

      {/* Main Content Section */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-6xl mx-auto">
          {/* Form Section */}
          <div className="w-full md:w-1/2 max-w-md">
            <form onSubmit={handleRegisterSeller} className="bg-gray-100 p-8 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-2xl font-bold text-black text-center">Daftar Sekarang</h2>
              <div className="flex justify-center mb-6 items-center gap-1">
                <p className="text-gray-400">Sudah punya akun? </p>
                <Link to="/login" className="text-orange-400 font-semibold hover:text-orange-500"> Masuk</Link>
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-1 border rounded-lg bg-gray-50 border-gray-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-1 border rounded-lg bg-gray-50 border-gray-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Induk Kependudukan
                </label>
                <input
                  id="nik"
                  type="nik"
                  value={nik}
                  onChange={e => setNik(e.target.value)}
                  className="w-full p-1 border rounded-lg bg-gray-50 border-gray-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Penjual
                </label>
                <input
                  id="id"
                  type="id"
                  value={id}
                  onChange={e => setId(e.target.value)}
                  className="w-full p-1 border rounded-lg bg-gray-50 border-gray-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-orange-400 hover:bg-blue-700 text-white py-3 rounded-4xl transition font-bold cursor-pointer">
                Register
              </button>
              {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
              {success && <div className="text-green-500 mt-4 text-center">{success}</div>}
            </form>
          </div>

          <div className="w-full md:w-1/2 hidden md:block">
            <img 
              src={LoginIllustration} 
              alt="Login Illustration" 
              className="w-full max-w-lg mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerRegistration;

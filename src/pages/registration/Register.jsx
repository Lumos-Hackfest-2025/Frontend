import { useNavigate } from "react-router-dom";
import ImABuyer from "../../assets/im-a-buyer.png";
import ImASeller from "../../assets/im-a-seller.png";

function Register() {
  const navigate = useNavigate();

  const handleUserTypeSelect = (type) => {
    if (type === 'farmer') {
      navigate('/register/seller');
    } else if (type === 'buyer') {
      navigate('/buyer-type');
    }
  };

  return (
    <div className="min-h-screen flex items-center py-4">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-black mb-2">Pilih Posisi Kamu</h1>
          <p className="text-lg text-gray-600">Pilihan ini akan menentukan fitur apa saja yang bisa dilakukan dalam applikasi</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
          <div 
            className="flex flex-col cursor-pointer transform transition hover:scale-105 hover:bg-orange-100 py-6 px-4 border-2 gap-3 border-gray-100 hover:border-orange-400 rounded-lg" 
            onClick={() => handleUserTypeSelect('farmer')}
          >
            <img src={ImASeller} alt="Seller" className="rounded-lg w-full max-w-[280px] mx-auto"/>
            <p className="font-bold text-center text-xl">Saya Adalah Penjual</p>
            <p className="font-extralight text-gray-700 text-sm">Jual hasil panen anda dengan mudah</p>
          </div>
          <div 
            className="flex flex-col cursor-pointer transform transition hover:scale-105 hover:bg-orange-100 py-6 px-4 border-2 gap-3 border-gray-100 hover:border-orange-400 rounded-lg" 
            onClick={() => handleUserTypeSelect('buyer')}
          >
            <img src={ImABuyer} alt="Buyer" className="rounded-lg w-full max-w-[280px] mx-auto"/>
            <p className="font-bold text-center text-xl">Saya Adalah Pembeli</p>
            <p className="font-extralight text-gray-700 text-sm">Beli hasil panen langsung dari petani</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

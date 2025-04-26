import { useNavigate } from "react-router-dom";

function BuyerType() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center py-4">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-black mb-2">Pilih Skala Pembelian</h1>
          <p className="text-lg text-gray-600">Tentukan skala pembelian yang akan anda lakukan</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-5xl mx-auto">
          <div 
            className="flex flex-col cursor-pointer transform transition hover:scale-105 hover:bg-orange-100 py-8 px-4 border-2 gap-4 border-gray-100 hover:border-orange-400 rounded-lg" 
            onClick={() => navigate('/register/buyer/large')}
          >
            <h2 className="font-bold text-center text-2xl">Skala Besar</h2>
            <p className="text-gray-700">Untuk distributor, supermarket, atau restoran besar</p>
            <ul className="list-disc list-inside text-gray-600">
              <li>Pembelian dalam jumlah besar</li>
              <li>Harga grosir khusus</li>
              <li>Pengiriman terjadwal</li>
            </ul>
          </div>
          <div 
            className="flex flex-col cursor-pointer transform transition hover:scale-105 hover:bg-orange-100 py-8 px-4 border-2 gap-4 border-gray-100 hover:border-orange-400 rounded-lg" 
            onClick={() => navigate('/register/buyer/small')}
          >
            <h2 className="font-bold text-center text-2xl">Skala Kecil</h2>
            <p className="text-gray-700">Untuk individu atau bisnis kecil</p>
            <ul className="list-disc list-inside text-gray-600">
              <li>Pembelian sesuai kebutuhan</li>
              <li>Fleksibilitas pemesanan</li>
              <li>Pengiriman kapan saja</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyerType;

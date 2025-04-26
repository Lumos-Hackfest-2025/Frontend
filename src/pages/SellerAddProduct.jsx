import React, { useState, useEffect } from 'react';
import { FiUpload, FiCalendar } from 'react-icons/fi';
import SellerNavbar from '../components/SellerNavbar';
import { db } from '../firebase/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { useAuthCheck } from '../utils/authUtils';

const SellerAddProduct = () => {
  // Add authentication check for seller role
  const { user, loading: authLoading, error: authError } = useAuthCheck('seller');
  
  const [formData, setFormData] = useState({
    uid: '',  // This will be set from auth
    name: '',
    stock: '',
    harvestDate: '',
    normalPrice: '',
    bulkPrice: '',
    isNormal: true,
    isBulk: false,
    image: null
  });
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    error: null,
    success: false
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fairPriceLoading, setFairPriceLoading] = useState(false);
  
  // Simplified product data (without fair prices)
  const products = [
    {
      id: '1',
      productName: 'Beras'
    },
    {
      id: '2',
      productName: 'Ikan'
    },
    {
      id: '3',
      productName: 'Apel'
    }
  ];

  // Function to fetch fair price data from the product collection
  const fetchFairPrice = async (productId) => {
    try {
      setFairPriceLoading(true);
      const selectedBasicProduct = products.find(p => p.id === productId);
      
      if (selectedBasicProduct) {
        const productQuery = query(
          collection(db, "product"),
          where("productName", "==", selectedBasicProduct.productName)
        );
        
        const querySnapshot = await getDocs(productQuery);
        
        if (!querySnapshot.empty) {
          const productData = querySnapshot.docs[0].data();
          
          // Get fair prices from the product document
          const productWithPrices = {
            ...selectedBasicProduct,
            normalFairPrice: productData.thisMonthFairPrice || 0,
            bulkFairPrice: productData.thisMonthBulkFairPrice || 0
          };
          
          setSelectedProduct(productWithPrices);
        } else {
          // If no product found in the collection, set the basic product with zero prices
          setSelectedProduct({
            ...selectedBasicProduct,
            normalFairPrice: 0,
            bulkFairPrice: 0
          });
        }
      }
    } catch (error) {
      console.error("Error fetching fair price:", error);
    } finally {
      setFairPriceLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
      
      // When product selection changes, fetch fair prices
      if (name === 'name') {
        fetchFairPrice(value);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFormData({
        ...formData,
        image: file
      });
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update the seller UID when authentication completes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        uid: user.uid
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setSubmitStatus({ 
        loading: false, 
        error: "You must be logged in to add products", 
        success: false 
      });
      return;
    }
    
    if (!selectedProduct) {
      setSubmitStatus({ 
        loading: false, 
        error: "Please select a product", 
        success: false 
      });
      return;
    }
    
    if (!formData.isNormal && !formData.isBulk) {
      setSubmitStatus({ 
        loading: false, 
        error: "Pilih minimal satu jenis penjualan (Normal atau Borongan)", 
        success: false 
      });
      return;
    }
    
    try {
      setSubmitStatus({ loading: true, error: null, success: false });
      
      // Base product data common to both normal and bulk options
      const baseProductData = {
        productId: selectedProduct.id,
        productName: selectedProduct.productName,
        catalogId: `catalog-${selectedProduct.productName.toLowerCase()}-${Date.now()}`,
        stock: Number(formData.stock),
        harvestDate: formData.harvestDate,
        sellerId: user.uid,
        sellerEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Array to store promises for batch processing
      const submissionPromises = [];
      
      // If normal pricing is selected, create a normal pricing entry
      if (formData.isNormal) {
        const normalProductData = {
          ...baseProductData,
          price: Number(formData.normalPrice),
          fairPrice: selectedProduct.normalFairPrice,
          priceType: 'normal',
          isBulk: false
        };
        
        submissionPromises.push(addDoc(collection(db, "catalog"), normalProductData));
      }
      
      // If bulk pricing is selected, create a bulk pricing entry
      if (formData.isBulk) {
        const bulkProductData = {
          ...baseProductData,
          price: Number(formData.bulkPrice),
          fairPrice: selectedProduct.bulkFairPrice,
          priceType: 'bulk',
          isBulk: true
        };
        
        submissionPromises.push(addDoc(collection(db, "catalog"), bulkProductData));
      }
      
      // Wait for all submissions to complete
      const results = await Promise.all(submissionPromises);
      console.log(`${results.length} products added successfully`);
      
      // Reset the form after successful submission
      setFormData({
        uid: user.uid, // Keep the current user's UID
        name: '',
        stock: '',
        harvestDate: '',
        normalPrice: '',
        bulkPrice: '',
        isNormal: true,
        isBulk: false,
        image: null
      });
      setSelectedProduct(null);
      setPreview(null);
      setFileName('');
      
      setSubmitStatus({ loading: false, error: null, success: true });
      
      // Display success message or redirect user
      setTimeout(() => {
        setSubmitStatus(prev => ({ ...prev, success: false }));
      }, 3000);
      
    } catch (error) {
      console.error("Error adding product: ", error);
      setSubmitStatus({ loading: false, error: error.message, success: false });
    }
  };

  // Show authentication loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md mx-auto bg-white rounded-xl shadow-md">
          <p className="text-xl text-gray-800 mb-2">Verifying your access...</p>
          <p className="text-gray-500">Please wait while we check your credentials.</p>
        </div>
      </div>
    );
  }
  
  // Show authentication error state
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md mx-auto bg-white rounded-xl shadow-md">
          <p className="text-xl text-red-600 mb-2">Authentication Error</p>
          <p className="text-gray-700 mb-4">
            {authError === "UNAUTHORIZED_ROLE" 
              ? "Only sellers can access this page." 
              : "There was an error verifying your account."}
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-900"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerNavbar />
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tambah Produk</h1>
          <p className="text-sm text-gray-500">Tambah jual produk</p>
        </div>

        {submitStatus.success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            Produk berhasil ditambahkan!
          </div>
        )}
        {submitStatus.error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {submitStatus.error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Image Upload */}
                <div>
                  <div className="w-full">
                    {preview ? (
                      <div className="relative w-full max-w-xs mx-auto">
                        <img 
                          src={preview} 
                          alt="Preview" 
                          className="w-full h-64 object-cover rounded-lg border"
                        />
                        <button 
                          type="button" 
                          className="absolute top-2 right-2 bg-white p-1 rounded-full shadow"
                          onClick={() => {
                            setPreview(null);
                            setFileName('');
                            setFormData({...formData, image: null});
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input 
                          type="file"
                          id="file-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        <label 
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-2">
                            <FiUpload className="text-gray-500" />
                          </div>
                          <span className="text-gray-700">Unggah File</span>
                          <span className="text-xs text-gray-500 mt-1">Maksimal ukuran file 2MB</span>
                        </label>
                      </div>
                    )}
                    {fileName && (
                      <div className="mt-2 text-sm text-gray-600 text-center">
                        {fileName}
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Produk
                  </label>
                  <div className="relative">
                    <select
                      id="name"
                      name="name"
                      className="block w-full rounded-md py-2 px-3 border border-gray-300 bg-white focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm appearance-none"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>Pilih produk</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.productName}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                    Stok Total (Kilogram)
                  </label>
                  <input 
                    type="number"
                    id="stock"
                    name="stock"
                    min="1"
                    className="block w-full rounded-md py-2 px-3 border border-gray-300 bg-white focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Harvest Date */}
                <div>
                  <label htmlFor="harvestDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal dipanen
                  </label>
                  <div className="relative">
                    <input 
                      type="date"
                      id="harvestDate"
                      name="harvestDate"
                      className="block w-full rounded-md py-2 pl-3 pr-10 border border-gray-300 bg-white focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      value={formData.harvestDate}
                      onChange={handleChange}
                      required
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <FiCalendar className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Fair Price Information */}
                {selectedProduct && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Informasi Fair Price
                    </label>
                    <div className="bg-gray-100 p-3 rounded-md">
                      {fairPriceLoading ? (
                        <div className="flex justify-center p-2">
                          <p className="text-sm text-gray-500">Loading fair prices...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Fair Price Normal:</span>
                            <span className="font-medium text-green-600">
                              Rp{selectedProduct.normalFairPrice?.toLocaleString('id-ID') || '0'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Fair Price Borongan:</span>
                            <span className="font-medium text-green-600">
                              Rp{selectedProduct.bulkFairPrice?.toLocaleString('id-ID') || '0'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Selling Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Penjualan
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="normalOption"
                        name="isNormal"
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        checked={formData.isNormal}
                        onChange={handleChange}
                      />
                      <label htmlFor="normalOption" className="ml-2 block text-sm text-gray-700">
                        Jual dengan harga normal
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="bulkOption"
                        name="isBulk"
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        checked={formData.isBulk}
                        onChange={handleChange}
                      />
                      <label htmlFor="bulkOption" className="ml-2 block text-sm text-gray-700">
                        Jual dengan harga borongan
                      </label>
                    </div>
                  </div>
                  {!formData.isNormal && !formData.isBulk && (
                    <p className="mt-2 text-sm text-red-500">
                      Pilih minimal satu jenis penjualan
                    </p>
                  )}
                </div>

                {/* Normal Price */}
                {formData.isNormal && (
                  <div>
                    <label htmlFor="normalPrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Harga Normal per Kilogram
                    </label>
                    <div className="relative rounded-md">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">Rp</span>
                      </div>
                      <input 
                        type="number"
                        id="normalPrice"
                        name="normalPrice"
                        min="0"
                        className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="0"
                        value={formData.normalPrice}
                        onChange={handleChange}
                        required={formData.isNormal}
                      />
                    </div>
                    {selectedProduct && (
                      <div className="mt-1 text-xs">
                        <p className="text-green-600">
                          Fair Price: 
                          Rp{selectedProduct.normalFairPrice?.toLocaleString('id-ID') || '0'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Bulk Price */}
                {formData.isBulk && (
                  <div>
                    <label htmlFor="bulkPrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Harga Borongan per Kilogram
                    </label>
                    <div className="relative rounded-md">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">Rp</span>
                      </div>
                      <input 
                        type="number"
                        id="bulkPrice"
                        name="bulkPrice"
                        min="0"
                        className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="0"
                        value={formData.bulkPrice}
                        onChange={handleChange}
                        required={formData.isBulk}
                      />
                    </div>
                    {selectedProduct && (
                      <div className="mt-1 text-xs">
                        <p className="text-green-600">
                          Fair Price: 
                          Rp{selectedProduct.bulkFairPrice?.toLocaleString('id-ID') || '0'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-4 bg-gray-50 text-right sm:px-6">
              <button
                type="submit"
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-800 hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full sm:w-auto ${
                  submitStatus.loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={submitStatus.loading}
              >
                {submitStatus.loading ? 'Memproses...' : 'Daftar Sekarang'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerAddProduct;

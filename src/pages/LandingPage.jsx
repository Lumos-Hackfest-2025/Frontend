import { useNavigate } from "react-router-dom";
import { signOut } from "../firebase/auth";

function Home() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-80 border border-gray-200 dark:border-gray-700 flex flex-col items-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Hello World</span>
        <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded transition">Logout</button>
      </div>
    </div>
  );
}

export default Home;

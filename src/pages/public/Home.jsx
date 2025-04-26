import { useNavigate } from "react-router-dom";
import { signOut } from "../../auth/auth";

function Home() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      Hello World
      <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Logout</button>
    </div>
  );
}

export default Home;

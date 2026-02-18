import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";


const DeliveryLayout = () => {
  const navigate = useNavigate();
  const { axios, setUser, setIsdelivery } = useAppContext();

  // ------------------ Sidebar Links ------------------
  const sidebarLinks = [
    { name: "Orders", path: "/delivery", icon: assets.add_icon },
    { name: "All Orders", path: "/delivery/allorders", icon: assets.product_list_icon },

  ];

  // ------------------ Logout Function ------------------
  const logout = async () => {
    try {
      await axios.get("/api/delivery/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("deliveryToken");
      setUser(null);
      setIsdelivery(false);
      navigate("/delivery-login");
      toast.success("Logged out successfully");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Navbar */}
      <header className="flex items-center bg-white border-b border-gray-200 p-4 md:p-6 sticky top-0 z-50">
        <h1 className="text-lg font-semibold text-gray-700 hidden md:block">
          Delivery Dashboard
        </h1>

        {/* Logout button */}
        <button
          onClick={logout}
          className="ml-auto bg-white border border-red-200 text-red-600 rounded-lg text-sm px-4 py-2 hover:bg-red-50 transition-colors font-medium"
        >
          Logout
        </button>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-16 md:w-64 border-r border-gray-200 bg-white flex flex-col py-4">
          <nav className="flex-1 space-y-1">
            {sidebarLinks.map((item) => (
              <NavLink
                to={item.path}
                key={item.name}
                end={item.path === "/delivery"}
                className={({ isActive }) =>
                  `flex items-center py-3 px-4 gap-3 transition-all duration-200 group ${
                    isActive
                      ? "bg-primary/5 text-primary border-r-4 border-primary"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <img
                  src={item.icon}
                  alt={item.name}
                  className="w-6 h-6 object-contain"
                />
                <span className="hidden md:block font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet /> {/* Nested routes render here */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DeliveryLayout;

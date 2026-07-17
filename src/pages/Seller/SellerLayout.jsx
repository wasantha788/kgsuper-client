import { NavLink, Outlet, Link } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const SellerLayout = () => {
  // ✅ Destructure everything you need
  const { 
    axios, 
    navigate, 
    isSeller, 
    setIsSeller, 
    setUser, 
    getSellerHeaders,
    Sellerlogout   // ← This is the logout function from context
  } = useAppContext();

  const sidebarLinks = [
    { name: "Add Product", path: "/seller", icon: assets.add_icon },
    { name: "Product List", path: "/seller/product-list", icon: assets.product_list_icon },
    { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
    { name: "Order tracking", path: "/seller/order-tracking", icon: assets.reqest_icon },
    { name: "Seller Request", path: "/seller/seller-request", icon: assets.tracking },
  ];

  // ✅ Use Sellerlogout directly from context
  const handleLogout = () => {
    Sellerlogout(navigate); // Pass navigate to redirect after logout
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white sticky top-0 z-10">
        <Link to="/">
          <img
            src={assets.logo}
            alt="logo"
            className="cursor-pointer w-32 md:w-36"
          />
        </Link>

        <div className="flex items-center gap-5 text-gray-600">
          <p>Hi! Admin</p>
          <button
            onClick={handleLogout} // ✅ Now uses the correct function
            className="border border-gray-400 rounded-full text-sm px-4 py-1 hover:bg-gray-100 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Sidebar + Main Content */}
      <div className="flex flex-1">
        <aside className="md:w-64 w-20 border-r border-gray-300 pt-4 flex flex-col bg-white min-h-full h-auto">
          <div className="sticky top-20"> 
            {sidebarLinks.map((item) => (
              <NavLink
                to={item.path}
                key={item.name}
                end={item.path === "/seller"}
                className={({ isActive }) =>
                  `flex items-center py-3 px-4 gap-3 transition-all ${
                    isActive
                      ? "border-r-4 md:border-r-[6px] bg-primary/10 border-primary text-primary"
                      : "hover:bg-gray-100/90 text-gray-600"
                  }`
                }
              >
                <img src={item.icon} alt={item.name} className="w-7 h-7" />
                <p className="md:block hidden font-medium">{item.name}</p>
              </NavLink>
            ))}
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
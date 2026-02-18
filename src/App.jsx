import React from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAppContext } from "./context/AppContext.jsx";

// Layouts
import MainLayout from "./layouts/MainLayout.jsx";
import SenderLayout from "./layouts/SenderLayout.jsx";
import ChatLayout from "./layouts/ChatLayout.jsx";
import SellerLayout from "./pages/Seller/SellerLayout.jsx";
import DeliveryLayout from "./components/DeliveryAgent/DeliveryLayout.jsx";

// Auth
import Login from "./components/Login.jsx";
import Loading from "./components/Loading.jsx";

// Public Pages
import Home from "./pages/Home.jsx";
import AllProducts from "./pages/AllProducts.jsx";
import ProductCategory from "./pages/ProductCategory.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Cart from "./pages/Cart.jsx";
import AddAddress from "./pages/AddAddress.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import Contact from "./pages/Contact.jsx";
import Map from "./pages/Map.jsx";
import CustomerChatRequest from "./components/CustomerChatRequest.jsx";
import DeliveryChatPage from "./components/DeliveryAgent/DeliveryOrderConnect.jsx";





// Seller
import SellerLogin from "./components/Seller/SellerLogin.jsx";
import AddProduct from "./pages/Seller/AddProduct.jsx";
import Orders from "./pages/Seller/Orders.jsx";
import ProductList from "./pages/Seller/ProductList.jsx";
import OrderTracking from "./pages/Seller/Ordertracking.jsx";
import SellerApply from "./pages/Customerseller/SellerApply.jsx";
import SellerRequest from "./pages/Seller/SellerRequest.jsx";
import SellerRequestLogin from "./pages/Customerseller/SellerRequestLogin.jsx";
import SellerRequestRegister from "./pages/Customerseller/SellerRequestRegister.jsx";

// Delivery
import DeliveryBoys from "./components/DeliveryAgent/DeliveryBoys.jsx";
import DeliveryTracking from "./pages/DeliveryTracking.jsx";
import DeliveryBoysLogin from "./components/DeliveryAgent/DeliveryBoysLogin.jsx";
import DeliveryDashboard from "./components/DeliveryAgent/DeliveryDashboard.jsx";
import DeliveryOrderDetails from "./components/DeliveryAgent/OrderDetails.jsx";
import AllOrders from "./components/DeliveryAgent/AllOrders.jsx";
import OrderAssigned from "./components/DeliveryAgent/Ordersassigned.jsx";
import DeliveryOrderConnect from "./components/DeliveryAgent/DeliveryOrderConnect.jsx";



const App = () => {
  const { showUserLogin, isSeller, isdelivery } = useAppContext();

  return (
    <>
      {showUserLogin && <Login />}
      <Toaster position="top-right" />

      <Routes>
        {/* 🌐 PUBLIC WEBSITE */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/products/:category" element={<ProductCategory />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/add-address" element={<AddAddress />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/map" element={<Map />} />
          <Route path="/loader" element={<Loading />} />
          <Route path="/delivery/chat-request/:orderId" element={<CustomerChatRequest />} />
          <Route path="/delivery/chat/:orderId" element={<DeliveryChatPage />} /> {/* your actual chat page */}


        
      

          {/* Orders */}
          <Route path="/ordersassigned" element={<OrderAssigned />} />
        </Route>

        {/* 🚚 DELIVERY */}
        <Route element={<MainLayout />}>
          <Route path="/deliveryboys" element={<DeliveryBoys />} />
          <Route path="/delivery-tracking/:orderId" element={<DeliveryTracking />} />
        </Route>

       


        {/* 🧑‍💼 SELLER */}
        <Route path="/seller" element={isSeller ? <SellerLayout /> : <SellerLogin />}>
          <Route index element={<AddProduct />} />
          <Route path="product-list" element={<ProductList />} />
          <Route path="orders" element={<Orders />} />
          <Route path="order-tracking" element={<OrderTracking />} />
          <Route path="seller-request" element={<SellerRequest />} />
        </Route>
        <Route path="/seller-login" element={<SellerLogin />} />

        {/* Customer Seller */}
        <Route path="/seller-request/login" element={<SellerRequestLogin />} />
        <Route path="/seller-request/register" element={<SellerRequestRegister />} />
        <Route path="/seller-apply" element={<SellerApply />} />

        {/* 💬 CHAT / SENDER & RECEIVER */}
        <Route element={<SenderLayout />}>
         
          </Route>
           {/* DELIVERY LAYOUT */}
          <Route path="/delivery" element={isdelivery ? <DeliveryLayout /> : <DeliveryBoysLogin />}>
          <Route index element={<DeliveryDashboard />} />
          <Route path="allorders" element={<AllOrders />} />
          <Route path=":id" element={<DeliveryOrderDetails />} />
          <Route path="/delivery/order/:orderId" element={<DeliveryOrderConnect />} />

          
        </Route>

        <Route path="/delivery-login" element={<DeliveryBoysLogin />} />


      

        <Route element={<ChatLayout />}>
         
        </Route>

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <div className="flex flex-col items-center justify-center py-20">
              <h1 className="text-6xl font-bold text-gray-200">404</h1>
              <p className="text-red-500 mt-4">Page Not Found</p>
            </div>
          }
        />
      </Routes>
    </>
  );
};

export default App;

import Navbar2 from "../components/Navbar2";
import { Outlet } from "react-router-dom";
import { useAppContext } from "../context/AppContext.jsx"; // Import your context hook

const ChatLayout = () => {
  // Pull the order data from your Global Context
  const {  } = useAppContext(); 

  return (
    <>
      {/* Pass the data as a prop to Navbar2 */}
       <Navbar2  />
      <Outlet />
    </>
  );
};

export default ChatLayout;
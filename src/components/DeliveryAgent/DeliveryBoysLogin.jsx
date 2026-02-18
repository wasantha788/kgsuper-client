import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext.jsx";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate(); // ✅ useNavigate inside component
  const { setShowUserLogin, setUser, setIsdelivery, axios } = useAppContext();

  const [state, setState] = useState("login"); // "login" or "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [loading, setLoading] = useState(false);

  // ------------------ Axios interceptor ------------------
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("deliveryToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => axios.interceptors.request.eject(interceptor);
  }, [axios]);

  // ------------------ Handle form submit ------------------
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload =
        state === "register"
          ? { name, email, password, phone, vehicleType }
          : { email, password };

      const { data } = await axios.post(`/api/delivery/${state}`, payload);

      if (data.success) {
        // ✅ Save JWT token
        localStorage.setItem("deliveryToken", data.token);

        // ✅ Save user info in context
        setUser(data.user);
        setShowUserLogin(false);

        // ✅ Set delivery role
        if (data.user.role === "delivery") setIsdelivery(true);

        // ✅ Navigate to dashboard
        navigate("/delivery");
        toast.success(`Welcome ${data.user.name || "User"}!`);

        // Optional: Refresh page
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Error occurred");
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  return (
    <div
      onClick={() => setShowUserLogin(false)}
      className="fixed inset-0 z-30 flex items-center justify-center text-sm text-gray-600 bg-black/50"
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-4 p-8 sm:p-12 w-80 sm:w-88 text-gray-500 rounded-lg shadow-xl border border-gray-200 bg-white"
      >
        <p className="text-2xl font-medium text-center">
          <span className="text-primary">Delivery</span>{" "}
          {state === "login" ? "Login" : "Sign Up"}
        </p>

        {/* ---------------- REGISTER FIELDS ---------------- */}
        {state === "register" && (
          <>
            <div className="w-full">
              <p>Name</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                placeholder="Full Name"
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                type="text"
                required
              />
            </div>

            <div className="w-full">
              <p>Phone</p>
              <input
                onChange={(e) => setPhone(e.target.value)}
                value={phone}
                placeholder="Phone (optional)"
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                type="text"
              />
            </div>

            <div className="w-full">
              <p>Vehicle Type</p>
              <input
                onChange={(e) => setVehicleType(e.target.value)}
                value={vehicleType}
                placeholder="Vehicle Type (Bike / Car / Van)"
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                type="text"
              />
            </div>
          </>
        )}

        {/* ---------------- COMMON FIELDS ---------------- */}
        <div className="w-full">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Type here"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            type="email"
            required
          />
        </div>

        <div className="w-full">
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Type here"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            type="password"
            required
          />
        </div>

        {/* ---------------- TOGGLE LOGIN/REGISTER ---------------- */}
        {state === "register" ? (
          <p className="text-sm">
            Already have an account?{" "}
            <span
              onClick={() => setState("login")}
              className="text-primary cursor-pointer"
            >
              Click here
            </span>
          </p>
        ) : (
          <p className="text-sm">
            Create an account?{" "}
            <span
              onClick={() => setState("register")}
              className="text-primary cursor-pointer"
            >
              Click here
            </span>
          </p>
        )}

        {/* ---------------- SUBMIT BUTTON ---------------- */}
        <button
          type="submit"
          disabled={loading}
          className={`bg-primary hover:bg-primary-dull transition-all text-white w-full py-2 rounded-md cursor-pointer ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading
            ? state === "register"
              ? "Creating..."
              : "Logging in..."
            : state === "register"
            ? "Create Account"
            : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;

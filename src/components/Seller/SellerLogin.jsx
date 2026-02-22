import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const SellerLogin = () => {
  const { isSeller, setIsSeller, navigate, axios } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ✅ Handle form submit
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/seller/login', { email, password });

      if (data.success) {
        // --- ADD THIS LINE ---
        localStorage.setItem('sellerToken', data.token); 
        
        setIsSeller(true);
        toast.success("Login Successful"); // Added for feedback
        navigate('/seller');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (isSeller) {
      navigate('/seller');
    }
  }, [isSeller, navigate]);

  return (
    !isSeller && (
      <form
        onSubmit={onSubmitHandler}
        className="min-h-screen flex items-center justify-center text-sm text-gray-600"
      >
        <div className="w-87.5 bg-white p-6 rounded-md shadow-md">
          <p className="text-2xl font-medium text-center mb-4">
            <span className="text-primary">Seller</span> Login
          </p>

          <div className="w-full mb-4">
            <p>Email</p>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
              required
            />
          </div>

          <div className="w-full mb-6">
            <p>Password</p>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-primary text-white w-full py-2 rounded-md cursor-pointer hover:opacity-90 transition"
          >
            Login
          </button>
        </div>
      </form>
    )
  );
};

export default SellerLogin;

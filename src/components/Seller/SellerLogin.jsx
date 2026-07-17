import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const SellerLogin = () => {
  const { isSeller, setIsSeller, navigate, axios, setUser } = useAppContext();
  
  const [state, setState] = useState('Login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (state === 'Login') {
        // --- LOGIN ---
        const { data } = await axios.post('/api/seller/login', { email, password });

        if (data.success) {
          // ✅ Store token and seller data
          localStorage.setItem('sellerToken', data.token);
          
          // ✅ If seller object is returned, store it and set user
          if (data.seller && data.seller._id) {
            localStorage.setItem('sellerId', data.seller._id);
            setUser(data.seller);   // This makes user available for Socket
          } else {
            // Fallback: if no seller object, store ID from token if possible
            // But we rely on backend to send it
            console.warn('No seller data in login response. Please check backend.');
          }

          setIsSeller(true);
          toast.success('Login Successful');
          navigate('/seller');
        } else {
          toast.error(data.message);
        }
      } else {
        // --- REGISTRATION ---
        const { data } = await axios.post('/api/seller/register', { name, email, password, phone });

        if (data.success) {
          // If token is returned directly (auto-login)
          if (data.token) {
            localStorage.setItem('sellerToken', data.token);
            if (data.seller && data.seller._id) {
              localStorage.setItem('sellerId', data.seller._id);
              setUser(data.seller);
            }
            setIsSeller(true);
            toast.success('Registration & Login Successful');
            navigate('/seller');
          } else {
            // No token – redirect to login
            toast.success('Registration Successful! Please login.');
            setState('Login');
          }
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

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
            <span className="text-primary">Seller</span> {state}
          </p>

          {state === 'Sign Up' && (
            <div className="w-full mb-4">
              <p>Full Name</p>
              <input
                type="text"
                placeholder="Enter company or personal name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                required
              />
            </div>
          )}

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

          {state === 'Sign Up' && (
            <div className="w-full mb-4">
              <p>Phone Number</p>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                required
              />
            </div>
          )}

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
            className="bg-primary text-white w-full py-2 rounded-md cursor-pointer hover:opacity-90 transition mb-4"
          >
            {state === 'Login' ? 'Login' : 'Create Account'}
          </button>

          <p className="text-center text-xs mt-2">
            {state === 'Login' ? "Don't have a seller account? " : "Already have an account? "}
            <span
              onClick={() => setState(state === 'Login' ? 'Sign Up' : 'Login')}
              className="text-primary font-medium cursor-pointer underline ml-1"
            >
              {state === 'Login' ? 'Register here' : 'Login here'}
            </span>
          </p>
        </div>
      </form>
    )
  );
};


export default SellerLogin;
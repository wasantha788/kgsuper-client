import React, { useState } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";

// ✅ Reusable Input Field
const InputField = ({ type, placeholder, name, handleChange, address }) => (
  <input
    className="w-full px-3 py-2 border border-gray-300 rounded outline-none text-gray-700 focus:border-primary focus:ring-1 focus:ring-primary transition"
    type={type}
    placeholder={placeholder}
    name={name}
    value={address[name]}
    onChange={handleChange}
    required
  />
);

const AddAddress = () => {
  const { axios, navigate } = useAppContext();

  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ NO userId sent
      const { data } = await axios.post(
        "/api/address/add",
        address,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Address saved");
        navigate("/cart");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please login first");
        navigate("/");
      } else {
        toast.error(error.response?.data?.message || "Failed to save address");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16 pb-16 px-4 md:px-12">
      <h1 className="text-2xl md:text-3xl text-gray-700">
        Add Shipping <span className="font-semibold text-primary">Address</span>
      </h1>

      <div className="flex flex-col-reverse md:flex-row justify-between mt-10 gap-8">
        {/* Form */}
        <div className="flex-1 max-w-md">
          <form onSubmit={onSubmitHandler} className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <InputField name="firstName" type="text" placeholder="First Name" handleChange={handleChange} address={address} />
              <InputField name="lastName" type="text" placeholder="Last Name" handleChange={handleChange} address={address} />
            </div>

            <InputField name="email" type="email" placeholder="Email" handleChange={handleChange} address={address} />
            <InputField name="street" type="text" placeholder="Street" handleChange={handleChange} address={address} />

            <div className="grid grid-cols-2 gap-4">
              <InputField name="city" type="text" placeholder="City" handleChange={handleChange} address={address} />
              <InputField name="state" type="text" placeholder="State" handleChange={handleChange} address={address} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField name="zipcode" type="text" placeholder="Zip code" handleChange={handleChange} address={address} />
              <InputField name="country" type="text" placeholder="Country" handleChange={handleChange} address={address} />
            </div>

            <InputField name="phone" type="text" placeholder="Phone" handleChange={handleChange} address={address} />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded hover:opacity-90 transition font-semibold"
            >
              {loading ? "Saving..." : "Save Address"}
            </button>
          </form>
        </div>

        {/* Image */}
        <div className="flex-1 flex justify-center md:justify-end">
          <img
            className="w-full max-w-sm object-contain"
            src={assets.add_address_iamge}
            alt="Add Address"
          />
        </div>
      </div>
    </div>
  );
};

export default AddAddress;

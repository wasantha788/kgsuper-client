import React, { useState } from "react";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const groceryCategories = ["Fruits", "Vegetables", "Oil","Dairy", "Eggs","Snacks","Biscuits","Bakery","Grains","Soft Drinks","Malts & Drinking Powders","Noodles And Pastas","Pharmacy","Spreads & Honey",]

const AddProduct = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [isFresh, setIsFresh] = useState(false);
  const [isOrganic, setIsOrganic] = useState(false);

  const { axios } = useAppContext();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const productData = {
        name,
        description: description.split("\n"),
        category,
        price,
        offerPrice,
        isFresh,
        isOrganic,
      };

      const formData = new FormData();
      formData.append("productData", JSON.stringify(productData));
      files.forEach((file) => file && formData.append("images", file));

      const { data } = await axios.post("/api/product/add", formData);

      if (data.success) {
        toast.success(data.message);
        setName("");
        setDescription("");
        setCategory("");
        setPrice("");
        setOfferPrice("");
        setFiles([]);
        setIsFresh(false);
        setIsOrganic(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-green-50 flex justify-center py-10">
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-3xl bg-white p-6 md:p-10 rounded-xl shadow-lg space-y-6"
      >
        <h2 className="text-3xl font-bold text-green-700">Add Grocery Product</h2>

        {/* Image Upload */}
        <div>
          <p className="text-lg font-medium mb-2">Product Images</p>
          <div className="flex flex-wrap gap-4">
            {Array(4)
              .fill("")
              .map((_, index) => (
                <label key={index} htmlFor={`image${index}`} className="cursor-pointer">
                  <input
                    id={`image${index}`}
                    type="file"
                    hidden
                    onChange={(e) => {
                      const updatedFiles = [...files];
                      updatedFiles[index] = e.target.files[0];
                      setFiles(updatedFiles);
                    }}
                  />
                  <div className="w-24 h-24 md:w-32 md:h-32 border border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-green-100">
                    <img
                      src={files[index] ? URL.createObjectURL(files[index]) : assets.upload_area}
                      alt="upload"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </label>
              ))}
          </div>
        </div>

        {/* Product Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="product-name" className="text-base font-medium">
            Product Name
          </label>
          <input
            type="text"
            id="product-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Fresh Apples"
            className="outline-none px-3 py-2 md:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400"
            required
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label htmlFor="product-description" className="text-base font-medium">
            Product Description
          </label>
          <textarea
            id="product-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Enter product details..."
            className="outline-none px-3 py-2 md:py-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-green-400"
            required
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <label htmlFor="category" className="text-base font-medium">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="outline-none px-3 py-2 md:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400"
            required
          >
            <option value="">Select Category</option>
            {groceryCategories.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Price & Offer Price */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="flex-1 flex flex-col gap-2">
            <label htmlFor="product-price" className="text-base font-medium">
              Product Price
            </label>
            <input
              type="number"
              id="product-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="outline-none px-3 py-2 md:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400"
              required
            />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <label htmlFor="offer-price" className="text-base font-medium">
              Offer Price
            </label>
            <input
              type="number"
              id="offer-price"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              placeholder="0"
              className="outline-none px-3 py-2 md:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400"
              required
            />
          </div>
        </div>

        {/* Fresh & Organic */}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isFresh}
              onChange={(e) => setIsFresh(e.target.checked)}
              className="w-4 h-4 accent-green-500"
            />
            <span className="text-sm font-medium">Fresh</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isOrganic}
              onChange={(e) => setIsOrganic(e.target.checked)}
              className="w-4 h-4 accent-yellow-500"
            />
            <span className="text-sm font-medium">Organic</span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 md:px-8 py-2.5 md:py-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition"
          >
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;

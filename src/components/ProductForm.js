"use client";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs";
export default function ProductForm({
  _id,
  title: currentTitle,
  description: currentDescription,
  price: currentPrice,
  images: currentImage,
  category: currentCategory
}) {
  const [title, setTitle] = useState(currentTitle || "");
  const [description, setdDescription] = useState(currentDescription || "");
  const [price, setPrice] = useState(currentPrice || "");
  const [goToProducts, setGoToProducts] = useState(false);
  const [images, setImages] = useState(currentImage || []);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(currentCategory || "");

  const router = useRouter();

  useEffect(() => {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
      console.log(result.data)
    });
  }, []);

  async function saveProduct(e) {
    e.preventDefault();
    const data = { title, description, price, images, category };
    console.log("enotru");
    if (_id) {
      await axios.put("/api/products", { ...data, _id });
    } else {
      await axios.post("/api/products", data);
    }
    setGoToProducts(true);
  }
  if (goToProducts) {
    router.push("/products");
  }

  const handleImageChange = (imageUrl) => {
    setImages([...images, imageUrl]);
  };

  const handleImageRemove = (imageUrl) => {
    const filteredImages = images.filter((url) => url !== imageUrl);
    setImages(filteredImages);
  };

  async function uploadImages(result) {
    setIsSubmitting(true);
    const imageUrl = result.info.secure_url;

    setImages([...images, imageUrl]);
    setIsSubmitting(false);
  }

  function updateImagesOrder(images) {
    setImages(images);
  }

  return (
    <form onSubmit={saveProduct}>
      <label>Product name</label>
      <input
        type="text"
        placeholder="product name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Uncategorized</option>

        {categories.length > 0 &&
          categories.map((category) => (
            <option value={category._id}>{category.name}</option>
          ))}
      </select>
      <label>Photos</label>
      <div className="mb-2 flex gap-2">
        <label className="w-24 h-24 mb-3 text-center flex flex-col justify-center items-center text-sm gap-1 text-gray-500 rounded-lg bg-gray-200 cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <div>Upload</div>
          <CldUploadWidget onUpload={uploadImages} uploadPreset="ev7qrhmc">
            {({ open }) => {
              const onClick = (event) => {
                event.preventDefault();
                setIsSubmitting(true);

                open();
              };

              return <button onClick={onClick} />;
            }}
          </CldUploadWidget>
        </label>
        <div className="mb-2 flex flex-wrap gap-1">
          <ReactSortable
            list={images}
            setList={updateImagesOrder}
            className="flex flex-wrap gap-1"
          >
            {!!images.length &&
              images.map((imageUrl, index) => (
                <div className="h-24 object-cover rounded-md">
                  <img
                    key={index}
                    src={imageUrl}
                    alt={`Product Image ${index + 1}`}
                    className="rounded-lg"
                  />
                </div>
              ))}
          </ReactSortable>
          {isSubmitting && (
            <div className="w-24 h-24 flex items-center">
              <Spinner />
            </div>
          )}
        </div>
      </div>

      <label>Description</label>
      <textarea
        placeholder="description"
        value={description}
        onChange={(e) => setdDescription(e.target.value)}
      ></textarea>
      <label>Price (in USD)</label>
      <input
        type="number"
        placeholder="price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        style={{ appearance: "textfield", "-moz-appearance": "textfield" }}
        inputMode="numeric"
      />

      <button type="submit" className="btn-primary">
        Save
      </button>
    </form>
  );
}

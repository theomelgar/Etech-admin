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
  category: currentCategory,
  properties: assignedProperties,
}) {
  const [title, setTitle] = useState(currentTitle || "");
  const [description, setdDescription] = useState(currentDescription || "");
  const [price, setPrice] = useState(currentPrice || "");
  const [goToProducts, setGoToProducts] = useState(false);
  const [images, setImages] = useState(currentImage || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(currentCategory || "");
  const [productProperties, setProductProperties] = useState(
    assignedProperties || {}
  );

  const router = useRouter();

  useEffect(() => {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
      console.log(result.data);
    });
  }, []);

  async function saveProduct(e) {
    e.preventDefault();
    const data = {
      title,
      description,
      price,
      images,
      category,
      properties: productProperties,
    };
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

  function setProductProp(propName, value) {
    setProductProperties((prev) => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      return newProductProps;
    });
  }
  
  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({ _id }) => _id === category);
    propertiesToFill.push(...catInfo.properties);
    while (catInfo?.parent?._id) {
      const parentCat = categories.find(
        ({ _id }) => _id === catInfo?.parent?._id
      );
      propertiesToFill.push(...parentCat.properties);
      catInfo = parentCat;
    }
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
      <label>Category</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Uncategorized</option>

        {categories.length > 0 &&
          categories.map((category) => (
            <option key={category.id} value={category._id}>
              {category.name}
            </option>
          ))}
      </select>
      {propertiesToFill.length > 0 &&
        propertiesToFill.map((p) => (
          <div key={p.name} className="">
            <label>{p.name[0].toUpperCase() + p.name.substring(1)}</label>
            <div>
              <select
                value={productProperties[p.name]}
                onChange={(ev) => setProductProp(p.name, ev.target.value)}
              >
                {p.values.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      <label>Photos</label>
      <div className="mb-2 flex gap-2">
        <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary">
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
                <div className="h-24 object-cover rounded-md" key={index}>
                  <img
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

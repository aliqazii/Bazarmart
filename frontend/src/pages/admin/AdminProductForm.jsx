import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FaArrowLeft, FaSave, FaImage } from "react-icons/fa";

const categories = [
  "Electronics",
  "Clothing",
  "Books",
  "Shoes",
  "Accessories",
  "Home",
  "Sports",
];

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: categories[0],
    stock: "",
    images: [{ url: "" }],
    sizes: [],
    colorOptions: [],
    gender: "",
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");

  const allSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const shoeSizes = ["39", "40", "41", "42", "43", "44", "45"];
  const genders = ["Men", "Women", "Unisex"];

  const createColorOption = () => ({
    name: "",
    swatch: "",
    images: [{ url: "" }],
  });

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const { data } = await axios.get(`/api/v1/products/${id}`);
          const p = data.product;
          setForm({
            name: p.name,
            description: p.description,
            price: p.price,
            category: p.category,
            stock: p.stock,
            images: p.images.length > 0 ? p.images : [{ url: "" }],
            sizes: p.sizes || [],
            colorOptions:
              p.colorOptions?.length > 0
                ? p.colorOptions.map((option) => ({
                    name: option.name || "",
                    swatch: option.swatch || "",
                    images:
                      option.images?.length > 0
                        ? option.images.map((image) => ({ url: image.url || "" }))
                        : [{ url: "" }],
                  }))
                : [],
            gender: p.gender || "",
          });
          if (p.images?.[0]?.url) setPreview(p.images[0].url);
        } catch {
          toast.error("Failed to load product");
          navigate("/admin/products");
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "category" && value !== "Clothing" && value !== "Shoes") {
      setForm((prev) => ({ ...prev, [name]: value, sizes: [], gender: "", colorOptions: [] }));
    }
    if (name === "category" && value === "Clothing") {
      setForm((prev) => ({ ...prev, [name]: value, colorOptions: [] }));
    }
    if (name === "category" && value === "Shoes") {
      setForm((prev) => ({
        ...prev,
        [name]: value,
        gender: prev.gender || "Unisex",
        sizes: prev.sizes.length > 0 ? prev.sizes : ["41", "42", "43"],
        colorOptions: prev.colorOptions.length > 0 ? prev.colorOptions : [createColorOption()],
      }));
    }
  };

  const availableSizes = form.category === "Shoes" ? shoeSizes : allSizes;

  const toggleSize = (size) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleImageChange = (e) => {
    setForm({ ...form, images: [{ url: e.target.value }] });
    setPreview(e.target.value);
  };

  const addColorOption = () => {
    setForm((prev) => ({
      ...prev,
      colorOptions: [...prev.colorOptions, createColorOption()],
    }));
  };

  const removeColorOption = (index) => {
    setForm((prev) => ({
      ...prev,
      colorOptions: prev.colorOptions.filter((_, optionIndex) => optionIndex !== index),
    }));
  };

  const handleColorOptionChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      colorOptions: prev.colorOptions.map((option, optionIndex) =>
        optionIndex === index ? { ...option, [field]: value } : option
      ),
    }));
  };

  const handleColorImagesChange = (index, value) => {
    const images = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((url) => ({ url }));

    setForm((prev) => ({
      ...prev,
      colorOptions: prev.colorOptions.map((option, optionIndex) =>
        optionIndex === index
          ? { ...option, images: images.length > 0 ? images : [{ url: "" }] }
          : option
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedColorOptions =
        form.category === "Shoes"
          ? form.colorOptions
              .map((option) => ({
                name: option.name.trim(),
                swatch: option.swatch.trim(),
                images: (option.images || [])
                  .map((image) => ({ url: String(image.url || "").trim() }))
                  .filter((image) => image.url),
              }))
              .filter((option) => option.name && option.images.length > 0)
          : [];

      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        sizes: form.sizes,
        colorOptions: normalizedColorOptions,
      };

      if (form.category === "Shoes" && normalizedColorOptions.length === 0) {
        toast.error("Add at least one shoe color with one image");
        setLoading(false);
        return;
      }

      if (form.category === "Shoes" && form.sizes.length === 0) {
        toast.error("Select at least one shoe size");
        setLoading(false);
        return;
      }

      if (isEdit) {
        await axios.put(`/api/v1/products/admin/${id}`, payload);
        toast.success("Product updated");
      } else {
        await axios.post("/api/v1/products/admin/new", payload);
        toast.success("Product created");
      }
      navigate("/admin/products");
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-page-title">
        <h1>{isEdit ? "Edit Product" : "Create New Product"}</h1>
        <button className="admin-btn secondary" onClick={() => navigate("/admin/products")}>
          <FaArrowLeft /> Back to Products
        </button>
      </div>

      <div className="product-form-container">
        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label htmlFor="name">Product Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                placeholder="Enter product description"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Pricing & Inventory</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price ($)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="stock">Stock Quantity</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select id="category" name="category" value={form.category} onChange={handleChange}>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {(form.category === "Clothing" || form.category === "Shoes") && (
            <div className="form-section">
              <h3>{form.category === "Shoes" ? "Shoe Options" : "Clothing Options"}</h3>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  {genders.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{form.category === "Shoes" ? "Available Shoe Sizes" : "Available Sizes"}</label>
                <div className="admin-size-options">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`admin-size-btn ${form.sizes.includes(size) ? "active" : ""}`}
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {form.category === "Shoes" && (
                <div className="form-group">
                  <div className="admin-color-header">
                    <label>Shoe Colors & Galleries</label>
                    <button type="button" className="admin-btn secondary small" onClick={addColorOption}>
                      Add Color
                    </button>
                  </div>
                  <div className="admin-color-options">
                    {form.colorOptions.map((option, index) => (
                      <div key={`${option.name || "color"}-${index}`} className="admin-color-card">
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor={`colorName-${index}`}>Color Name</label>
                            <input
                              id={`colorName-${index}`}
                              type="text"
                              value={option.name}
                              onChange={(e) => handleColorOptionChange(index, "name", e.target.value)}
                              placeholder="Black"
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor={`colorSwatch-${index}`}>Swatch Color</label>
                            <input
                              id={`colorSwatch-${index}`}
                              type="text"
                              value={option.swatch}
                              onChange={(e) => handleColorOptionChange(index, "swatch", e.target.value)}
                              placeholder="#111111 or black"
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label htmlFor={`colorImages-${index}`}>Image URLs (one per line)</label>
                          <textarea
                            id={`colorImages-${index}`}
                            rows={4}
                            value={(option.images || []).map((image) => image.url).filter(Boolean).join("\n")}
                            onChange={(e) => handleColorImagesChange(index, e.target.value)}
                            placeholder={`https://example.com/shoe-${index + 1}-1.jpg\nhttps://example.com/shoe-${index + 1}-2.jpg`}
                          />
                        </div>
                        <div className="admin-color-card-actions">
                          <button
                            type="button"
                            className="admin-btn danger small"
                            onClick={() => removeColorOption(index)}
                            disabled={form.colorOptions.length === 1}
                          >
                            Remove Color
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="form-section">
            <h3>Product Image</h3>
            <div className="form-group">
              <label htmlFor="imageUrl">Image URL</label>
              <div className="image-input-row">
                <input
                  type="text"
                  id="imageUrl"
                  value={form.images[0]?.url || ""}
                  onChange={handleImageChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Preview" onError={() => setPreview("")} />
              </div>
            )}
            {!preview && (
              <div className="image-placeholder">
                <FaImage />
                <span>Image preview will appear here</span>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="admin-btn secondary" onClick={() => navigate("/admin/products")}>
              Cancel
            </button>
            <button type="submit" className="admin-btn primary" disabled={loading}>
              <FaSave /> {loading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;

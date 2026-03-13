import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTimes, FaPlus, FaStar, FaSearch } from "react-icons/fa";

const Compare = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Load from sessionStorage
  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem("compareProducts") || "[]");
    if (saved.length > 0) {
      Promise.all(
        saved.map((id) => axios.get(`/api/v1/products/${id}`).then((r) => r.data.product).catch(() => null))
      ).then((results) => setProducts(results.filter(Boolean)));
    }
  }, []);

  // Save to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("compareProducts", JSON.stringify(products.map((p) => p._id)));
  }, [products]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const { data } = await axios.get(`/api/v1/products?keyword=${encodeURIComponent(searchQuery)}`);
      setSearchResults(data.products.filter((p) => !products.find((cp) => cp._id === p._id)));
    } catch {
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  const addProduct = (product) => {
    if (products.length >= 3) {
      toast.error("You can compare up to 3 products");
      return;
    }
    setProducts((prev) => [...prev, product]);
    setSearchResults((prev) => prev.filter((p) => p._id !== product._id));
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  const specRows = [
    { label: "Price", render: (p) => `$${p.price.toFixed(2)}` },
    { label: "Category", render: (p) => p.category },
    { label: "Rating", render: (p) => `${p.ratings}/5 (${p.numOfReviews} reviews)` },
    { label: "Stock", render: (p) => (p.stock > 0 ? `${p.stock} available` : "Out of Stock") },
    { label: "Gender", render: (p) => p.gender || "—" },
    { label: "Sizes", render: (p) => (p.sizes?.length ? p.sizes.join(", ") : "—") },
  ];

  return (
    <div className="compare-page">
      <h1>Compare Products</h1>

      {/* Search to add */}
      {products.length < 3 && (
        <div className="compare-search">
          <div className="compare-search-bar">
            <FaSearch />
            <input
              type="text"
              placeholder="Search for a product to compare..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch} disabled={searching}>
              {searching ? "..." : "Search"}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="compare-search-results">
              {searchResults.slice(0, 5).map((p) => (
                <div key={p._id} className="compare-search-item" onClick={() => addProduct(p)}>
                  <img src={p.images?.[0]?.url} alt={p.name} />
                  <span>{p.name}</span>
                  <FaPlus />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {products.length === 0 ? (
        <div className="empty-cart">
          <h2>No products to compare</h2>
          <p>Search and add up to 3 products to compare them side by side</p>
        </div>
      ) : (
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Feature</th>
                {products.map((p) => (
                  <th key={p._id}>
                    <button className="compare-remove" onClick={() => removeProduct(p._id)}>
                      <FaTimes />
                    </button>
                    <Link to={`/product/${p._id}`}>
                      <img src={p.images?.[0]?.url} alt={p.name} className="compare-img" />
                      <span className="compare-product-name">{p.name}</span>
                    </Link>
                  </th>
                ))}
                {products.length < 3 && (
                  <th className="compare-add-slot">
                    <div className="compare-add-placeholder">
                      <FaPlus />
                      <span>Add Product</span>
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {specRows.map((row) => (
                <tr key={row.label}>
                  <td className="compare-label">{row.label}</td>
                  {products.map((p) => (
                    <td key={p._id}>{row.render(p)}</td>
                  ))}
                  {products.length < 3 && <td>—</td>}
                </tr>
              ))}
              <tr>
                <td className="compare-label">Description</td>
                {products.map((p) => (
                  <td key={p._id} className="compare-desc">{p.description?.slice(0, 150)}...</td>
                ))}
                {products.length < 3 && <td>—</td>}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Compare;

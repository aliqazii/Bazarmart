import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const categories = ["Electronics", "Clothing", "Books", "Shoes", "Accessories", "Home", "Sports"];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/v1/products?page=${page}`;
      if (appliedSearch) url += `&keyword=${encodeURIComponent(appliedSearch)}`;
      if (categoryFilter) url += `&category=${encodeURIComponent(categoryFilter)}`;
      const { data } = await axios.get(url);
      setProducts(data.products);
      setTotal(data.productsCount);
      setTotalPages(Math.ceil(data.productsCount / data.resultsPerPage));
    } catch {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Live search (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setAppliedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`/api/v1/products/admin/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-page-title">
        <h1>Products</h1>
        <Link to="/admin/product/new" className="admin-btn primary">
          <FaPlus /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <form onSubmit={handleSearch} className="admin-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="admin-select"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <p className="admin-count">{total} products found</p>

      {loading ? (
        <div className="admin-loader">Loading...</div>
      ) : products.length === 0 ? (
        <div className="admin-empty">No products found</div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <img
                        src={p.images?.[0]?.url || "https://placehold.co/400x400/2d3436/dfe6e9/webp?text=No+Image"}
                        alt={p.name}
                        className="table-thumb"
                      />
                    </td>
                    <td className="product-name-cell">{p.name}</td>
                    <td><span className="badge badge-category">{p.category}</span></td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${p.stock <= 5 ? "badge-danger" : p.stock <= 20 ? "badge-warning" : "badge-success"}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td>{p.ratings.toFixed(1)} ★</td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/admin/product/${p._id}`} className="action-btn edit">
                          <FaEdit />
                        </Link>
                        <button onClick={() => handleDelete(p._id)} className="action-btn delete">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminProducts;

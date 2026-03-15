import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import ProductCard from "../components/ProductCard";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [debouncedKeyword, setDebouncedKeyword] = useState(searchParams.get("keyword") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [gender, setGender] = useState("");
  const [sort, setSort] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsCount, setProductsCount] = useState(0);
  const [resultsPerPage, setResultsPerPage] = useState(8);

  const categories = [
    "Electronics",
    "Clothing",
    "Books",
    "Shoes",
    "Accessories",
    "Home",
    "Sports",
  ];

  // Debounce keyword input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setCurrentPage(1);
      setProducts([]);
    }, 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Sync URL params
  useEffect(() => {
    const params = {};
    if (category) params.category = category;
    if (keyword) params.keyword = keyword;
    setSearchParams(params, { replace: true });
  }, [category, keyword, setSearchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (currentPage === 1) setLoading(true);
      else setLoadingMore(true);
      if (currentPage === 1) setErrorMsg("");
      try {
        let url = `/api/v1/products?page=${currentPage}&includeTopReviews=1`;
        if (debouncedKeyword) url += `&keyword=${encodeURIComponent(debouncedKeyword)}`;
        if (category) url += `&category=${encodeURIComponent(category)}`;
        if (gender) url += `&gender=${encodeURIComponent(gender)}`;
        if (sort) url += `&sort=${sort}`;

        const { data } = await axios.get(url);
        if (currentPage === 1) {
          setProducts(data.products);
        } else {
          setProducts((prev) => [...prev, ...data.products]);
        }
        setProductsCount(data.productsCount);
        setResultsPerPage(data.resultsPerPage);
      } catch (error) {
        const message =
          error.response?.data?.message ||
          (error.code === "ERR_NETWORK"
            ? "Cannot reach API server. Start the backend on http://localhost:5000 (and seed the DB)."
            : "Failed to fetch products");
        toast.error(message);
        if (currentPage === 1) setErrorMsg(message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    fetchProducts();
  }, [debouncedKeyword, category, gender, sort, currentPage]);

  const totalPages = Math.ceil(productsCount / resultsPerPage);
  const hasMore = currentPage < totalPages;

  const handleSearch = (e) => {
    e.preventDefault();
    setDebouncedKeyword(keyword);
    setCurrentPage(1);
    setProducts([]);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setGender("");
    setCurrentPage(1);
    setProducts([]);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setCurrentPage(1);
    setProducts([]);
  };

  return (
    <div className="products-page">
      <h1>Products</h1>

      <div className="products-filter">
        <form onSubmit={handleSearch} className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <div className="products-sort">
          <select value={sort} onChange={handleSortChange}>
            <option value="">Sort by: Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        <div className="category-filter">
          <button
            className={category === "" ? "active" : ""}
            onClick={() => handleCategoryChange("")}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={category === cat ? "active" : ""}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {category === "Clothing" && (
          <div className="gender-filter">
            <button
              className={gender === "" ? "active" : ""}
              onClick={() => {
                setGender("");
                setCurrentPage(1);
                setProducts([]);
              }}
            >
              All
            </button>
            <button
              className={gender === "Men" ? "active" : ""}
              onClick={() => {
                setGender("Men");
                setCurrentPage(1);
                setProducts([]);
              }}
            >
              Men
            </button>
            <button
              className={gender === "Women" ? "active" : ""}
              onClick={() => {
                setGender("Women");
                setCurrentPage(1);
                setProducts([]);
              }}
            >
              Women
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loader">Loading...</div>
      ) : (
        <>
          {errorMsg ? (
            <p className="no-products">{errorMsg}</p>
          ) : (
            <p className="products-count">{productsCount} products found</p>
          )}
          <div className="products-grid">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              !errorMsg && <p className="no-products">No products found</p>
            )}
          </div>

          {hasMore && (
            <div className="load-more-wrap">
              <button
                className="load-more-btn"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading..." : "Load More Products"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;

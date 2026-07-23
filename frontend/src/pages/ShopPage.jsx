import React, { useEffect, useMemo, useState } from "react";
import { shopApi } from "@/lib/api";
import { Link } from "react-router-dom";
import { ShoppingCart, Search, Star, Filter, Package } from "lucide-react";

const CATEGORIES = ["All", "Food", "Grooming", "Toys", "Accessories"];

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingId, setAddingId] = useState("");
  const [addedId, setAddedId] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);

  const load = async () => {
    try {
      setLoading(true);
      const list = await shopApi.listProducts();
      const filtered = (list || []).filter(
        (p) => !/^Sample Accessory/i.test(p?.name || "")
      );
      const deduped = Array.from(
        new Map(
          filtered.map((p) => [`${(p.name || "").toLowerCase()}|${p.price}`, p])
        ).values()
      );
      deduped.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setProducts(deduped);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        category === "All" ||
        p.category?.toLowerCase() === category.toLowerCase();
      return matchSearch && matchCat;
    });
  }, [products, search, category]);

  const addToCart = async (product) => {
    try {
      setAddingId(product._id);
      await shopApi.addToCart(product, 1);
      window.dispatchEvent(new Event("cart:updated"));
      setAddedId(product._id);
      setTimeout(() => setAddedId(""), 1500);
    } catch (e) {
      alert("Cart এ যোগ করতে হলে আগে Login করুন!");
    } finally {
      setAddingId("");
    }
  };

  const ProductImage = ({ product }) => {
    const [errored, setErrored] = useState(false);
    const src = errored ? null : product?.image;
    if (!src) {
      return (
        <div className="w-full h-44 bg-gradient-to-br from-purple-100 to-pink-100 flex flex-col items-center justify-center rounded-xl">
          <Package className="w-12 h-12 text-purple-300 mb-1" />
          <span className="text-xs text-purple-400">{product?.category}</span>
        </div>
      );
    }
    return (
      <img
        src={src}
        alt={product?.name}
        className="w-full h-44 object-cover rounded-xl"
        onError={() => setErrored(true)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              🛒 Pet Shop
            </h1>
            <p className="text-gray-500 mt-1">
              Quality products for your beloved pets
            </p>
          </div>
          <Link
            to="/shop/cart"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 py-2.5 rounded-full font-medium shadow hover:scale-105 transition-all"
          >
            <ShoppingCart className="w-4 h-4" /> View Cart
          </Link>
        </div>

        {/* Search + Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2.5 rounded-2xl text-sm font-medium border transition-all ${
                  category === cat
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white border-transparent shadow"
                    : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
                <div className="w-full h-44 bg-gray-200 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-3 bg-gray-100 rounded mb-4 w-full" />
                <div className="h-8 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-16 text-red-500">{error}</div>
        )}

        {/* No results */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">কোনো product পাওয়া যায়নি</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col overflow-hidden border border-gray-100"
              >
                <div className="p-3">
                  <ProductImage product={product} />
                </div>
                <div className="px-4 pb-4 flex flex-col flex-1">
                  {/* Category badge */}
                  <span className="text-xs font-medium text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full w-fit mb-2">
                    {product.category}
                  </span>
                  <h2 className="text-sm font-bold text-gray-800 mb-1 line-clamp-2 flex-1">
                    {product.name}
                  </h2>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.round(product.rating || 4.5)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">
                      ({product.rating || "4.5"})
                    </span>
                  </div>

                  {/* Price + Add to cart */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-purple-700">
                      ৳{product.price?.toLocaleString("bn-BD") || product.price}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={addingId === product._id}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        addedId === product._id
                          ? "bg-green-500 text-white"
                          : "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:scale-105"
                      } disabled:opacity-60`}
                    >
                      {addingId === product._id
                        ? "..."
                        : addedId === product._id
                        ? "✓ Added!"
                        : (
                          <>
                            <ShoppingCart className="w-3 h-3" /> Add
                          </>
                        )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Result count */}
        {!loading && filtered.length > 0 && (
          <p className="text-center text-sm text-gray-400 mt-8">
            {filtered.length}টি product দেখাচ্ছে
          </p>
        )}
      </div>
    </div>
  );
};

export default ShopPage;

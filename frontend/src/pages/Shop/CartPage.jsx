import React, { useEffect, useState, useMemo } from 'react';
import { shopApi } from '@/lib/api';
import { Link, useNavigate } from 'react-router-dom';

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const slugify = (s = "") => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  const SmartImage = ({ product, className }) => {
    const candidates = useMemo(() => {
      const list = [];
      const img = product?.image || "";
      if (img) list.push(img); // absolute or /products/... set from backend
      const nameSlug = slugify(product?.name || "");
      const catSlug = slugify(product?.category || "");
      const exts = ["jpg", "png", "jpeg", "webp"];
      if (nameSlug) exts.forEach((ext) => list.push(`/products/${nameSlug}.${ext}`));
      if (catSlug) exts.forEach((ext) => list.push(`/products/${catSlug}.${ext}`));
      // Product-specific placeholder based on product ID or name
      list.push(`https://via.placeholder.com/80x80/9333ea/ffffff?text=${encodeURIComponent(product?.name?.slice(0, 8) || 'Item')}`);
      return list;
    }, [product]);

    const [idx, setIdx] = useState(0);
    const src = candidates[idx] || candidates[candidates.length - 1];
    return (
      <div className={`${className} bg-gray-100 rounded overflow-hidden flex items-center justify-center`}>
        <img
          src={src}
          alt={product?.name || 'Product'}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setIdx((i) => (i < candidates.length - 1 ? i + 1 : i))}
        />
      </div>
    );
  };

  const load = async () => {
    try {
      setLoading(true);
      const c = await shopApi.getCart();
      setCart(c);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const total = cart?.items?.reduce((s, i) => s + ((i.product?.price || 0) * i.quantity), 0) || 0;

  const updateQty = async (productId, qty) => {
    try {
      const c = await shopApi.updateCart(productId, qty);
      setCart(c);
  window.dispatchEvent(new Event('cart:updated'));
    } catch (e) {
      setError(e.message);
    }
  };

  const checkout = async () => {
    try {
      const res = await shopApi.createCheckout();
      // Mock: redirect to payment URL (our frontend page)
  navigate(`/shop/payment?orderId=${res.orderId}&amount=${encodeURIComponent(res.amount || total)}`);
  window.dispatchEvent(new Event('cart:updated'));
    } catch (e) {
      setError(e.message);
    }
  };

  const clearCart = async () => {
    try {
      const c = await shopApi.clearCart();
      setCart(c);
      window.dispatchEvent(new Event('cart:updated'));
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {(!cart || cart.items.length === 0) ? (
        <div className="bg-white rounded-lg p-6 shadow">Your cart is empty. <Link className="text-purple-600" to="/shop">Go shopping</Link></div>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y">
          {cart.items.map((item, idx) => {
            const p = item.product || {};
            const pid = p._id || `local-${idx}`;
            return (
              <div className="p-4 flex items-center gap-4" key={pid}>
                <SmartImage product={p} className="w-20 h-20 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-medium">{p.name || 'Product removed'}</div>
                  <div className="text-gray-500">৳{(p.price || 0).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 bg-gray-100 rounded cursor-pointer hover:bg-gray-200" onClick={() => updateQty(p._id, item.quantity - 1)} disabled={!p._id}>-</button>
                  <span>{item.quantity}</span>
                  <button className="px-3 py-1 bg-gray-100 rounded cursor-pointer hover:bg-gray-200" onClick={() => updateQty(p._id, item.quantity + 1)} disabled={!p._id}>+</button>
                </div>
                <div className="w-24 text-right font-semibold">৳{((p.price || 0) * item.quantity).toLocaleString()}</div>
              </div>
            );
          })}
          <div className="p-4 flex justify-between font-semibold">
            <div>Total</div>
            <div>৳{total.toLocaleString()}</div>
          </div>
          <div className="p-4 flex justify-between">
            <button onClick={clearCart} className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer">Clear Cart</button>
            <button onClick={checkout} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-medium cursor-pointer hover:scale-105 transition-all">Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
}

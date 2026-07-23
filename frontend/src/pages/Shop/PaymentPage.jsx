import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { shopApi } from '@/lib/api';

export default function PaymentPage() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const amountFromQuery = params.get('amount');
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');
  const [method, setMethod] = useState('card'); // 'card' | 'bkash' | 'nagad'
  const [cart, setCart] = useState(null);
  const [countdown, setCountdown] = useState(15 * 60); // 15 minutes

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
      list.push(`https://via.placeholder.com/64x64/9333ea/ffffff?text=${encodeURIComponent(product?.name?.slice(0, 6) || 'Item')}`);
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

  const handlePay = async () => {
    try {
      const txId = `MOCK-${Date.now().toString().slice(-8)}`;
      await shopApi.paymentSuccess(orderId, txId);
      setStatus('paid');
      window.dispatchEvent(new Event('cart:updated'));
    } catch (e) {
      setError(e.message);
      setStatus('failed');
    }
  };

  const handleFail = async () => {
    try {
      await shopApi.paymentFail(orderId);
      setStatus('failed');
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    if (!orderId) navigate('/shop');
  }, [orderId, navigate]);

  // Load cart for a nicer order summary (works with backend or local fallback)
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const c = await shopApi.getCart();
        if (!ignore) setCart(c);
      } catch {
        // ignore
      }
    })();
    return () => { ignore = true; };
  }, []);

  // Session countdown
  useEffect(() => {
    const t = setInterval(() => setCountdown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const subtotal = useMemo(() => (cart?.items || []).reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0), [cart]);
  const shipping = useMemo(() => (subtotal > 0 ? 4.99 : 0), [subtotal]);
  const tax = useMemo(() => Number((subtotal * 0.05).toFixed(2)), [subtotal]); // 5% VAT (mock)
  const total = useMemo(() => {
    const q = Number(amountFromQuery || 0);
    if (!Number.isNaN(q) && q > 0) return q;
    return Number((subtotal + shipping + tax).toFixed(2));
  }, [amountFromQuery, subtotal, shipping, tax]);

  const mm = String(Math.floor(countdown / 60)).padStart(2, '0');
  const ss = String(countdown % 60).padStart(2, '0');

  return (
    <div className="min-h-[70vh] bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Secure Payment (Mock SSLCommerz)</h1>
            <p className="text-gray-500 text-sm">Order ID: <span className="font-medium text-gray-700">{orderId}</span></p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1 text-green-600 font-medium"><span role="img" aria-label="lock">🔒</span> Secured</span>
            <span className="hidden sm:inline text-gray-400">•</span>
            <span className="text-gray-600">Session expires in <span className="font-semibold">{mm}:{ss}</span></span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Payment methods & form */}
          <div className="md:col-span-2 bg-white rounded-xl shadow p-6">
            {status === 'pending' && (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { key: 'card', label: 'Debit/Credit Card' },
                    { key: 'bkash', label: 'bKash' },
                    { key: 'nagad', label: 'Nagad' },
                  ].map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setMethod(m.key)}
                      className={`px-4 py-2 rounded-full text-sm border cursor-pointer ${method === m.key ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {method === 'card' && (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Cardholder Name</label>
                        <input className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Md. Hasib" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Email</label>
                        <input type="email" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="you@example.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Card Number</label>
                      <div className="flex items-center border rounded-lg px-3 py-2">
                        <input className="flex-1 outline-none" placeholder="1234 5678 9012 3456" maxLength={19} />
                        <span className="text-gray-400 text-sm">VISA • MASTERCARD</span>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Expiry</label>
                        <input className="w-full border rounded-lg px-3 py-2" placeholder="MM/YY" maxLength={5} />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">CVV</label>
                        <input className="w-full border rounded-lg px-3 py-2" placeholder="•••" maxLength={3} />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">ZIP/Postal</label>
                        <input className="w-full border rounded-lg px-3 py-2" placeholder="1207" />
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                      <span role="img" aria-label="lock">🔐</span>
                      <p>Your card details are encrypted and processed securely. This is a mock gateway for demo purposes only.</p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <button onClick={handleFail} className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                      <button onClick={handlePay} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-medium cursor-pointer hover:scale-105 transition-all">Pay {total > 0 ? `$${Number(total).toFixed(2)}` : ''}</button>
                    </div>
                  </div>
                )}

                {method === 'bkash' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">bKash Number</label>
                      <input className="w-full border rounded-lg px-3 py-2" placeholder="01XXXXXXXXX" maxLength={11} />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <button onClick={handleFail} className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                      <button onClick={handlePay} className="bg-[#E2136E] hover:brightness-110 text-white px-6 py-2 rounded-full font-medium cursor-pointer">Pay with bKash</button>
                    </div>
                  </div>
                )}

                {method === 'nagad' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Nagad Number</label>
                      <input className="w-full border rounded-lg px-3 py-2" placeholder="01XXXXXXXXX" maxLength={11} />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <button onClick={handleFail} className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                      <button onClick={handlePay} className="bg-[#F7941D] hover:brightness-110 text-white px-6 py-2 rounded-full font-medium cursor-pointer">Pay with Nagad</button>
                    </div>
                  </div>
                )}
              </>
            )}

            {status === 'paid' && (
              <div className="text-center py-10">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">✅</div>
                <h2 className="text-xl font-semibold text-green-700 mb-2">Payment Successful</h2>
                <p className="text-gray-600 mb-6">Thank you! Your order has been paid.</p>
                <Link to="/shop" className="text-purple-600 font-medium">Back to shop</Link>
              </div>
            )}

            {status === 'failed' && (
              <div className="text-center py-10">
                <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">❌</div>
                <h2 className="text-xl font-semibold text-red-700 mb-2">Payment Failed</h2>
                <p className="text-gray-600 mb-6">Your payment did not go through. Please try again.</p>
                <Link to="/shop" className="text-purple-600 font-medium">Back to shop</Link>
              </div>
            )}

            {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-xl shadow p-6 h-max">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3 max-h-[320px] overflow-auto pr-1">
              {(cart?.items || []).length === 0 && (
                <div className="text-sm text-gray-500">No items found. If you already created the order, this section is for visual reference only.</div>
              )}
              {(cart?.items || []).map((i, idx) => (
                <div key={(i.product?._id) || idx} className="flex items-center gap-3">
                  <SmartImage product={i.product} className="w-14 h-14 object-cover rounded" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{i.product?.name || 'Product'}</div>
                    <div className="text-xs text-gray-500">Qty {i.quantity}</div>
                  </div>
                  <div className="text-sm font-semibold">${(((i.product?.price || 0) * i.quantity).toFixed(2))}</div>
                </div>
              ))}
            </div>
            <div className="my-4 border-t" />
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span className="font-medium">${shipping.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">VAT (5%)</span><span className="font-medium">${tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-base pt-2"><span className="font-semibold">Total Due</span><span className="font-bold">${Number(total).toFixed(2)}</span></div>
            </div>
            <div className="mt-4 text-[11px] text-gray-500">
              By proceeding, you agree to our Terms & Refund Policy. Transactions are processed by the mock SSLCommerz gateway.
            </div>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-500">
              <span role="img" aria-label="shield">🛡️</span><span>PCI DSS compliant</span>
              <span className="text-gray-300">•</span>
              <span>3D Secure</span>
              <span className="text-gray-300">•</span>
              <span>Fraud protection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

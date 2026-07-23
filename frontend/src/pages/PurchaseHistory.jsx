import React, { useEffect, useState } from "react";
import axios from "axios";

const PurchaseHistory = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Please log in to view purchase history.");
                    setLoading(false);
                    return;
                }

                const response = await axios.get("http://localhost:7000/shop/purchase-history", {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setPurchases(response.data);
            } catch (err) {
                console.error("Purchase history error:", err);
                if (err.response?.status === 401) {
                    setError("Please log in to view purchase history.");
                } else {
                    setError("Failed to load purchase history.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchPurchases();
    }, []);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return '#28a745';
            case 'pending': return '#ffc107';
            case 'failed': return '#dc3545';
            case 'cancelled': return '#6c757d';
            default: return '#6c757d';
        }
    };

    const getStatusText = (status) => {
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    };

    return (
        <div style={{ 
            padding: "2rem", 
            maxWidth: "1200px", 
            margin: "0 auto",
            backgroundColor: "#f8f9fa",
            minHeight: "100vh"
        }}>
            <div style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "10px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
            }}>
                <h2 style={{ 
                    margin: "0 0 2rem 0", 
                    color: "#333",
                    borderBottom: "3px solid #007bff",
                    paddingBottom: "1rem"
                }}>
                    Purchase History
                </h2>
                
                {loading ? (
                    <div style={{ textAlign: "center", padding: "3rem" }}>
                        <div style={{
                            border: "4px solid #f3f3f3",
                            borderTop: "4px solid #007bff",
                            borderRadius: "50%",
                            width: "40px",
                            height: "40px",
                            animation: "spin 1s linear infinite",
                            margin: "0 auto 1rem"
                        }}></div>
                        <p>Loading your purchase history...</p>
                    </div>
                ) : error ? (
                    <div style={{ 
                        textAlign: "center", 
                        padding: "3rem",
                        backgroundColor: "#f8d7da",
                        color: "#721c24",
                        borderRadius: "8px",
                        border: "1px solid #f5c6cb"
                    }}>
                        <h3>⚠️ {error}</h3>
                    </div>
                ) : purchases.length === 0 ? (
                    <div style={{ 
                        textAlign: "center", 
                        padding: "3rem",
                        backgroundColor: "#e2e3e5",
                        color: "#383d41",
                        borderRadius: "8px"
                    }}>
                        <h3>📦 No purchases yet</h3>
                        <p>When you make your first purchase, it will appear here.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {purchases.map((order, idx) => (
                            <div key={order._id || idx} style={{
                                border: "1px solid #dee2e6",
                                borderRadius: "12px",
                                backgroundColor: "white",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                overflow: "hidden",
                                transition: "transform 0.2s ease, box-shadow 0.2s ease"
                            }}>
                                {/* Order Header */}
                                <div style={{
                                    backgroundColor: "#f8f9fa",
                                    padding: "1rem 1.5rem",
                                    borderBottom: "1px solid #dee2e6",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    gap: "1rem"
                                }}>
                                    <div>
                                        <h3 style={{ margin: "0", color: "#495057", fontSize: "1.1rem" }}>
                                            Order #{idx + 1}
                                        </h3>
                                        <p style={{ margin: "0.25rem 0 0 0", color: "#6c757d", fontSize: "0.9rem" }}>
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'Unknown date'}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{
                                            padding: "0.4rem 0.8rem",
                                            borderRadius: "20px",
                                            backgroundColor: getStatusColor(order.status),
                                            color: "white",
                                            fontSize: "0.85rem",
                                            fontWeight: "600",
                                            marginBottom: "0.5rem"
                                        }}>
                                            {getStatusText(order.status)}
                                        </div>
                                        <div style={{
                                            fontSize: "1.2rem",
                                            fontWeight: "bold",
                                            color: "#28a745"
                                        }}>
                                            ${order.total ? order.total.toFixed(2) : '0.00'}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div style={{ padding: "1.5rem" }}>
                                    <h4 style={{ 
                                        margin: "0 0 1rem 0", 
                                        color: "#495057",
                                        fontSize: "1rem",
                                        borderBottom: "1px solid #e9ecef",
                                        paddingBottom: "0.5rem"
                                    }}>
                                        Items Purchased ({order.items?.length || 0})
                                    </h4>
                                    
                                    {order.items && order.items.length > 0 ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                            {order.items.map((item, itemIdx) => (
                                                <div key={itemIdx} style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    padding: "1rem",
                                                    backgroundColor: "#f8f9fa",
                                                    borderRadius: "8px",
                                                    border: "1px solid #e9ecef"
                                                }}>
                                                    {/* Product Image */}
                                                    <div style={{
                                                        width: "60px",
                                                        height: "60px",
                                                        borderRadius: "8px",
                                                        backgroundColor: "#dee2e6",
                                                        marginRight: "1rem",
                                                        overflow: "hidden",
                                                        flexShrink: 0
                                                    }}>
                                                        {item.image ? (
                                                            <img 
                                                                src={item.image} 
                                                                alt={item.name || 'Product'} 
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    objectFit: "cover"
                                                                }}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            display: item.image ? "none" : "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            color: "#6c757d",
                                                            fontSize: "0.8rem"
                                                        }}>
                                                            📦
                                                        </div>
                                                    </div>

                                                    {/* Product Details */}
                                                    <div style={{ flex: 1 }}>
                                                        <h5 style={{ 
                                                            margin: "0 0 0.25rem 0", 
                                                            color: "#495057",
                                                            fontSize: "1rem"
                                                        }}>
                                                            {item.name || 'Unknown Product'}
                                                        </h5>
                                                        <div style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "1rem",
                                                            fontSize: "0.9rem",
                                                            color: "#6c757d"
                                                        }}>
                                                            <span>Qty: {item.quantity || 1}</span>
                                                            <span>•</span>
                                                            <span>Price: ${item.price ? item.price.toFixed(2) : '0.00'}</span>
                                                            <span>•</span>
                                                            <span style={{ 
                                                                fontWeight: "600", 
                                                                color: "#495057" 
                                                            }}>
                                                                Total: ${item.price && item.quantity ? (item.price * item.quantity).toFixed(2) : '0.00'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ 
                                            color: "#6c757d", 
                                            fontStyle: "italic",
                                            textAlign: "center",
                                            padding: "1rem"
                                        }}>
                                            No items found for this order
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* CSS Animation for loading spinner */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .order-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.12);
                }
            `}</style>
        </div>
    );
};

export default PurchaseHistory;

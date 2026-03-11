import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { paymentService } from '../services/api';

const Cart = () => {
    const { cart, removeFromCart, getCartTotal, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    // Redirect admins away from the cart
    useEffect(() => {
        if (user?.role === 'admin') {
            navigate('/courses');
        }
    }, [user, navigate]);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleCheckout = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (cart.length === 0) return;

        setIsProcessing(true);

        try {
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                alert("Razorpay SDK failed to load. Are you online?");
                setIsProcessing(false);
                return;
            }

            const totalAmount = getCartTotal();

            // 1. Create order on our backend
            const orderRes = await paymentService.createOrder({ amount: totalAmount });

            if (!orderRes.data.success) {
                throw new Error("Order creation failed");
            }

            // 2. Open Razorpay Checkout modal
            const options = {
                key: 'rzp_test_mock_id', // Replace with your key in production if not relying on backend injection
                amount: orderRes.data.order.amount,
                currency: orderRes.data.order.currency,
                name: "Online Learning Platform",
                description: `Purchasing ${cart.length} course(s)`,
                order_id: orderRes.data.order.id,
                handler: async function (response) {
                    // 3. Verify Payment
                    try {
                        const verifyRes = await paymentService.verifyPayment({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            courseIds: cart.map(c => c._id || c.id)
                        });

                        if (verifyRes.data.success) {
                            alert("Payment successful! Courses added to your account.");
                            clearCart();
                            // Force reload auth state if needed, or just redirect
                            navigate('/my-courses');
                        } else {
                            alert("Payment verification failed. Please contact support.");
                        }
                    } catch (err) {
                        alert("Payment verification error.");
                    }
                },
                prefill: {
                    name: user.username || user.name || "",
                    email: user.email || "",
                },
                theme: {
                    color: "#4f46e5"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            console.error(err);
            alert("Error initiating checkout");
        } finally {
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '10vh', padding: '4rem 2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
                <h2 style={{ fontSize: '2rem', color: '#1e293b', marginBottom: '0.5rem' }}>Your Cart is Empty</h2>
                <p style={{ margin: '1rem 0 2rem 0', color: '#64748b', fontSize: '1.1rem' }}>Looks like you haven't added any courses yet. keep shopping to find a course!</p>
                <Link to="/courses" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>Browse Courses</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#0f172a' }}>Shopping Cart</h1>
            <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2rem' }}>
                {cart.length} Course{cart.length > 1 ? 's' : ''} in Cart
            </p>

            <div style={{ display: 'flex', gap: '3rem', flexDirection: window.innerWidth > 768 ? 'row' : 'column' }}>
                {/* Cart Items List */}
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {cart.map((course) => (
                        <div key={course._id || course.id} style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1.5rem',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                            border: '1px solid #e2e8f0',
                            transition: 'transform 0.2s',
                        }}>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                {/* Optional Thumbnail placeholder */}
                                <div style={{
                                    width: '120px',
                                    height: '80px',
                                    backgroundColor: '#f1f5f9',
                                    borderRadius: '8px',
                                    backgroundImage: `url(${course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    flexShrink: 0
                                }}></div>

                                <div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#1e293b' }}>{course.title}</h3>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                                        Instructor: <span style={{ color: '#3b82f6', fontWeight: '500' }}>{course.instructor?.username || 'Expert'}</span>
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#0f172a' }}>
                                    ₹{course.price}
                                </span>
                                <button
                                    onClick={() => removeFromCart(course._id || course.id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#fef2f2'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary Checkout Panel */}
                <div style={{ flex: 1 }}>
                    <div style={{
                        position: 'sticky',
                        top: '2rem',
                        padding: '2rem',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                            Order Summary
                        </h3>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#64748b' }}>
                            <span>Original Price:</span>
                            <span>₹{getCartTotal()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: '#10b981' }}>
                            <span>Discounts:</span>
                            <span>-₹0</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginBottom: '2rem' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>Total:</span>
                            <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px' }}>
                                ₹{getCartTotal()}
                            </span>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1.1rem',
                                backgroundColor: '#4f46e5',
                                transition: 'background-color 0.2s, transform 0.1s'
                            }}
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            onMouseOver={(e) => !isProcessing && (e.target.style.backgroundColor = '#4338ca')}
                            onMouseOut={(e) => !isProcessing && (e.target.style.backgroundColor = '#4f46e5')}
                            onMouseDown={(e) => !isProcessing && (e.target.style.transform = 'scale(0.98)')}
                            onMouseUp={(e) => !isProcessing && (e.target.style.transform = 'scale(1)')}
                        >
                            {isProcessing ? 'Processing Payment...' : 'Proceed to Checkout'}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem' }}>
                            Secure 256-bit SSL encryption.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;

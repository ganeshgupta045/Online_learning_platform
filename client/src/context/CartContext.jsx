import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from '../services/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);

    const [cart, setCart] = useState(() => {
        const savedCart = sessionStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Sync from server when user logs in
    useEffect(() => {
        if (user && user.cart && Array.isArray(user.cart)) {
            // Overwrite local cart with server cart upon login
            setCart(user.cart);
        } else if (!user) {
            setCart([]); // Clear cart entirely on logout to prevent state leaks
        }
    }, [user]);

    // Whenever cart changes, save it to sessionStorage and backend
    useEffect(() => {
        sessionStorage.setItem('cart', JSON.stringify(cart));

        // Sync to backend if logged in
        if (user) {
            const cartIds = cart.map(item => item._id || item.id);
            authService.saveCart({ cartIds }).catch(err => console.error("Cart sync failed", err));
        }
    }, [cart, user]);

    const addToCart = (course) => {
        // Check if it's already in the cart
        const isAlreadyInCart = cart.some(item => (item._id || item.id) === (course._id || course.id));
        if (!isAlreadyInCart) {
            setCart([...cart, course]);
        }
    };

    const removeFromCart = (courseId) => {
        setCart(cart.filter(item => (item._id || item.id) !== courseId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartTotal = () => {
        return cart.reduce((total, course) => total + (course.price || 0), 0);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getCartTotal }}>
            {children}
        </CartContext.Provider>
    );
};

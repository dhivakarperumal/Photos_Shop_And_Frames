import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../PrivateRouter/StoreContext";

/**
 * Cart Route Component.
 * The cart is now an interactive global slide-out sidebar drawer.
 * Visiting /cart opens the Cart Sidebar drawer and redirects to /shop.
 */
const Cart = () => {
  const { openCart } = useContext(StoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (openCart) {
      openCart();
    }
    navigate("/shop", { replace: true });
  }, [openCart, navigate]);

  return null;
};

export default Cart;

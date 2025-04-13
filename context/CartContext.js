'use client'

import { createContext, useContext, useState, useEffect } from 'react'

// Create context
const CartContext = createContext({
  cartItems: [],
  addToCart: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  isCartOpen: false,
  toggleCart: () => {},
  cartCount: 0,
  cartTotal: 0
})

// Context provider
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [cartTotal, setCartTotal] = useState(0)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        setCartItems(parsedCart)
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
    }
  }, [])

  // Update localStorage and cart stats when cartItems change
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems))
      
      // Update cart count and total
      const count = cartItems.reduce((total, item) => total + item.quantity, 0)
      const price = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
      
      setCartCount(count)
      setCartTotal(price)
    } catch (error) {
      console.error("Error updating cart:", error)
    }
  }, [cartItems])

  // Add product to cart
  const addToCart = async (product) => {
    try {
      setCartItems(prevItems => {
        // Check if product is already in cart
        const existingItem = prevItems.find(item => item.id === product.id)
        
        if (existingItem) {
          // If product exists, increase quantity
          return prevItems.map(item => 
            item.id === product.id 
              ? { ...item, quantity: item.quantity + 1 } 
              : item
          )
        } else {
          // If product doesn't exist, add it with quantity 1
          return [...prevItems, { ...product, quantity: 1 }]
        }
      })
      
      // Open cart when adding items
      setIsCartOpen(true)
      
      // Return success
      return { success: true }
    } catch (error) {
      console.error("Error adding to cart:", error)
      return { success: false, error: error.message }
    }
  }

  // Remove product from cart
  const removeFromCart = async (productId) => {
    try {
      setCartItems(prevItems => {
        // Find the product
        const existingItem = prevItems.find(item => item.id === productId)
        
        if (existingItem && existingItem.quantity > 1) {
          // If quantity > 1, decrease quantity
          return prevItems.map(item => 
            item.id === productId 
              ? { ...item, quantity: item.quantity - 1 } 
              : item
          )
        } else {
          // If quantity is 1, remove item
          return prevItems.filter(item => item.id !== productId)
        }
      })
      
      return { success: true }
    } catch (error) {
      console.error("Error removing from cart:", error)
      return { success: false, error: error.message }
    }
  }

  // Clear cart
  const clearCart = async () => {
    try {
      setCartItems([])
      return { success: true }
    } catch (error) {
      console.error("Error clearing cart:", error)
      return { success: false, error: error.message }
    }
  }

  // Toggle cart visibility
  const toggleCart = () => {
    setIsCartOpen(prev => !prev)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        isCartOpen,
        toggleCart,
        cartCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Custom hook to use the cart context
export function useCart() {
  const context = useContext(CartContext)
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  
  return context
} 
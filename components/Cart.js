'use client'

import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useWallet } from '../context/WalletContext'
import { useRouter } from 'next/navigation'

export default function Cart() {
  const { 
    cartItems, 
    removeFromCart, 
    clearCart, 
    isCartOpen, 
    toggleCart, 
    cartTotal 
  } = useCart()
  const { address, isConnected, connectWallet } = useWallet()
  const [checkoutState, setCheckoutState] = useState('idle') // idle, processing, success, error
  const router = useRouter()

  // Format price with currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  // Handle checkout process
  const handleCheckout = async () => {
    if (!isConnected) {
      await connectWallet()
      return
    }

    try {
      setCheckoutState('processing')
      
      // Simulate checkout process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Store purchased items in localStorage for transaction history
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]')
      
      // Convert cart items to transactions
      const newTransactions = cartItems.map(item => ({
        id: `tx-${Date.now()}-${item.id}`,
        name: item.title,
        image: item.image,
        price: `${item.price.toFixed(3)} ETH`,
        timestamp: Date.now(),
        type: item.hasOwnProperty('isLimited') && item.isLimited ? 'nft' : 'physical',
        txHash: '0x' + Math.random().toString(16).substr(2, 64),
        nftId: item.hasOwnProperty('isLimited') && item.isLimited ? 
          Math.floor(Math.random() * 10000) + 100000 : null
      }))
      
      // Add new transactions to the existing ones
      localStorage.setItem('transactions', JSON.stringify([...transactions, ...newTransactions]))
      
      setCheckoutState('success')
      
      // Clear cart after successful checkout
      await clearCart()
      
      // Close cart and navigate to transaction feed after delay
      setTimeout(() => {
        toggleCart()
        setCheckoutState('idle')
        router.push('/feed')
      }, 2000)
      
    } catch (error) {
      console.error("Checkout error:", error)
      setCheckoutState('error')
      
      // Reset checkout state after delay
      setTimeout(() => {
        setCheckoutState('idle')
      }, 3000)
    }
  }

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isCartOpen && e.target.id === 'cart-backdrop') {
        toggleCart()
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isCartOpen, toggleCart])

  if (!isCartOpen) return null

  return (
    <div 
      id="cart-backdrop"
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end"
    >
      <div className="w-full max-w-md bg-black border-l border-gray-800 h-full transform animate-slide-in">
        {/* Cart header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Your Cart</h2>
          <button 
            onClick={toggleCart}
            className="text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4 max-h-[calc(100vh-180px)]">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-lg">Your cart is empty</p>
              <button 
                onClick={toggleCart}
                className="mt-4 text-blue-500 hover:text-blue-400"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="bg-gray-900 rounded-xl overflow-hidden flex">
                  <div className="w-24 h-24 relative flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                    {item.hasOwnProperty('isLimited') && item.isLimited && (
                      <div className="absolute top-1 right-1 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                        NFT
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-white line-clamp-1">{item.title}</h3>
                      <span className="text-white font-semibold">{formatPrice(item.price)}</span>
                    </div>
                    <div className="mt-1 text-gray-400 text-sm line-clamp-1">{item.seller}</div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center">
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-800 rounded-full text-gray-400 hover:bg-gray-700"
                        >
                          -
                        </button>
                        <span className="mx-2 text-white">{item.quantity}</span>
                        <button 
                          onClick={() => addToCart(item)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-800 rounded-full text-gray-400 hover:bg-gray-700"
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 text-sm hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart footer */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-gray-800">
            <div className="flex justify-between mb-4">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white font-bold">{formatPrice(cartTotal)}</span>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={checkoutState === 'processing'}
              className={`w-full py-3 rounded-lg font-bold text-white ${
                checkoutState === 'processing' 
                  ? 'bg-gray-700' 
                  : 'bg-gradient-to-r from-[#FF005C] to-[#FF7A00] hover:opacity-90'
              } transition-colors relative`}
            >
              {checkoutState === 'idle' && 'Checkout'}
              {checkoutState === 'processing' && (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              )}
              {checkoutState === 'success' && (
                <div className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Success!
                </div>
              )}
              {checkoutState === 'error' && 'Try Again'}
            </button>
            
            {cartItems.length > 0 && checkoutState === 'idle' && (
              <button
                onClick={clearCart}
                className="w-full mt-2 py-2 bg-transparent border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-900 transition-colors"
              >
                Clear Cart
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 
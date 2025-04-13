'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '../context/WalletContext'
import { useRouter } from 'next/navigation'
import { useCart } from '../context/CartContext'
import Login from '../components/Login'
import ProductFeed from '../components/ProductFeed'
import ProfileBadge from '../components/ProfileBadge'
import Notifications from '../components/Notifications'
import Cart from '../components/Cart'

export default function Home() {
  const { address, isConnected } = useWallet()
  const { cartCount, toggleCart } = useCart()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-black">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-white bg-gradient-to-r from-[#FF005C] to-[#FF7A00] bg-clip-text text-transparent">ShopTok</h1>
          <p className="text-xl text-gray-300">Loading the future of social shopping...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-black text-white">
      {!isConnected ? (
        <Login />
      ) : (
        <div className="w-full max-w-md h-screen relative">
          <div className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-b from-black to-transparent h-24 pointer-events-none"></div>
          <div className="fixed top-0 left-0 right-0 z-40 px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FF005C] to-[#FF7A00] bg-clip-text text-transparent">ShopTok</h1>
            <div className="flex items-center gap-3">
              {/* Cart Button */}
              <button 
                className="relative"
                onClick={toggleCart}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-[#FF005C] to-[#FF7A00] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <Notifications />
              <ProfileBadge address={address} />
            </div>
          </div>
          <ProductFeed />
          
          {/* Cart Component */}
          <Cart />
          
          {/* Transaction Feed Button */}
          <button 
            onClick={() => router.push('/feed')}
            className="fixed bottom-24 right-6 z-40 bg-gradient-to-r from-[#FF005C] to-[#FF7A00] rounded-full p-3 shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
          
          <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black to-transparent h-24 pointer-events-none"></div>
        </div>
      )}
    </main>
  )
} 
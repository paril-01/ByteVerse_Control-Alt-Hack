'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfileBadge({ address }) {
  const [showBadges, setShowBadges] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const router = useRouter()
  
  // Mock NFT badges (in production these would come from the ERC-6551 contract)
  const badges = [
    {
      id: 1,
      name: 'ShopTok Member',
      image: 'https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      description: 'Founding member of ShopTok',
      rarity: 'Common',
    },
    {
      id: 2,
      name: 'Smart Shopper',
      image: 'https://images.unsplash.com/photo-1620428268482-cf1851a383aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      description: 'Purchased first item',
      rarity: 'Common',
    },
    {
      id: 3,
      name: 'Trend Setter',
      image: 'https://images.unsplash.com/photo-1573215176232-aae4bc470dce?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      description: 'First to discover trending item',
      rarity: 'Rare',
    }
  ]
  
  // Mock purchase history
  const purchaseHistory = [
    {
      id: 1,
      name: 'Eco-Friendly Water Bottle',
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      date: '2 days ago',
      price: '$24.99',
      nftId: 'NFT #1234'
    },
    {
      id: 2,
      name: 'Wireless Earbuds',
      image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f37?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      date: '5 days ago',
      price: '$89.99',
      nftId: 'NFT #1235'
    }
  ]
  
  const truncateAddress = (address) => {
    if (!address) return ''
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }
  
  const toggleBadges = () => {
    setShowBadges(!showBadges)
    setShowProfile(false)
  }

  const toggleProfile = () => {
    setShowProfile(!showProfile)
    setShowBadges(false)
  }

  const navigateToProfile = () => {
    router.push('/profile')
    setShowProfile(false)
  }

  return (
    <div className="relative">
      <button 
        onClick={toggleProfile} 
        className="flex items-center gap-2 bg-gray-800 text-white py-1 px-2 rounded-full hover:bg-gray-700"
      >
        <div className="relative">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#FF005C] to-[#FF7A00] flex items-center justify-center">
            {address && address.charAt(2).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold">
            {badges.length}
          </div>
        </div>
        <span className="text-xs hidden sm:block">{truncateAddress(address)}</span>
      </button>
      
      {/* Badges Popup */}
      {showBadges && (
        <div className="absolute right-0 mt-2 w-80 bg-black rounded-xl shadow-lg z-50 p-4 border border-gray-800">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-white">Your NFT Badges</h3>
            <button 
              onClick={toggleBadges}
              className="text-gray-500 hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {badges.map(badge => (
              <div key={badge.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-800 relative">
                  <img 
                    src={badge.image} 
                    alt={badge.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <h4 className="text-xs font-medium text-white">{badge.name}</h4>
                    <div className="flex items-center mt-1">
                      <span className="text-xs bg-blue-500 text-white px-1 rounded">{badge.rarity}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center flex-col p-2 rounded-lg">
                  <p className="text-xs text-white text-center">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Profile Popup */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={toggleProfile}>
          <div className="w-full max-w-md bg-black rounded-xl shadow-lg p-6 border border-gray-800" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Your Profile</h2>
              <button onClick={toggleProfile} className="text-gray-500 hover:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center mb-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-[#FF005C] to-[#FF7A00] flex items-center justify-center text-4xl text-white">
                  {address && address.charAt(2).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-black flex items-center justify-center text-xs font-bold">
                  {badges.length}
                </div>
              </div>
              <div className="ml-4">
                <div className="text-white font-medium">{truncateAddress(address)}</div>
                <div className="text-gray-400 text-sm">Member since Mar 2023</div>
                <div className="mt-2 flex space-x-4">
                  <div className="text-center">
                    <div className="text-white font-bold">{purchaseHistory.length}</div>
                    <div className="text-gray-400 text-xs">Purchases</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold">87</div>
                    <div className="text-gray-400 text-xs">Reputation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold">0</div>
                    <div className="text-gray-400 text-xs">Followers</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-white">Your Badges</h3>
                <button 
                  onClick={toggleBadges}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  View All
                </button>
              </div>
              <div className="flex space-x-2">
                {badges.slice(0, 3).map(badge => (
                  <div key={badge.id} className="w-12 h-12 rounded-lg overflow-hidden">
                    <img 
                      src={badge.image} 
                      alt={badge.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-white mb-3">Purchase History</h3>
              <div className="space-y-4">
                {purchaseHistory.map(item => (
                  <div key={item.id} className="flex items-center bg-gray-900 rounded-lg p-3">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="h-14 w-14 rounded-md object-cover"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-white text-sm font-medium">{item.name}</div>
                          <div className="text-gray-400 text-xs">{item.date}</div>
                        </div>
                        <div className="text-white text-sm">{item.price}</div>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <div className="text-purple-400 text-xs">{item.nftId}</div>
                        <button className="bg-gray-800 text-white text-xs px-2 py-1 rounded hover:bg-gray-700">
                          Resell
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={navigateToProfile}
                className="w-full mt-4 py-2 bg-gradient-to-r from-[#FF005C] to-[#FF7A00] text-white rounded-lg text-sm font-medium"
              >
                View Full Profile
              </button>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-800 text-center text-xs text-gray-500">
              Connected via Smart Wallet • Powered by Base
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
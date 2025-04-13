'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BackIcon, HeartIcon, ShareIcon, HomeIcon, PlusIcon, UserIcon } from '../../components/Icons'

export default function UserProfile() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('purchases')
  const [stats, setStats] = useState({
    totalSpent: 0,
    purchaseCount: 0,
    nftCount: 0
  })
  const router = useRouter()

  // Mock user data
  const user = {
    address: localStorage?.getItem('walletAddress') || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    username: '@basemaxi',
    bio: 'Collecting the future on Base 💙',
    joinDate: 'March 2023'
  }

  useEffect(() => {
    // Fetch transaction data from local storage
    const fetchTransactions = async () => {
      setLoading(true)
      try {
        // In a real app, we would fetch this from an API
        // For now, we'll check localStorage or use mock data
        const storedTx = localStorage.getItem('transactions')
        let txData = []
        
        if (storedTx) {
          txData = JSON.parse(storedTx)
        } else {
          // Mock transaction data
          txData = [
            {
              id: '0x123...abc1',
              name: 'Base Penguin #4291',
              image: 'https://i.seadn.io/gcs/files/2677b9a8c5b72c3915defb75d10a4ffa.png',
              price: '0.042 ETH',
              timestamp: Date.now() - 86400000 * 2,
              type: 'nft',
              txHash: '0x8cb8fcda9c5db86af01087448c2393a3be81d9ba62c5af7c1d08fe678df156c7'
            },
            {
              id: '0x123...abc2',
              name: 'Base Hoodie',
              image: 'https://pbs.twimg.com/media/F8Cv2QgW0AAkdJJ?format=jpg',
              price: '0.085 ETH',
              timestamp: Date.now() - 86400000 * 5,
              type: 'physical',
              txHash: '0xa1c30daa31e6d40a01c3e9d2b8e758d1c2ebd8c33d6cf731ea2cf0a94935cf47'
            },
            {
              id: '0x123...abc3',
              name: 'Base Cap',
              image: 'https://pbs.twimg.com/media/F8CxkRZXEAA3n-V?format=jpg',
              price: '0.065 ETH',
              timestamp: Date.now() - 86400000 * 12,
              type: 'physical',
              txHash: '0x7b8e1c7f8d5e2a3b41e09c7a6d5f1e3a2d5f1e3a2d5f1e3a2d5f1e3a2d5f1e3a'
            },
            {
              id: '0x123...abc4',
              name: 'Base Day 1 Badge',
              image: 'https://nfts.coinbase.com/tokens/13598/0/nftstorage/4a33b57b7b3fa08f6a2aca049db246ccf7ef1d23643cf9d1dbb98c4c9ffdc8d6.webp',
              price: '0.001 ETH',
              timestamp: Date.now() - 86400000 * 30,
              type: 'nft',
              txHash: '0x5d2f8e1c7f8d5e2a3b41e09c7a6d5f1e3a2d5f1e3a2d5f1e3a2d5f1e3a2d5f1e'
            }
          ]
        }
        
        setTransactions(txData)
        
        // Calculate stats
        const total = txData.reduce((sum, tx) => sum + parseFloat(tx.price.split(' ')[0]), 0)
        const nfts = txData.filter(tx => tx.type === 'nft').length
        
        setStats({
          totalSpent: total.toFixed(3),
          purchaseCount: txData.length,
          nftCount: nfts
        })
        
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTransactions()
  }, [])

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000) // diff in seconds
    
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
    
    return date.toLocaleDateString()
  }

  const shortenHash = (hash) => {
    return hash.substring(0, 6) + '...' + hash.substring(hash.length - 4)
  }
  
  const handleBack = () => {
    router.push('/')
  }
  
  const handleTransactionClick = (txHash) => {
    // Open BaseScan in a new tab
    window.open(`https://sepolia.basescan.org/tx/${txHash}`, '_blank')
  }
  
  const viewNFTReceipt = (transaction) => {
    // Show receipt modal
    window.alert(`NFT Receipt for ${transaction.name}`)
  }

  const getNftCount = () => {
    return transactions.filter(tx => tx.type === 'nft').length
  }

  const renderTabContent = () => {
    switch(activeTab) {
      case 'purchases':
        return (
          <div className="grid grid-cols-1 gap-4 mt-4">
            {transactions.length === 0 && !loading ? (
              <div className="text-center text-gray-500 py-8">
                No purchases yet
              </div>
            ) : (
              transactions.map(tx => (
                <div 
                  key={tx.id} 
                  className="bg-gray-900 rounded-xl overflow-hidden"
                  onClick={() => handleTransactionClick(tx.txHash)}
                >
                  <div className="flex items-center p-4 cursor-pointer hover:bg-gray-800 transition">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={tx.image} className="w-full h-full object-cover" alt={tx.name} />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-white">{tx.name}</h3>
                        <span className="text-white font-semibold">{tx.price}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-400 text-sm">{formatTimestamp(tx.timestamp)}</span>
                        {tx.type === 'nft' && (
                          <button 
                            className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              viewNFTReceipt(tx)
                            }}
                          >
                            View Receipt
                          </button>
                        )}
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">
                          {shortenHash(tx.txHash)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )
      case 'nfts':
        return (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {transactions.filter(tx => tx.type === 'nft').length === 0 ? (
              <div className="text-center text-gray-500 py-8 col-span-2">
                No NFTs yet
              </div>
            ) : (
              transactions.filter(tx => tx.type === 'nft').map(tx => (
                <div key={tx.id} className="relative">
                  <div className="aspect-square rounded-xl overflow-hidden">
                    <img src={tx.image} className="w-full h-full object-cover" alt={tx.name} />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 bg-black/70 p-2 rounded-lg">
                    <h3 className="font-medium text-white text-sm">{tx.name}</h3>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-300 text-xs">{tx.price}</span>
                      <span className="text-gray-400 text-xs">{formatTimestamp(tx.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )
      case 'liked':
        return (
          <div className="text-center text-gray-500 py-16">
            Items you like will appear here
          </div>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-black text-white">
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <button onClick={handleBack} className="text-white">
          <BackIcon className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Profile</h1>
        <div className="w-6"></div>
      </div>
      
      {/* Profile Info */}
      <div className="p-4">
        <div className="flex items-start">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gradient-to-r from-[#FF005C] to-[#FF7A00] flex items-center justify-center text-4xl">
              {user.address && user.address.charAt(2).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-black flex items-center justify-center text-xs font-bold">
              {getNftCount()}
            </div>
          </div>
          
          <div className="ml-4 flex-1">
            <h2 className="text-xl font-bold">{user.username}</h2>
            <p className="text-gray-400 text-sm mb-2 truncate">{user.address}</p>
            <p className="text-sm text-gray-300">{user.bio}</p>
            <p className="text-gray-500 text-xs">Member since {user.joinDate}</p>
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <div className="text-center flex-1">
            <p className="text-2xl font-bold">{stats.totalSpent}</p>
            <p className="text-gray-400 text-xs">ETH Spent</p>
          </div>
          <div className="text-center flex-1 border-l border-r border-gray-800">
            <p className="text-2xl font-bold">{stats.purchaseCount}</p>
            <p className="text-gray-400 text-xs">Purchases</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-2xl font-bold">{stats.nftCount}</p>
            <p className="text-gray-400 text-xs">NFTs</p>
          </div>
        </div>
        
        <div className="flex mt-6 space-x-2">
          <button 
            className="flex-1 py-2 bg-blue-600 rounded-lg text-sm font-medium"
            onClick={() => router.push('/feed')}
          >
            View Feed
          </button>
          <button className="flex-1 py-2 border border-gray-700 rounded-lg text-sm font-medium">
            Edit Profile
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-800 mt-4">
        <button 
          className={`flex-1 py-3 text-center text-sm font-medium ${activeTab === 'purchases' ? 'text-white border-b-2 border-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('purchases')}
        >
          Purchases
        </button>
        <button 
          className={`flex-1 py-3 text-center text-sm font-medium ${activeTab === 'nfts' ? 'text-white border-b-2 border-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('nfts')}
        >
          NFTs
        </button>
        <button 
          className={`flex-1 py-3 text-center text-sm font-medium ${activeTab === 'liked' ? 'text-white border-b-2 border-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('liked')}
        >
          Liked
        </button>
      </div>
      
      {/* Tab content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {renderTabContent()}
      </div>
      
      {/* Bottom Navigation */}
      <div className="flex justify-around items-center py-3 border-t border-gray-800 bg-gray-900">
        <button onClick={() => router.push('/')} className="flex flex-col items-center">
          <HomeIcon className="w-6 h-6 text-gray-500" />
          <span className="text-xs text-gray-500 mt-1">Home</span>
        </button>
        <button className="flex flex-col items-center">
          <PlusIcon className="w-6 h-6 text-gray-500" />
          <span className="text-xs text-gray-500 mt-1">Add</span>
        </button>
        <button className="flex flex-col items-center">
          <UserIcon className="w-6 h-6 text-white" />
          <span className="text-xs text-white mt-1">Profile</span>
        </button>
      </div>
    </div>
  )
} 
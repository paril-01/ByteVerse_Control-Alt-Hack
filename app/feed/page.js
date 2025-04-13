'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TransactionFeed from '../../components/TransactionFeed'
import { BackIcon, HomeIcon, PlusIcon, UserIcon } from '../../components/Icons'

export default function FeedPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Fetch transaction data
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
          // Mock transaction data with high-quality images
          txData = [
            {
              id: '1',
              name: 'Base Penguin #4291',
              image: 'https://i.seadn.io/gcs/files/2677b9a8c5b72c3915defb75d10a4ffa.png',
              price: '0.042 ETH',
              timestamp: Date.now() - 86400000 * 2,
              type: 'nft',
              txHash: '0x8cb8fcda9c5db86af01087448c2393a3be81d9ba62c5af7c1d08fe678df156c7'
            },
            {
              id: '2',
              name: 'Base Hoodie',
              image: 'https://pbs.twimg.com/media/F8Cv2QgW0AAkdJJ?format=jpg',
              price: '0.085 ETH',
              timestamp: Date.now() - 86400000 * 5,
              type: 'physical',
              txHash: '0xa1c30daa31e6d40a01c3e9d2b8e758d1c2ebd8c33d6cf731ea2cf0a94935cf47'
            },
            {
              id: '3',
              name: 'Base Cap',
              image: 'https://pbs.twimg.com/media/F8CxkRZXEAA3n-V?format=jpg',
              price: '0.065 ETH',
              timestamp: Date.now() - 86400000 * 12,
              type: 'physical',
              txHash: '0x7b8e1c7f8d5e2a3b41e09c7a6d5f1e3a2d5f1e3a2d5f1e3a2d5f1e3a2d5f1e3a'
            },
            {
              id: '4',
              name: 'Base Day 1 Badge',
              image: 'https://nfts.coinbase.com/tokens/13598/0/nftstorage/4a33b57b7b3fa08f6a2aca049db246ccf7ef1d23643cf9d1dbb98c4c9ffdc8d6.webp',
              price: '0.001 ETH',
              timestamp: Date.now() - 86400000 * 30,
              type: 'nft',
              txHash: '0x5d2f8e1c7f8d5e2a3b41e09c7a6d5f1e3a2d5f1e3a2d5f1e3a2d5f1e3a2d5f1e'
            },
            {
              id: '5',
              name: 'Summer Collection T-Shirt',
              image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHRzaGlydHxlbnwwfHwwfHx8MA%3D%3D',
              price: '0.025 ETH',
              timestamp: Date.now() - 86400000 * 15,
              type: 'physical',
              txHash: '0x3f4c7f5d6e8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c'
            }
          ]

          // Save mock data to localStorage
          localStorage.setItem('transactions', JSON.stringify(txData))
        }
        
        setTransactions(txData)
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTransactions()
  }, [])

  const handleBack = () => {
    router.push('/')
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <button onClick={handleBack} className="text-white">
          <BackIcon className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Transaction Feed</h1>
        <div className="w-6"></div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden snap-y snap-mandatory">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <TransactionFeed transactions={transactions} />
        )}
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
        <button onClick={() => router.push('/profile')} className="flex flex-col items-center">
          <UserIcon className="w-6 h-6 text-gray-500" />
          <span className="text-xs text-gray-500 mt-1">Profile</span>
        </button>
      </div>
    </div>
  )
} 
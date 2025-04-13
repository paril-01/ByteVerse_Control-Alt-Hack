'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletContext'

export default function Transactions({ walletAddress }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('purchases')
  const { address, balance } = useWallet()
  
  // Format address for display (0x1234...5678)
  const formatAddress = (addr) => {
    if (!addr) return '';
    return addr.substring(0, 6) + '...' + addr.substring(addr.length - 4);
  };
  
  // Format timestamp to readable date
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  // Shorten transaction hash for display
  const shortenHash = (hash) => {
    if (!hash) return '';
    return hash.substring(0, 6) + '...' + hash.substring(hash.length - 4);
  };

  // Handle transaction click
  const handleTransactionClick = (tx) => {
    window.open(`https://sepolia.basescan.org/tx/${tx.hash}`, '_blank');
  };
  
  // View NFT receipt
  const viewNFTReceipt = (nftId) => {
    alert(`Viewing NFT Receipt #${nftId}`);
    // In a real app, this would open NFT details
  };

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        
        // In a real app, fetch from API or blockchain
        // For demo, we'll get data from localStorage
        const storedTxs = localStorage.getItem('transactions');
        if (storedTxs) {
          const parsedTxs = JSON.parse(storedTxs);
          setTransactions(parsedTxs);
          setLoading(false);
          return;
        }
        
        // If no stored transactions, use mock data with valid transaction hashes
        const mockTransactions = [
          {
            id: 1,
            timestamp: Date.now() - 1000000,
            type: 'purchase',
            amount: 0.05,
            product: mockProducts[0],
            hash: '0x7d9c6d3ab8ceaee39d568893d70e22a833f7ebd3eb1df76254ffflf45500dad2',
            status: 'completed',
          },
          {
            id: 2,
            timestamp: Date.now() - 2000000,
            type: 'purchase',
            amount: 0.03,
            product: mockProducts[1],
            hash: '0x2a86d82e13c9ca10eb9ee4099455ad8a8c301c2b2982f4fcd91a1ff3f34f68c9',
            status: 'completed',
          },
          {
            id: 3,
            timestamp: Date.now() - 3000000,
            type: 'purchase',
            amount: 0.01,
            product: mockProducts[2],
            hash: '0xf85cb32e55c37f15d66ae4f71579e86e9e3377dbca4d4c9d7aec6f87d7117552',
            status: 'completed',
          }
        ];
        
        setTransactions(mockTransactions);
        
        // Store in localStorage for future reference
        localStorage.setItem('transactions', JSON.stringify(mockTransactions));
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTransactions();
  }, []);

  return (
    <div className="bg-black min-h-screen text-white pb-20">
      {/* User Profile Header - TikTok style */}
      <div className="bg-gradient-to-b from-[#FF005C] to-black pt-10 pb-4 px-4">
        <div className="flex items-center justify-between mb-3">
          <button className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Profile</h1>
          <button className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center justify-center flex-col">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#FF005C] to-[#FF7A00] flex items-center justify-center mb-4">
            <div className="w-[90px] h-[90px] rounded-full bg-black flex items-center justify-center">
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF005C] to-[#FF7A00]">
                {address ? address.substring(2, 4).toUpperCase() : 'SH'}
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-bold mb-1">{formatAddress(address || walletAddress)}</h2>
          <div className="flex items-center gap-2 mb-2 text-gray-300 text-sm">
            <span>Base</span>
            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
            <span>{balance} USDC</span>
          </div>
          
          <div className="flex gap-6 text-center my-3">
            <div>
              <div className="font-bold">{transactions.length}</div>
              <div className="text-sm text-gray-300">Purchases</div>
            </div>
            <div>
              <div className="font-bold">0</div>
              <div className="text-sm text-gray-300">Followers</div>
            </div>
            <div>
              <div className="font-bold">0</div>
              <div className="text-sm text-gray-300">Following</div>
            </div>
          </div>
          
          <button className="border border-gray-500 px-8 py-1.5 rounded-md text-sm font-medium mb-2">
            Edit profile
          </button>
        </div>
      </div>
      
      {/* Tabs - TikTok style */}
      <div className="border-b border-gray-800">
        <div className="flex">
          <button 
            onClick={() => setActiveTab('purchases')}
            className={`flex-1 py-3 text-center relative ${activeTab === 'purchases' ? 'text-white' : 'text-gray-500'}`}
          >
            Purchases
            {activeTab === 'purchases' && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-[#FF005C] to-[#FF7A00]"></div>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('nfts')}
            className={`flex-1 py-3 text-center relative ${activeTab === 'nfts' ? 'text-white' : 'text-gray-500'}`}
          >
            NFT Receipts
            {activeTab === 'nfts' && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-[#FF005C] to-[#FF7A00]"></div>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('liked')}
            className={`flex-1 py-3 text-center relative ${activeTab === 'liked' ? 'text-white' : 'text-gray-500'}`}
          >
            Liked
            {activeTab === 'liked' && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-[#FF005C] to-[#FF7A00]"></div>
            )}
          </button>
        </div>
      </div>
      
      {/* Transactions Grid (TikTok style) */}
      <div className="py-4 px-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF005C]"></div>
            <p className="text-gray-400 mt-4">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <div>
            {activeTab === 'purchases' && (
              <div className="grid grid-cols-3 gap-1">
                {transactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="aspect-square relative overflow-hidden rounded-md"
                    onClick={() => handleTransactionClick(tx)}
                  >
                    <img 
                      src={tx.product.image} 
                      alt={tx.product.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-1">
                      <p className="text-xs font-medium truncate">{tx.product.name}</p>
                      <p className="text-[10px] text-gray-300">{formatTimestamp(tx.timestamp)}</p>
                    </div>
                    <div className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5">
                      <svg className="w-3 h-3 text-[#FF005C]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'nfts' && (
              <div className="grid grid-cols-3 gap-1">
                {transactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="aspect-square relative overflow-hidden rounded-md"
                    onClick={() => viewNFTReceipt(tx.product.nftId)}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex flex-col items-center justify-center">
                      <div className="text-xs mb-1 text-white/70">NFT</div>
                      <div className="text-sm font-bold">#{tx.product.nftId}</div>
                    </div>
                    <div className="absolute bottom-1 left-1 right-1">
                      <p className="text-[10px] text-center bg-black/30 rounded-full px-1 py-0.5">
                        {formatTimestamp(tx.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'liked' && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <p className="text-gray-500">No liked items yet</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-black border-t border-gray-900 flex items-center justify-around px-2">
        <button className="flex flex-col items-center justify-center w-full">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs text-gray-500">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center w-full">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs text-gray-500">Discover</span>
        </button>
        <button className="flex flex-col items-center justify-center w-full">
          <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-[#FF005C] to-[#FF7A00] rounded-full -mt-5">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </button>
        <button className="flex flex-col items-center justify-center w-full">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="text-xs text-gray-500">Inbox</span>
        </button>
        <button className="flex flex-col items-center justify-center w-full">
          <svg className="w-6 h-6 text-[#FF005C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs text-[#FF005C]">Profile</span>
        </button>
      </div>
    </div>
  )
} 
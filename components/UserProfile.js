import React, { useState, useEffect } from 'react';

const UserProfile = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('purchases');
  const [userStats, setUserStats] = useState({
    totalSpent: 0,
    purchaseCount: 0,
    nftCount: 0
  });
  
  // Format timestamp to relative time
  const formatTimestamp = (timestamp) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diff = timestamp - Date.now();
    const diffDays = Math.round(diff / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < -1 && diffDays > -7) return rtf.format(diffDays, 'day');
    if (diffDays <= -7 && diffDays > -30) return rtf.format(Math.round(diffDays / 7), 'week');
    if (diffDays <= -30 && diffDays > -365) return rtf.format(Math.round(diffDays / 30), 'month');
    return rtf.format(Math.round(diffDays / 365), 'year');
  };
  
  // Shorten hash for display
  const shortenHash = (hash) => {
    if (!hash) return '';
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };
  
  // Handle transaction click
  const handleTransactionClick = (tx) => {
    window.open(`https://goerli.basescan.org/tx/${tx.hash}`, '_blank');
  };
  
  // View NFT receipt
  const viewNFTReceipt = (nftId) => {
    window.open(`/nft/${nftId}`, '_blank');
  };
  
  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        
        // In a real app, fetch from API or blockchain
        const storedTxs = localStorage.getItem('transactions');
        if (storedTxs) {
          const parsedTxs = JSON.parse(storedTxs);
          setTransactions(parsedTxs);
          
          // Calculate stats
          const total = parsedTxs.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
          const nfts = new Set(parsedTxs.map(tx => tx.nftId)).size;
          
          setUserStats({
            totalSpent: total.toFixed(2),
            purchaseCount: parsedTxs.length,
            nftCount: nfts
          });
          
          setLoading(false);
          return;
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setLoading(false);
      }
    }
    
    fetchTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      {/* Profile Header */}
      <div className="p-4 pt-8">
        <div className="flex items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#FF005C]">
            <img 
              src="https://randomuser.me/api/portraits/women/44.jpg" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="ml-4">
            <h1 className="text-xl font-bold">@crypto_shopper</h1>
            <p className="text-gray-400 text-sm">0x7Ac...3E4a</p>
          </div>
        </div>
        
        {/* User stats */}
        <div className="flex justify-around mt-6">
          <div className="text-center">
            <p className="font-bold">{userStats.purchaseCount}</p>
            <p className="text-gray-400 text-xs">Purchases</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{userStats.nftCount}</p>
            <p className="text-gray-400 text-xs">NFTs</p>
          </div>
          <div className="text-center">
            <p className="font-bold">${userStats.totalSpent}</p>
            <p className="text-gray-400 text-xs">Total Spent</p>
          </div>
        </div>
        
        <div className="mt-4">
          <button className="bg-gradient-to-r from-[#FF005C] to-[#FF7A00] text-white rounded-full py-2 px-6 text-sm font-medium w-full">
            Edit Profile
          </button>
        </div>
      </div>
      
      {/* Content Tabs */}
      <div className="border-t border-gray-800 mt-4">
        <div className="flex">
          <button 
            className={`flex-1 py-3 text-center ${activeTab === 'purchases' ? 'text-white border-b-2 border-[#FF005C]' : 'text-gray-500'}`}
            onClick={() => setActiveTab('purchases')}
          >
            Purchases
          </button>
          <button 
            className={`flex-1 py-3 text-center ${activeTab === 'nfts' ? 'text-white border-b-2 border-[#FF005C]' : 'text-gray-500'}`}
            onClick={() => setActiveTab('nfts')}
          >
            NFTs
          </button>
          <button 
            className={`flex-1 py-3 text-center ${activeTab === 'liked' ? 'text-white border-b-2 border-[#FF005C]' : 'text-gray-500'}`}
            onClick={() => setActiveTab('liked')}
          >
            Liked
          </button>
        </div>
      </div>
      
      {/* Content area */}
      <div className="p-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-t-2 border-[#FF005C] border-r-2 border-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading your activity...</p>
          </div>
        ) : (
          <div>
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-gray-500">No purchases yet</p>
                <button className="mt-4 px-6 py-2 bg-[#FF005C] rounded-full text-sm">
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {activeTab === 'purchases' && (
                  <div className="grid grid-cols-2 gap-2">
                    {transactions.map(tx => (
                      <div 
                        key={tx.id} 
                        className="relative rounded-lg overflow-hidden aspect-square"
                        onClick={() => handleTransactionClick(tx)}
                      >
                        <img 
                          src={tx.image} 
                          alt={tx.productName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                          <p className="text-xs font-medium truncate">{tx.productName}</p>
                          <p className="text-[10px] text-gray-300">${tx.amount}</p>
                        </div>
                        <div className="absolute top-2 right-2 bg-[#FF005C] rounded-full px-2 py-0.5">
                          <p className="text-[10px]">{formatTimestamp(tx.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeTab === 'nfts' && (
                  <div className="grid grid-cols-3 gap-2">
                    {transactions.map(tx => (
                      <div 
                        key={tx.id} 
                        className="aspect-square relative overflow-hidden rounded-md"
                        onClick={() => viewNFTReceipt(tx.nftId)}
                      >
                        <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex flex-col items-center justify-center">
                          <div className="text-xs mb-1 text-white/70">NFT</div>
                          <div className="text-sm font-bold">#{tx.nftId}</div>
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
              </>
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
  );
};

export default UserProfile; 
import { useState, useRef, useEffect } from 'react';
import { HeartIcon, ShareIcon, CommentIcon } from './Icons';

export default function TransactionFeed({ transactions = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLiked, setIsLiked] = useState({});
  const feedRef = useRef(null);

  // Format a timestamp to relative time
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // diff in seconds
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  // Shorten a blockchain hash
  const shortenHash = (hash) => {
    if (!hash) return '';
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  // Handle transaction click to view on BaseScan
  const handleTransactionClick = (txHash) => {
    if (!txHash) return;
    window.open(`https://sepolia.basescan.org/tx/${txHash}`, '_blank');
  };

  // Toggle like for a transaction
  const toggleLike = (txId) => {
    setIsLiked(prev => ({
      ...prev,
      [txId]: !prev[txId]
    }));
  };

  // Share transaction
  const shareTransaction = (tx) => {
    if (navigator.share) {
      navigator.share({
        title: `Check out this ${tx.type === 'nft' ? 'NFT' : 'product'} on ByteVerse!`,
        text: `I just ${tx.type === 'nft' ? 'collected' : 'purchased'} ${tx.name || tx.product?.name} on ByteVerse`,
        url: `https://sepolia.basescan.org/tx/${tx.txHash || tx.hash}`
      })
      .catch(error => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support navigator.share
      const url = `https://sepolia.basescan.org/tx/${tx.txHash || tx.hash}`;
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  // Use intersection observer to detect which transaction is in view
  useEffect(() => {
    if (!feedRef.current || transactions.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setActiveIndex(index);
          }
        });
      },
      { threshold: 0.6 } // 60% of the item needs to be visible
    );
    
    const items = feedRef.current.querySelectorAll('.transaction-item');
    items.forEach(item => observer.observe(item));
    
    return () => {
      items.forEach(item => observer.unobserve(item));
    };
  }, [transactions]);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-gray-400">
        <div className="text-5xl mb-4">🛍️</div>
        <div className="text-xl font-semibold">No transactions yet</div>
        <p className="text-sm mt-2">Your purchases will show up here</p>
      </div>
    );
  }

  return (
    <div className="relative h-full" ref={feedRef}>
      {transactions.map((tx, index) => {
        // Handle different transaction data structures
        const txName = tx.name || (tx.product ? tx.product.name : 'Unknown Product');
        const txImage = tx.image || (tx.product ? tx.product.image : '');
        const txPrice = tx.price || (tx.amount ? `${tx.amount} ETH` : '');
        const txHash = tx.txHash || tx.hash;
        const txTimestamp = tx.timestamp;
        const txType = tx.type || 'purchase';
        
        return (
          <div 
            key={tx.id} 
            className="transaction-item h-[calc(100vh-180px)] w-full snap-start"
            data-index={index}
          >
            <div className="relative h-full w-full bg-gray-900 rounded-xl overflow-hidden">
              {/* Transaction content */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${txImage})` }}
              >
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
              </div>
              
              {/* Main transaction content */}
              <div className="relative h-full flex flex-col justify-center items-center p-4">
                {/* Product image */}
                <div 
                  className="w-full max-w-sm aspect-square rounded-xl overflow-hidden mb-4 shadow-xl"
                  onClick={() => handleTransactionClick(txHash)}
                >
                  <img 
                    src={txImage}
                    alt={txName}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Transaction details */}
                <div className="w-full max-w-sm bg-black/70 backdrop-blur-md rounded-xl p-4 shadow-lg">
                  <h3 className="text-lg font-bold text-white">{txName}</h3>
                  <p className="text-blue-400 font-medium">{txPrice}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {formatTimestamp(txTimestamp)}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs bg-blue-600/30 text-blue-400 px-2 py-0.5 rounded-full">
                      {txType === 'nft' ? 'NFT' : 'Product'}
                    </span>
                    <span 
                      className="text-xs text-gray-500 ml-2 cursor-pointer hover:text-gray-300 transition"
                      onClick={() => handleTransactionClick(txHash)}
                    >
                      {shortenHash(txHash)} ↗
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Side actions */}
              <div className="absolute right-4 bottom-32 flex flex-col space-y-4">
                <button 
                  className="bg-black/50 w-10 h-10 rounded-full flex items-center justify-center"
                  onClick={() => toggleLike(tx.id)}
                >
                  <HeartIcon 
                    className={`w-6 h-6 ${isLiked[tx.id] ? 'text-red-500' : 'text-white'}`} 
                    filled={isLiked[tx.id]}
                  />
                </button>
                <button 
                  className="bg-black/50 w-10 h-10 rounded-full flex items-center justify-center"
                  onClick={() => shareTransaction(tx)}
                >
                  <ShareIcon className="w-6 h-6 text-white" />
                </button>
              </div>
              
              {/* Progress indicator */}
              <div className="absolute top-4 left-4 right-4 flex space-x-1">
                {transactions.map((_, i) => (
                  <div 
                    key={i}
                    className={`h-1 rounded-full flex-1 ${
                      i === activeIndex ? 'bg-white' : 'bg-white/30'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 
'use client'

import { useState, useRef, useEffect } from 'react'
import { useWallet } from '../context/WalletContext'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product, onPurchase, onShowDetails, videoRef, isActive }) {
  const [purchaseState, setPurchaseState] = useState('initial') // initial, purchasing, success
  const [isLiked, setIsLiked] = useState(false)
  const [likeAnimation, setLikeAnimation] = useState(false)
  const [likeCount, setLikeCount] = useState(124) // Initialize with a default like count
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false)
  const [addToCartAnimation, setAddToCartAnimation] = useState(false)
  const lastTapTime = useRef(0)
  const doubleTapDelay = 300 // ms
  const { likeProduct } = useWallet()
  const { addToCart } = useCart()
  
  const handlePurchase = async () => {
    console.log('[ProductCard] handlePurchase called');
    try {
      setPurchaseState('purchasing')
      console.log('[ProductCard] Calling onPurchase prop...');
      await onPurchase(product.id)
      console.log('[ProductCard] onPurchase prop finished.');
      setPurchaseState('success')
      
      // Reset state after 5 seconds
      setTimeout(() => {
        setPurchaseState('initial')
      }, 5000)
    } catch (error) {
      console.error('[ProductCard] Purchase error:', error)
      setPurchaseState('initial')
    }
  }
  
  const handleLike = async (e) => {
    // Prevent event propagation to stop triggering swipe
    e.stopPropagation();
    
    // Toggle like state
    const newLikeState = !isLiked;
    setIsLiked(newLikeState)
    
    // Update like count - increment if liked, decrement if unliked
    setLikeCount(prevCount => newLikeState ? prevCount + 1 : prevCount - 1)
    
    // Show animation
    setLikeAnimation(true)
    
    // Show heart animation if liking
    if (newLikeState) {
      showHeartAnimation();
    }
    
    setTimeout(() => setLikeAnimation(false), 1000)
    
    // Call blockchain/API like function
    try {
      const result = await likeProduct(product.id);
      console.log("Like result:", result);
    } catch (error) {
      console.error("Error liking product:", error);
      // Revert UI state on error
      setIsLiked(!newLikeState);
      setLikeCount(prevCount => !newLikeState ? prevCount + 1 : prevCount - 1);
    }
  }
  
  // Instagram-like double tap to like
  const handleDoubleTap = async (e) => {
    // Prevent swipe
    e.stopPropagation();
    
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime.current;
    
    if (timeSinceLastTap < doubleTapDelay && timeSinceLastTap > 0) {
      // Double tap detected
      if (!isLiked) {
        // Only like if not already liked (Instagram behavior)
        setIsLiked(true);
        setLikeCount(prevCount => prevCount + 1);
        showHeartAnimation();
        
        // Call blockchain/API like function
        try {
          const result = await likeProduct(product.id);
          console.log("Like result:", result);
        } catch (error) {
          console.error("Error liking product:", error);
          // Revert UI state on error
          setIsLiked(false);
          setLikeCount(prevCount => prevCount - 1);
        }
      }
    }
    
    lastTapTime.current = now;
  };
  
  // Heart animation that appears in the center of the screen
  const showHeartAnimation = () => {
    setShowDoubleTapHeart(true);
    setTimeout(() => {
      setShowDoubleTapHeart(false);
    }, 1000);
  };
  
  // Handle add to cart
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      await addToCart(product);
      
      // Show animation
      setAddToCartAnimation(true);
      setTimeout(() => setAddToCartAnimation(false), 1000);
      
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  return (
    <div className="relative h-full w-full bg-black text-white">
      {/* Video Background (or Image Fallback) - Always make sure this element receives events */}
      <div 
        className="absolute inset-0 z-0"
        onClick={handleDoubleTap}
      >
        {product.video ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src={product.video}
              className={`object-cover w-full h-full ${isActive ? '' : ''}`}
              loop
              muted
              playsInline
              disablePictureInPicture
              controlsList="noplaybackrate nofullscreen nodownload"
              onLoadedData={(e) => {
                // Force mute when the video loads
                e.target.muted = true;
                e.target.volume = 0;
              }}
            />
            {/* Video indicator */}
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-1.5 rounded-full">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            {/* Thumbnail preview */}
            <div className="absolute bottom-36 left-4 h-16 w-16 rounded-md overflow-hidden border-2 border-white/50 shadow-lg">
              <img 
                src={product.image} 
                alt={product.title} 
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        ) : (
          <img 
            src={product.image} 
            alt={product.title} 
            className="object-cover w-full h-full"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80"></div>
      </div>
      
      {/* Product type indicator */}
      <div className="absolute top-4 left-4 px-2 py-1 rounded-full text-xs font-medium z-10 flex items-center space-x-1"
           style={{
             background: product.isLimited 
              ? 'linear-gradient(90deg, rgba(138,58,185,0.8) 0%, rgba(233,89,80,0.8) 100%)' 
              : 'linear-gradient(90deg, rgba(0,82,255,0.8) 0%, rgba(0,212,255,0.8) 100%)'
           }}>
        <span>{product.isLimited ? 'NFT' : 'Product'}</span>
        {product.isLimited && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0010-4.83A5 5 0 0010 11z"></path>
          </svg>
        )}
      </div>
      
      {/* Add to cart animation */}
      {addToCartAnimation && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-3 animate-bounce-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Purchase success overlay - using absolute positioning and pointer-events-none */}
      {purchaseState === 'success' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-25 pointer-events-none">
          <div className="bg-green-500 text-white p-4 rounded-lg flex items-center shadow-lg transform scale-110 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-bold text-lg">Purchase Successful!</span>
          </div>
        </div>
      )}
      
      {/* Purchase processing overlay - using absolute and pointer-events-none */}
      {purchaseState === 'purchasing' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-25 pointer-events-none">
          <div className="bg-gray-800 text-white p-4 rounded-lg flex items-center shadow-lg">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            <span>Processing Purchase...</span>
          </div>
        </div>
      )}
      
      {/* Double tap heart animation - absolute and pointer-events-none */}
      {showDoubleTapHeart && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <svg 
            className="w-24 h-24 text-white filter drop-shadow-lg animate-heart-burst" 
            fill="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      )}
      
      {/* Product Info Overlay - preserving interaction */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-1">{product.title}</h3>
          <p className="text-lg font-bold mb-1 flex items-center">
            {formatPrice(product.price)}
            <span className="ml-2 text-sm text-gray-300">≈ {product.price.toFixed(0)} USDC</span>
          </p>
          <div className="flex items-center mb-2">
            <span className="text-yellow-400 mr-1">★</span>
            <span>{product.rating}</span>
            <span className="mx-2">•</span>
            <span className="text-sm">{product.seller}</span>
          </div>
          <p className="text-sm text-gray-300 line-clamp-2 mb-3">{product.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {product.tags.map(tag => (
              <span 
                key={tag} 
                className="text-xs bg-white/20 text-white px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
        
        {/* Purchase and Add to Cart Buttons - only show in initial state */}
        {purchaseState === 'initial' && (
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePurchase();
              }}
              className="flex-1 bg-gradient-to-r from-[#FF005C] to-[#FF7A00] text-white py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
            >
              Buy Now
            </button>
            <button
              onClick={handleAddToCart}
              className="bg-white/20 backdrop-blur-sm p-3 rounded-lg hover:bg-white/30 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>
          </div>
        )}
        
        {/* See Details button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShowDetails(product);
          }}
          className="w-full mt-2 bg-white/20 backdrop-blur-sm text-white py-2 rounded-lg font-medium hover:bg-white/30 transition-colors"
        >
          See Details
        </button>
      </div>
      
      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-36 flex flex-col space-y-6 items-center z-20">
        {/* Like Button */}
        <button 
          onClick={handleLike}
          className="flex flex-col items-center"
        >
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm">
            <svg 
              className={`w-7 h-7 ${isLiked ? 'text-[#FF005C]' : 'text-white'} transition-colors ${likeAnimation ? 'animate-ping' : ''}`} 
              fill={isLiked ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-white text-xs mt-1">{likeCount}</span>
        </button>
        
        {/* Comment Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onShowDetails(product);
          }}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-white text-xs mt-1">36</span>
        </button>
        
        {/* Share Button */}
        <button 
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          <span className="text-white text-xs mt-1">Share</span>
        </button>
      </div>
      
      {/* AI Curated Badge */}
      <div className="absolute top-4 right-4 z-10 bg-purple-500/90 text-white text-xs px-3 py-1 rounded-full flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
        AI Recommended
      </div>
    </div>
  )
} 
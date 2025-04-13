'use client'

import { useState, useEffect, useRef } from 'react'
import ProductCard from './ProductCard'
import Confetti from 'react-confetti'
import { useWallet } from '../context/WalletContext'
import { useCart } from '../context/CartContext'
import { useRouter } from 'next/navigation'

const TRENDING_PRODUCTS = [
  {
    id: 1,
    title: "Base Hoodie - Limited Edition",
    description: "Official Base L2 blockchain limited edition hoodie in black with minimalist Base logo.",
    price: 0.042,
    image: "https://pbs.twimg.com/media/F8Cv2QgW0AAkdJJ?format=jpg",
    seller: "Base Official",
    rating: 4.9,
    tags: ["clothing", "limited", "base"],
    isLimited: true,
    video: "https://player.vimeo.com/external/517090076.sd.mp4?s=f304d5706a0331bec730d3a36b59bde5cb341822&profile_id=165&oauth2_token_id=57447761"
  },
  {
    id: 2,
    title: "Base Penguin NFT #4291",
    description: "Limited edition Base Penguin NFT. Includes ownership verification and exclusive community access.",
    price: 0.085,
    image: "https://i.seadn.io/gcs/files/2677b9a8c5b72c3915defb75d10a4ffa.png",
    seller: "Base NFT Collective",
    rating: 4.8,
    tags: ["nft", "crypto", "collectible"],
    isLimited: true,
    video: "https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9e7c02d&profile_id=165&oauth2_token_id=57447761"
  },
  {
    id: 3,
    title: "Smart Wallet Hardware Key",
    description: "Secure your crypto with military-grade encryption. Compatible with Base network and all EVM chains.",
    price: 0.075,
    image: "https://images.unsplash.com/photo-1613739722718-3af67f0f4add?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTN8fHdhbGxldHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60",
    seller: "Crypto Security Co",
    rating: 4.7,
    tags: ["security", "hardware", "crypto"],
    isLimited: false,
    video: "https://player.vimeo.com/external/403292829.sd.mp4?s=f51cfeace0b6cdd57e4b7747884d5c6fb5a6886c&profile_id=165&oauth2_token_id=57447761"
  },
  {
    id: 4,
    title: "Base Cap - Summer Edition",
    description: "Stylish Base logo cap in white, perfect for summer. Breathable fabric and adjustable size.",
    price: 0.035,
    image: "https://pbs.twimg.com/media/F8CxkRZXEAA3n-V?format=jpg",
    seller: "Base Official",
    rating: 4.6,
    tags: ["clothing", "summer", "base"],
    isLimited: false,
    video: "https://player.vimeo.com/external/393628391.sd.mp4?s=22952d9dcdd6bafd1f699e16fd732b1ba23acf03&profile_id=165&oauth2_token_id=57447761"
  },
  {
    id: 5,
    title: "Base Day 1 Badge NFT",
    description: "Commemorative NFT for Base early adopters. Proves you were here from day one.",
    price: 0.025,
    image: "https://nfts.coinbase.com/tokens/13598/0/nftstorage/4a33b57b7b3fa08f6a2aca049db246ccf7ef1d23643cf9d1dbb98c4c9ffdc8d6.webp",
    seller: "Base Genesis",
    rating: 4.9,
    tags: ["nft", "badge", "exclusive"],
    isLimited: true,
    video: "https://player.vimeo.com/external/449613455.sd.mp4?s=e743ed3dea4908ebc0b9eee59196eaed1a7a9a98&profile_id=165&oauth2_token_id=57447761"
  },
  {
    id: 6,
    title: "Crypto Portfolio Tracker",
    description: "Digital subscription to track your crypto investments across Base and other chains with real-time alerts.",
    price: 0.018,
    image: "https://images.unsplash.com/photo-1607270788734-1d8a1da48252?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y3J5cHRvfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60",
    seller: "BlockTrack",
    rating: 4.5,
    tags: ["software", "investing", "tools"],
    isLimited: false,
    video: "https://player.vimeo.com/external/457017421.sd.mp4?s=b3fe961da675e47b8afd6c234fa4f9f1df4c30d6&profile_id=165&oauth2_token_id=57447761"
  },
  {
    id: 7,
    title: "Base Conference Ticket",
    description: "Virtual ticket to the annual Base developers conference. Network with builders and learn about the latest Base innovations.",
    price: 0.12,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y29uZmVyZW5jZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60",
    seller: "Base Events",
    rating: 4.8,
    tags: ["event", "conference", "educational"],
    isLimited: true,
    video: "https://player.vimeo.com/external/371904457.sd.mp4?s=1c6091782f6173c50d3f854d8b2a634dc310aa96&profile_id=165&oauth2_token_id=57447761"
  },
  {
    id: 8,
    title: "Digital Art Collection - Base Series",
    description: "Set of 5 digital art pieces inspired by Base ecosystem, created by renowned digital artist CryptoCanvas.",
    price: 0.15,
    image: "https://images.unsplash.com/photo-1621392628101-e52268991fb8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGRpZ2l0YWwlMjBhcnR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60",
    seller: "CryptoCanvas",
    rating: 4.7,
    tags: ["art", "nft", "collection"],
    isLimited: true,
    video: "https://player.vimeo.com/external/557867288.sd.mp4?s=acd7cc87ade3af5e1fd9febc45d21d7eeef17683&profile_id=165&oauth2_token_id=57447761"
  },
  {
    id: 9,
    title: "Base Developer Course",
    description: "Comprehensive online course teaching how to build dApps on Base. Includes certification upon completion.",
    price: 0.095,
    image: "https://images.unsplash.com/photo-1544256718-3bcf237f3974?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGNvZGluZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60",
    seller: "Base Academy",
    rating: 4.9,
    tags: ["education", "development", "course"],
    isLimited: false,
    video: "https://player.vimeo.com/external/412144056.sd.mp4?s=d5a7d8a0e8f4efcd65f0de9c419920a961ef6a78&profile_id=165&oauth2_token_id=57447761"
  },
  {
    id: 10,
    title: "Crypto-themed Phone Case",
    description: "Durable phone case with Base-inspired design. Available for latest iPhone and Android models.",
    price: 0.022,
    image: "https://images.unsplash.com/photo-1635016994983-d2c864fcc608?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHBob25lJTIwY2FzZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60",
    seller: "CryptoGear",
    rating: 4.4,
    tags: ["accessory", "phone", "merchandise"],
    isLimited: false,
    video: "https://player.vimeo.com/external/400204659.sd.mp4?s=5fc222f5b3892bef8156c8194d4a6c65e48fd3e9&profile_id=165&oauth2_token_id=57447761"
  },
  {
    id: 11,
    title: "Base Ambassador Pack",
    description: "Exclusive merchandise pack for Base ambassadors including hoodie, cap, stickers, and limited NFT.",
    price: 0.18,
    image: "https://images.unsplash.com/photo-1593757147298-e064ed1419e5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bWVyY2hhbmRpc2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60",
    seller: "Base Official",
    rating: 4.9,
    tags: ["merchandise", "bundle", "exclusive"],
    isLimited: true,
    video: "https://player.vimeo.com/external/483843759.sd.mp4?s=2d02a95b04ffd5f8c7b0bc538c537ccc8d882689&profile_id=165&oauth2_token_id=57447761"
  },
  {
    id: 12,
    title: "Crypto Hardware Wallet",
    description: "Secure hardware wallet optimized for Base with easy-to-use interface and backup features.",
    price: 0.068,
    image: "https://images.unsplash.com/photo-1640445265579-0a9eb4d18100?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y3J5cHRvJTIwd2FsbGV0fGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60",
    seller: "SecureBlock",
    rating: 4.8,
    tags: ["hardware", "security", "wallet"],
    isLimited: false,
    video: "https://player.vimeo.com/external/369013576.sd.mp4?s=04cf514e87e1daa0e4a4448a748cd0e323f86ef3&profile_id=165&oauth2_token_id=57447761"
  }
]

export default function ProductFeed() {
  const { purchaseProduct, likeProduct } = useWallet()
  const { addToCart } = useCart()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [products, setProducts] = useState(TRENDING_PRODUCTS)
  const [loading, setLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [notifications, setNotifications] = useState([])
  // Transaction modal states
  const [showTxModal, setShowTxModal] = useState(false)
  const [txState, setTxState] = useState('idle') // idle, pending, signing, contract, confirming, minting, completed, failed
  const [txDetails, setTxDetails] = useState(null)
  const videoRefs = useRef([])
  const containerRef = useRef(null)
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)
  const router = useRouter()
  
  // Control whether a swipe is in progress
  const [swiping, setSwiping] = useState(false)
  const [touchDelta, setTouchDelta] = useState(0) // Track current touch position for drag effect
  const [swipeDirection, setSwipeDirection] = useState(null) // Track swipe direction
  const animationRef = useRef(null) // For tracking animation frames

  // Add state for comments 
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const commentInputRef = useRef(null);

  // Define handlers outside of effects but inside component
  const handleTouchStart = (e) => {
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    touchStartY.current = e.touches[0].clientY;
    setTouchDelta(0);
    setSwipeDirection(null);
  };
  
  const handleTouchMove = (e) => {
    if (swiping) return; // Don't allow new movement during transition
    
    touchEndY.current = e.touches[0].clientY;
    const deltaY = touchStartY.current - touchEndY.current;
    
    // Determine direction of swipe
    const direction = deltaY > 0 ? 'up' : 'down';
    setSwipeDirection(direction);
    
    // Only apply drag resistance if trying to go past the boundaries
    if ((direction === 'up' && currentIndex >= products.length - 1) || 
        (direction === 'down' && currentIndex <= 0)) {
      // Apply resistance - only move 1/3 as far when trying to go past edge
      setTouchDelta(deltaY / 3);
    } else {
      setTouchDelta(deltaY);
    }
    
    // Prevent native scrolling behavior
    e.preventDefault();
  };
  
  const handleTouchEnd = () => {
    if (swiping) return; // Prevent multiple swipes at once
    
    const diff = touchStartY.current - touchEndY.current;
    // Lower the threshold for mobile - more sensitive to smaller swipes
    const threshold = 40; 
    
    // Reset the touch delta regardless of swipe completion
    setTouchDelta(0);
    
    if (Math.abs(diff) < threshold) {
      // Not a significant swipe, snap back
      return;
    }
    
    setSwiping(true);
    
    if (diff > 0) {
      // Swipe up - move to next
      if (currentIndex < products.length - 1) {
        setCurrentIndex(prevIndex => prevIndex + 1);
      }
    } else {
      // Swipe down - move to previous
      if (currentIndex > 0) {
        setCurrentIndex(prevIndex => prevIndex - 1);
      }
    }
    
    // Reset swipe state after animation completes
    setTimeout(() => {
      setSwiping(false);
      setSwipeDirection(null);
    }, 400);
    
    setShowDetails(false); // Close details when swiping
  };

  // Setup touch event listeners with proper options
  useEffect(() => {
    // Initialize video refs array based on products length
    videoRefs.current = videoRefs.current.slice(0, products.length);
    
    // Add event options to allow preventDefault
    const containerElement = containerRef.current;
    if (containerElement) {
      // This makes touch events non-passive, allowing preventDefault
      containerElement.addEventListener('touchstart', handleTouchStart, { passive: false });
      containerElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      containerElement.addEventListener('touchend', handleTouchEnd, { passive: false });
    }
    
    return () => {
      // Clean up event listeners
      if (containerElement) {
        containerElement.removeEventListener('touchstart', handleTouchStart);
        containerElement.removeEventListener('touchmove', handleTouchMove);
        containerElement.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [products.length, currentIndex, swiping]); // Add dependencies for the handlers

  useEffect(() => {
    // Simulate fetching product feed from AgentKit
    const fetchProducts = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProducts(TRENDING_PRODUCTS)
      setLoading(false)
    }
    
    fetchProducts()
  }, [])

  // When the active index changes, control video playback
  useEffect(() => {
    // Ensure all videos are muted
    videoRefs.current.forEach(video => {
      if (video) {
        // Force mute all videos to remove audio
        video.muted = true;
        video.volume = 0;
      }
    });
    
    // Add a small delay before playing the new video to avoid conflicts
    const playCurrentVideo = setTimeout(() => {
      const activeVideo = videoRefs.current[currentIndex];
      if (activeVideo) {
        // Force mute the active video again to be certain
        activeVideo.muted = true;
        activeVideo.volume = 0;
        console.log(`Playing video at index ${currentIndex}`);
        // Ensure video is ready before attempting to play
        if (activeVideo.readyState >= 2) {
          activeVideo.play().catch(error => {
            console.warn(`Autoplay prevented for video ${currentIndex}:`, error);
          });
        } else {
          // If video isn't loaded yet, wait for it
          activeVideo.addEventListener('loadeddata', () => {
            // Ensure it's muted before playing
            activeVideo.muted = true;
            activeVideo.volume = 0;
            activeVideo.play().catch(console.warn);
          }, { once: true });
        }
      }
    }, 100);
    
    // First pause all videos to prevent conflicts
    videoRefs.current.forEach((video, idx) => {
      if (video && idx !== currentIndex) {
        video.pause();
        // Only reset position if we're not going to play this video soon
        if (Math.abs(idx - currentIndex) > 1) {
          video.currentTime = 0;
        }
      }
    });
    
    // Cleanup function to cancel timeout and pause videos on unmount
    return () => {
      clearTimeout(playCurrentVideo);
      videoRefs.current.forEach(video => {
        if (video) video.pause();
      });
    };
  }, [currentIndex]);

  const handleKeyDown = (e) => {
    if (swiping) return; // Prevent multiple swipes at once
    
    if (e.key === 'ArrowUp' && currentIndex > 0) {
      setSwiping(true);
      setCurrentIndex(prevIndex => prevIndex - 1);
      setTimeout(() => setSwiping(false), 400);
    } else if (e.key === 'ArrowDown' && currentIndex < products.length - 1) {
      setSwiping(true);
      setCurrentIndex(prevIndex => prevIndex + 1);
      setTimeout(() => setSwiping(false), 400);
    }
  };

  // Handle manual navigation with dot indicators
  const goToSlide = (dotIndex) => {
    if (swiping) return;
    
    // Calculate which video to go to based on 4 dot positions
    // For 14 videos, each dot represents roughly 3-4 videos
    let targetVideoIndex;
    
    // Map dotIndex (0-3) to appropriate video index
    switch(dotIndex) {
      case 0: // First dot - first video
        targetVideoIndex = 0;
        break;
      case 1: // Second dot - around 1/3 through
        targetVideoIndex = 4;
        break;
      case 2: // Third dot - around 2/3 through
        targetVideoIndex = 8;
        break;
      case 3: // Fourth dot - last section
        targetVideoIndex = 12;
        break;
      default:
        targetVideoIndex = 0;
    }
    
    setSwiping(true);
    setCurrentIndex(targetVideoIndex);
    setTimeout(() => setSwiping(false), 400);
  };

  const handlePurchase = async (productId) => {
    try {
      console.log('[ProductFeed] handlePurchase:', productId)
      
      // Show transaction modal
      setShowTxModal(true)
      setTxState('pending')
      
      // Get product information
      const product = products.find(p => p.id === productId)
      setSelectedProduct(product)
      
      // Wait for wallet connection
      setTxState('signing')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simulate contract interaction
      setTxState('contract')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate confirming transaction
      setTxState('confirming')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // If product is limited edition (NFT), simulate minting
      if (product.isLimited) {
        setTxState('minting')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      
      // Complete transaction
      const result = await purchaseProduct(productId)
      
      if (result.success) {
        setTxState('completed')
        setTxDetails(result)
        
        // Show confetti effect
        setShowConfetti(true)
        setTimeout(() => {
          setShowConfetti(false)
        }, 5000)
        
        // Store transaction in localStorage for transaction feed
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]')
        const newTransaction = {
          id: `tx-${Date.now()}`,
          name: product.title,
          image: product.image,
          price: `${product.price.toFixed(3)} ETH`,
          timestamp: Date.now(),
          type: product.isLimited ? 'nft' : 'physical',
          txHash: result.txHash,
          nftId: product.isLimited ? result.nftId : null
        }
        
        localStorage.setItem('transactions', JSON.stringify([...transactions, newTransaction]))
        
        // Close modal after delay
        setTimeout(() => {
          setShowTxModal(false)
          setTxState('idle')
          setTxDetails(null)
        }, 3000)
      } else {
        setTxState('failed')
        // Close modal after delay
        setTimeout(() => {
          setShowTxModal(false)
          setTxState('idle')
          setTxDetails(null)
        }, 3000)
      }
    } catch (error) {
      console.error("Error purchasing product:", error)
      setTxState('failed')
      // Close modal after delay
      setTimeout(() => {
        setShowTxModal(false)
        setTxState('idle')
        setTxDetails(null)
      }, 3000)
    }
  }
  
  // Handle add button click in bottom navigation
  const handleAddButtonClick = () => {
    // Add current product to cart
    const currentProduct = products[currentIndex]
    if (currentProduct) {
      addToCart(currentProduct)
      
      // Show notification
      setNotifications(prevNotifications => [
        {
          id: Date.now(),
          message: `Added ${currentProduct.title} to cart!`,
          type: 'success'
        },
        ...prevNotifications
      ])
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        setNotifications(prevNotifications => 
          prevNotifications.filter(notification => notification.id !== Date.now())
        )
      }, 3000)
    }
  }

  const toggleDetails = (product) => {
    setSelectedProduct(product)
    setShowDetails(!showDetails)
  }

  // Function to add a comment to a product
  const addComment = (productId, commentText) => {
    if (!commentText.trim()) return;
    
    const newCommentObj = {
      id: Date.now(),
      username: 'you',
      text: commentText,
      timestamp: 'just now',
      likes: 0,
      isLiked: false
    };
    
    setComments(prevComments => ({
      ...prevComments,
      [productId]: [newCommentObj, ...(prevComments[productId] || [])],
    }));
    
    setNewComment('');
  };

  // Function to like a comment
  const likeComment = (productId, commentId) => {
    setComments(prevComments => {
      const productComments = [...(prevComments[productId] || [])];
      const commentIndex = productComments.findIndex(comment => comment.id === commentId);
      
      if (commentIndex !== -1) {
        const comment = productComments[commentIndex];
        const updatedComment = {
          ...comment,
          isLiked: !comment.isLiked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
        };
        productComments[commentIndex] = updatedComment;
      }
      
      return {
        ...prevComments,
        [productId]: productComments
      };
    });
  };

  // Initialize with some default comments
  useEffect(() => {
    const defaultComments = {};
    
    products.forEach(product => {
      defaultComments[product.id] = [
        {
          id: 1000 + product.id,
          username: 'mike.eth',
          text: 'Love this product! Totally worth the USDC.',
          timestamp: '2h ago',
          likes: 8,
          isLiked: false
        },
        {
          id: 2000 + product.id,
          username: 'sarah.lens',
          text: 'Just purchased! The NFT bonus is amazing.',
          timestamp: '5h ago',
          likes: 12,
          isLiked: false
        }
      ];
    });
    
    setComments(defaultComments);
  }, [products]);

  // Focus the comment input when details are shown
  useEffect(() => {
    if (showDetails && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current.focus();
      }, 500);
    }
  }, [showDetails]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 bg-black overflow-hidden touch-none" 
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex="0"
    >
      {/* Fixed confetti implementation - now using absolute positioning with preserved pointer events for swipe */}
      {showConfetti && typeof window !== 'undefined' && (
        <div className="absolute inset-0 z-[100] pointer-events-none">
          <Confetti 
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={800}
            gravity={0.15}
            tweenDuration={8000}
            colors={['#FF005C', '#FF7A00', '#0052FF', '#5E17EB', '#00FFFF', '#FFD700']}
            confettiSource={{x: window.innerWidth / 2, y: 0, w: 0, h: 0}}
            initialVelocityY={15}
            initialVelocityX={5}
          />
        </div>
      )}

      {/* Celebration text that appears with confetti - made pointer-events-none */}
      {showConfetti && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 z-[101] text-center pointer-events-none">
          <div className="text-3xl font-bold text-white bg-gradient-to-r from-[#FF005C] to-[#FF7A00] bg-clip-text text-transparent animate-pulse mb-2">
            Purchase Successful!
          </div>
          <div className="text-lg text-white">
            NFT receipt minted to your wallet
          </div>
        </div>
      )}

      {/* Custom swipeable view container - ensuring it receives touch events */}
      <div className="w-full h-full relative overflow-hidden">
        {products.map((product, i) => {
          // Calculate dynamic transform based on active slide and current drag
          let transform = '';
          
          if (i === currentIndex) {
            // Current slide - move with touch
            transform = `translateY(${-touchDelta}px)`;
          }
          else if (i === currentIndex + 1 && swipeDirection === 'up') {
            // Next slide when swiping up - start to reveal
            transform = `translateY(calc(100% - ${touchDelta}px))`;
          }
          else if (i === currentIndex - 1 && swipeDirection === 'down') {
            // Previous slide when swiping down - start to reveal
            transform = `translateY(calc(-100% + ${-touchDelta}px))`;
          }
          else if (i < currentIndex) {
            // Previous slides
            transform = 'translateY(-100%)';
          }
          else {
            // Next slides
            transform = 'translateY(100%)';
          }
          
          return (
            <div 
              key={product.id} 
              className="absolute top-0 left-0 w-full h-full transition-transform duration-300 ease-out"
              style={{ 
                transform,
                zIndex: i === currentIndex ? 10 : 5,
                transition: touchDelta !== 0 ? 'none' : 'transform 0.3s ease-out'
              }}
            >
              <ProductCard 
                product={product} 
                onPurchase={handlePurchase} 
                onShowDetails={() => toggleDetails(product)}
                videoRef={(el) => videoRefs.current[i] = el}
                isActive={i === currentIndex}
              />
            </div>
          );
        })}
      </div>
      
      {/* Product Details Overlay */}
      {showDetails && selectedProduct && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-30 transition-all duration-300"
          onClick={() => setShowDetails(false)}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 bg-black rounded-t-3xl p-6 transition-transform duration-300 transform translate-y-0"
            onClick={e => e.stopPropagation()}
            style={{ maxHeight: '85vh', overflowY: 'auto' }}
          >
            <div className="w-12 h-1 bg-gray-500 mx-auto mb-6 rounded-full"></div>
            
            {/* Product Media Gallery */}
            <div className="mb-6">
              <div className="aspect-video rounded-xl overflow-hidden relative">
                {selectedProduct.video ? (
                  <video
                    src={selectedProduct.video}
                    className="w-full h-full object-cover"
                    loop
                    autoPlay
                    muted
                    playsInline
                  />
                ) : (
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.title} 
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Media Indicators */}
                <div className="absolute bottom-3 right-3 flex space-x-2">
                  {selectedProduct.video && (
                    <div className="bg-black/50 backdrop-blur-sm p-1.5 rounded-full">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="bg-black/50 backdrop-blur-sm p-1.5 rounded-full">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                
                {/* Product Label */}
                <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
                    style={{
                      background: selectedProduct.isLimited 
                      ? 'linear-gradient(90deg, rgba(138,58,185,0.8) 0%, rgba(233,89,80,0.8) 100%)' 
                      : 'linear-gradient(90deg, rgba(0,82,255,0.8) 0%, rgba(0,212,255,0.8) 100%)'
                    }}>
                  <span>{selectedProduct.isLimited ? 'NFT' : 'Product'}</span>
                </div>
              </div>
              
              {/* Thumbnails */}
              <div className="flex mt-2 space-x-2">
                <div className="h-16 w-16 rounded-md overflow-hidden border-2 border-purple-500">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {selectedProduct.video && (
                  <div className="h-16 w-16 rounded-md overflow-hidden border border-gray-700 relative">
                    <video
                      src={selectedProduct.video}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedProduct.title}</h2>
                <div className="flex items-center">
                  <span className="text-xl font-bold text-white">{selectedProduct.price.toFixed(3)} ETH</span>
                  <span className="ml-2 text-gray-400 text-sm">≈ ${(selectedProduct.price * 3500).toFixed(2)} USD</span>
                </div>
              </div>
              <div className="bg-gray-800 rounded-full px-2 py-1">
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span className="text-white">{selectedProduct.rating}</span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">{selectedProduct.description}</p>
            
            {/* Display product tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedProduct.tags.map(tag => (
                <span key={tag} className="text-xs bg-gray-800/80 text-gray-300 px-2 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-white mb-2">{selectedProduct.isLimited ? 'NFT Benefits' : 'Product Details'}</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  {selectedProduct.isLimited ? 'Own this as NFT → resell anytime' : 'Authentic Base merchandise'}
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  {selectedProduct.isLimited ? 'Earn 5% cashback in tokens' : 'Ships within 2-3 business days'}
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  {selectedProduct.isLimited ? 'Exclusive community access' : 'Official Base product'}
                </li>
              </ul>
            </div>
            
            <div className="flex space-x-2 mb-6">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePurchase(selectedProduct.id);
                  setShowDetails(false);
                }}
                className="flex-1 bg-gradient-to-r from-[#FF005C] to-[#FF7A00] text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"></path>
                </svg>
                Buy Now
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(selectedProduct);
                  setShowDetails(false);
                }}
                className="bg-white/20 backdrop-blur-sm p-4 rounded-lg hover:bg-white/30 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </button>
            </div>
            
            {/* Instagram-style Comment Section */}
            <div className="mb-6">
              <h3 className="font-medium text-white mb-3 flex items-center justify-between">
                <span>Comments</span>
                <span className="text-sm text-gray-400">{comments[selectedProduct.id]?.length || 0} comments</span>
              </h3>
              
              {/* Comment Input */}
              <div className="flex items-center bg-gray-800 rounded-full overflow-hidden mb-4 px-4 py-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0 mr-2"></div>
                <input
                  ref={commentInputRef}
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent text-white text-sm border-none outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addComment(selectedProduct.id, newComment);
                    }
                  }}
                />
                <button
                  disabled={!newComment.trim()}
                  onClick={() => addComment(selectedProduct.id, newComment)}
                  className={`ml-2 text-sm font-semibold ${newComment.trim() ? 'text-blue-500' : 'text-blue-800'}`}
                >
                  Post
                </button>
              </div>
              
              {/* Comment List */}
              <div className="space-y-4">
                {comments[selectedProduct.id]?.map(comment => (
                  <div key={comment.id} className="flex items-start">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r flex-shrink-0 mr-2 ${
                      comment.username === 'mike.eth' ? 'from-purple-500 to-blue-500' : 
                      comment.username === 'sarah.lens' ? 'from-green-500 to-teal-500' : 
                      'from-blue-500 to-purple-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex items-start">
                        <div>
                          <div className="flex items-baseline">
                            <span className="font-medium text-white text-sm">{comment.username}</span>
                            <span className="ml-2 text-xs text-gray-400">{comment.timestamp}</span>
                          </div>
                          <p className="text-gray-300 text-sm">{comment.text}</p>
                          
                          <div className="flex items-center mt-1 text-xs text-gray-400">
                            <button 
                              onClick={() => likeComment(selectedProduct.id, comment.id)}
                              className="mr-3 focus:outline-none"
                            >
                              {comment.likes > 0 ? (
                                <span className={comment.isLiked ? 'text-red-500' : ''}>
                                  {comment.isLiked ? 'Liked' : 'Like'} · {comment.likes}
                                </span>
                              ) : (
                                <span className={comment.isLiked ? 'text-red-500' : ''}>Like</span>
                              )}
                            </button>
                            <button className="mr-3 focus:outline-none">Reply</button>
                            {comment.username === 'you' && (
                              <button className="focus:outline-none">Delete</button>
                            )}
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => likeComment(selectedProduct.id, comment.id)}
                          className="ml-auto p-1 focus:outline-none"
                        >
                          <svg 
                            className={`w-3 h-3 ${comment.isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            fill={comment.isLiked ? 'currentColor' : 'none'}
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-800 text-center text-xs text-gray-500">
              Powered by Base
            </div>
          </div>
        </div>
      )}

      {/* Transaction Processing Modal */}
      {showTxModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-md p-6 border border-gray-800 shadow-2xl">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-1">
                {txState === 'pending' && 'Initializing Transaction'}
                {txState === 'signing' && 'Waiting for Signature'}
                {txState === 'contract' && 'Interacting with Smart Contract'}
                {txState === 'confirming' && 'Confirming on Base Network'}
                {txState === 'minting' && 'Minting NFT Receipt'}
                {txState === 'completed' && 'Transaction Complete!'}
                {txState === 'failed' && 'Transaction Failed'}
              </h3>
              <p className="text-gray-400 text-sm">
                {txState === 'pending' && 'Connecting to Base Network...'}
                {txState === 'signing' && 'Please approve the transaction in your wallet'}
                {txState === 'contract' && 'Executing purchase on Marketplace contract'}
                {txState === 'confirming' && 'Waiting for network confirmation'}
                {txState === 'minting' && 'Creating your digital receipt as an NFT'}
                {txState === 'completed' && 'Successfully purchased on Base'}
                {txState === 'failed' && 'There was an error processing your transaction'}
              </p>
            </div>
            
            {/* Transaction Progress Indicator */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    txState !== 'idle' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-400">Initialize</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    ['signing', 'contract', 'confirming', 'minting', 'completed'].includes(txState) 
                      ? 'bg-blue-600 text-white' 
                      : txState === 'failed' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-400">Sign</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    ['contract', 'confirming', 'minting', 'completed'].includes(txState) 
                      ? 'bg-blue-600 text-white' 
                      : txState === 'failed' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-400">Contract</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    ['confirming', 'minting', 'completed'].includes(txState) 
                      ? 'bg-blue-600 text-white' 
                      : txState === 'failed' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-400">Confirm</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    ['minting', 'completed'].includes(txState) 
                      ? 'bg-blue-600 text-white' 
                      : txState === 'failed' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-400">NFT</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${txState === 'failed' ? 'bg-red-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}
                  style={{ 
                    width: txState === 'pending' ? '20%' : 
                           txState === 'signing' ? '40%' : 
                           txState === 'contract' ? '60%' : 
                           txState === 'confirming' ? '80%' : 
                           txState === 'minting' || txState === 'completed' || txState === 'failed' ? '100%' : '0%'
                  }}
                ></div>
              </div>
            </div>
            
            {/* Transaction Animation */}
            <div className="flex justify-center my-8">
              {txState === 'pending' && (
                <div className="animate-pulse h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              )}
              
              {txState === 'signing' && (
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gray-800 flex items-center justify-center">
                    <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-4 border-blue-500 animate-ping opacity-20"></div>
                </div>
              )}
              
              {txState === 'contract' && (
                <div className="h-24 w-24 rounded-full bg-gray-800 flex items-center justify-center relative overflow-hidden">
                  <svg className="w-12 h-12 text-purple-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                </div>
              )}
              
              {txState === 'confirming' && (
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
                    <div className="text-xs text-blue-300 font-mono animate-pulse">
                      BASE
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center animate-bounce">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-blue-400 font-mono">
                    BLOCK #{txDetails?.blockNumber || '...'}
                  </div>
                </div>
              )}
              
              {txState === 'minting' && (
                <div className="relative">
                  <div className="h-24 w-24 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 flex flex-col items-center justify-center text-white p-2">
                    <div className="text-xs mb-1">NFT</div>
                    <div className="text-xs font-mono"># {txDetails?.nftId || '000000'}</div>
                    <div className="absolute inset-0 rounded-lg border-2 border-white animate-ping opacity-20"></div>
                  </div>
                  <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 p-1 bg-gray-900 rounded-full">
                    <svg className="w-6 h-6 text-green-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                </div>
              )}
              
              {txState === 'completed' && (
                <div className="relative">
                  <div className="h-24 w-24 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 flex flex-col items-center justify-center text-white p-2 shadow-lg shadow-purple-500/30">
                    <div className="text-xs mb-1">NFT RECEIPT</div>
                    <div className="text-xs font-mono"># {txDetails?.nftId || '000000'}</div>
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
              
              {txState === 'failed' && (
                <div className="h-24 w-24 rounded-full bg-red-800/30 border-2 border-red-600 flex items-center justify-center">
                  <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Transaction Details */}
            {txDetails && ['confirming', 'minting', 'completed'].includes(txState) && (
              <div className="bg-gray-800 rounded-lg p-4 text-sm border border-gray-700">
                <h4 className="text-white font-medium mb-2">Transaction Details</h4>
                <div className="space-y-2 text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Product:</span>
                    <span className="text-right">{txDetails.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span className="text-right">{txDetails.amount} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Seller:</span>
                    <span className="text-right">{txDetails.seller}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Network:</span>
                    <span className="text-right flex items-center">
                      <svg className="w-3 h-3 mr-1 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="8" />
                      </svg>
                      {txDetails.network}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Block:</span>
                    <span className="text-right">{txDetails.blockNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gas:</span>
                    <span className="text-right">{txDetails.gasUsed} ETH</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-1">Hash:</span>
                    <span className="font-mono text-xs text-gray-400 truncate">
                      {txDetails?.hash ? `${txDetails.hash.substring(0, 18)}...` : 'Processing...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="mt-6 flex justify-center">
              {txState === 'completed' ? (
                <button 
                  onClick={() => {
                    setShowTxModal(false);
                    setShowDetails(false);
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium"
                >
                  Continue Shopping
                </button>
              ) : txState === 'failed' ? (
                <button 
                  onClick={() => {
                    setShowTxModal(false);
                    setTxState('idle');
                  }}
                  className="px-6 py-2 bg-gray-700 rounded-lg text-white font-medium"
                >
                  Close
                </button>
              ) : (
                <div className="flex items-center text-gray-400 text-sm">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing on Base...
                </div>
              )}
            </div>
            
            {txState === 'completed' && (
              <div className="mt-4 text-center">
                <a 
                  href={`https://sepolia.basescan.org/tx/${txDetails?.hash || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 text-sm underline hover:text-blue-300"
                >
                  View on BaseScan
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom navigation - Add button click handler */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md flex items-center justify-around z-20">
        <button className="flex flex-col items-center text-gray-400 relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">Home</span>
        </button>
        <button
          onClick={handleAddButtonClick} 
          className="flex flex-col items-center text-gray-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs">Add</span>
        </button>
        <button 
          onClick={() => router.push('/profile')}
          className="flex flex-col items-center text-gray-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs">Profile</span>
        </button>
      </div>
      
      {/* Notifications */}
      <div className="fixed bottom-20 left-4 right-4 z-40 pointer-events-none">
        {notifications.map(notification => (
          <div 
            key={notification.id}
            className={`mb-2 p-3 rounded-lg bg-black/80 backdrop-blur-sm border-l-4 ${
              notification.type === 'success' ? 'border-green-500' : 'border-red-500'
            } text-white text-sm animate-slide-in`}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </div>
  )
} 
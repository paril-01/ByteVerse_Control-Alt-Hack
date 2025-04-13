'use client'

import { useState, useEffect } from 'react'

// Mock notifications
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'sale',
    title: 'Your "Vintage Sneakers" NFT just sold! 🎉',
    time: '5 minutes ago',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    read: false
  },
  {
    id: 2,
    type: 'reward',
    title: 'Emma liked your purchase – earn 10 $SHOP tokens',
    time: '2 hours ago',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    read: false
  },
  {
    id: 3,
    type: 'drop',
    title: 'New drop: Limited NFT hoodies in 1h ⏰',
    time: '3 hours ago',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    read: true
  },
  {
    id: 4,
    type: 'badge',
    title: 'You earned a new badge: "Early Shopper" 🏆',
    time: '1 day ago',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    read: true
  }
]

export default function Notifications() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [showNotificationBanner, setShowNotificationBanner] = useState(false)
  const [activeBanner, setActiveBanner] = useState(null)
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  useEffect(() => {
    // Auto-show a notification banner for demo purposes
    const showBanner = setTimeout(() => {
      if (notifications.length > 0) {
        setActiveBanner(notifications[0])
        setShowNotificationBanner(true)
        
        // Hide banner after 5 seconds
        setTimeout(() => {
          setShowNotificationBanner(false)
        }, 5000)
      }
    }, 10000)
    
    return () => clearTimeout(showBanner)
  }, [notifications])
  
  const toggleNotifications = () => {
    setIsOpen(!isOpen)
    
    // Mark all as read when opening
    if (!isOpen) {
      setNotifications(notifications.map(n => ({ ...n, read: true })))
    }
  }
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'sale':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'reward':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
        )
      case 'drop':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        )
      case 'badge':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        )
    }
  }

  return (
    <div className="relative">
      {/* Notification Button */}
      <button 
        onClick={toggleNotifications}
        className="relative rounded-full p-2 bg-gray-800 text-white hover:bg-gray-700"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#FF005C] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {/* Notifications Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-black rounded-xl shadow-lg z-50 overflow-hidden border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-bold">Notifications</h3>
              <button className="text-gray-400 text-xs hover:text-white">Mark all as read</button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No notifications yet
              </div>
            ) : (
              <div>
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border-b border-gray-800 hover:bg-gray-900 ${notification.read ? 'opacity-70' : ''}`}
                  >
                    <div className="flex">
                      <div className="flex-shrink-0 mr-3">
                        <div className="relative">
                          <img 
                            src={notification.image} 
                            alt="" 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-white text-sm">{notification.title}</p>
                        <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-800 text-center">
            <button className="text-blue-400 text-sm hover:text-blue-300">
              View all notifications
            </button>
          </div>
        </div>
      )}
      
      {/* Toast Notification Banner */}
      {showNotificationBanner && activeBanner && (
        <div className="fixed top-4 right-4 z-50 w-80 bg-black rounded-lg shadow-lg border border-gray-800 overflow-hidden">
          <div className="p-4">
            <div className="flex">
              <div className="flex-shrink-0 mr-3">
                <div className="relative">
                  <img 
                    src={activeBanner.image} 
                    alt="" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-1">
                    {getNotificationIcon(activeBanner.type)}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="text-white text-sm font-medium">ShopTok</p>
                  <button 
                    onClick={() => setShowNotificationBanner(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-200 text-sm mt-1">{activeBanner.title}</p>
                <p className="text-gray-400 text-xs mt-1">{activeBanner.time}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-[#FF005C] to-[#FF7A00] h-1 animate-pulse"></div>
        </div>
      )}
    </div>
  )
} 
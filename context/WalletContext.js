'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { 
  ThirdwebSDK,
  SmartWallet,
  metamaskWallet,
  coinbaseWallet
} from "@thirdweb-dev/react"
import { BaseGoerli } from "@thirdweb-dev/chains"

// Create context
const WalletContext = createContext({
  address: null,
  isConnected: false,
  balance: '0',
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  purchaseProduct: async () => {},
  likeProduct: async () => {},
  loading: false
})

// Context provider
export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [balance, setBalance] = useState('0')
  const [sdk, setSdk] = useState(null)
  const [marketplace, setMarketplace] = useState(null)
  const [nftContract, setNftContract] = useState(null)
  const [loading, setLoading] = useState(false)

  // Initialize SDK
  useEffect(() => {
    try {
      // Use mock addresses if the real ones aren't available
      const marketplaceAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0x1234567890123456789012345678901234567890"
      const nftAddress = process.env.NEXT_PUBLIC_RECEIPT_NFT_ADDRESS || "0x0987654321098765432109876543210987654321"
      
      const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
      const newSdk = new ThirdwebSDK(BaseGoerli, { clientId })
      
      setSdk(newSdk)
      
      // Initialize contract instances
      const initContracts = async () => {
        try {
          const marketplaceContract = await newSdk.getContract(marketplaceAddress)
          const nftReceiptContract = await newSdk.getContract(nftAddress)
          
          setMarketplace(marketplaceContract)
          setNftContract(nftReceiptContract)
        } catch (error) {
          console.error("Error initializing contracts:", error)
        }
      }
      
      initContracts()
    } catch (error) {
      console.error("Error initializing wallet context:", error)
    }
  }, [])

  // Connect wallet functions
  const connectWallet = async () => {
    try {
      setLoading(true)
      // Use Coinbase Wallet for best Base compatibility
      const wallet = coinbaseWallet()
      await wallet.connect()
      
      const userAddress = await wallet.getAddress()
      const userBalance = await wallet.getBalance()
      
      setAddress(userAddress)
      setBalance(userBalance.displayValue)
      setIsConnected(true)
      
      // For demo purposes, we'll add mock wallets
      if (!userAddress) {
        setAddress("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045")
        setBalance("1250.65")
        setIsConnected(true)
      }
      
      return userAddress
    } catch (error) {
      console.error("Error connecting wallet:", error)
      // For demo, set mock address if connection fails
      setAddress("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045")
      setBalance("1250.65")
      setIsConnected(true)
      return "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      setAddress(null)
      setBalance('0')
      setIsConnected(false)
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
    }
  }

  // Purchase product function
  const purchaseProduct = async (productId) => {
    if (!isConnected) {
      await connectWallet()
    }
    
    try {
      // In a real implementation, this would make a contract call
      // For demo purposes, we'll simulate a successful transaction
      console.log(`Purchasing product ${productId}`)
      
      // Simulate blockchain transaction time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock transaction hash
      const txHash = "0x" + Math.random().toString(16).substr(2, 64)
      
      // Return mock transaction data
      return {
        success: true,
        txHash,
        productId,
        timestamp: Date.now(),
        nftId: Math.floor(Math.random() * 1000000) + 100000,
      }
    } catch (error) {
      console.error("Error purchasing product:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Like product function
  const likeProduct = async (productId) => {
    if (!isConnected) {
      await connectWallet()
    }
    
    try {
      // In a real implementation, this would make a contract call or API call
      // For demo purposes, we'll simulate a successful like
      console.log(`Liking product ${productId}`)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Return mock like data
      return {
        success: true,
        productId,
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error("Error liking product:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        balance,
        connectWallet,
        disconnectWallet,
        purchaseProduct,
        likeProduct,
        loading
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

// Custom hook to use the wallet context
export function useWallet() {
  const context = useContext(WalletContext)
  
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  
  return context
} 
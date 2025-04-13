'use client'

import { useState } from 'react'
import { useWallet } from '../context/WalletContext'

export default function Login() {
  const { connectWallet, loading } = useWallet()
  const [loginStep, setLoginStep] = useState('initial') // initial, connecting, minting, complete
  const [error, setError] = useState(null)

  const handleSocialLogin = async (provider) => {
    try {
      setLoginStep('connecting')
      setError(null)
      const result = await connectWallet()
      
      if (result) {
        // Simulate minting ERC-6551 profile NFT
        setLoginStep('minting')
        await new Promise(resolve => setTimeout(resolve, 2000))
        setLoginStep('complete')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Failed to connect. Please try again.')
      setLoginStep('initial')
    }
  }

  return (
    <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">ShopTok</h1>
        <p className="text-gray-600 dark:text-gray-300">TikTok-style shopping owned by its users</p>
      </div>
      
      {loginStep === 'initial' && (
        <div>
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 p-3 rounded-lg border border-gray-300 hover:bg-gray-50 mb-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            Continue with Google
          </button>
          
          <button
            onClick={() => handleSocialLogin('apple')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-black text-white p-3 rounded-lg hover:bg-gray-900 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.18 14.2 3.06 5.76 9.25 5.48c1.68.06 2.82 1.1 3.73 1.12 1.38-.07 2.64-1.14 4.01-1.23 1.7-.04 3.25.91 4.14 2.53-3.67 2.07-2.84 6.88.49 8.2-.71 1.96-1.62 3.93-3.57 6.18zM12.03 5.38C11.76 2.75 14.01.51 16.35.5c.52 2.43-1.77 5.06-4.32 4.88z" fill="white"></path>
            </svg>
            Continue with Apple
          </button>
          
          {error && <p className="text-red-500 mt-4 text-sm text-center">{error}</p>}
        </div>
      )}
      
      {loginStep === 'connecting' && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Connecting your wallet...</p>
        </div>
      )}
      
      {loginStep === 'minting' && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Creating your unique profile...</p>
          <p className="text-sm text-gray-500 mt-2">Minting ERC-6551 NFT</p>
        </div>
      )}
      
      {loginStep === 'complete' && (
        <div className="text-center">
          <div className="h-12 w-12 bg-green-500 text-white flex items-center justify-center rounded-full mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p>Login successful!</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting to your feed...</p>
        </div>
      )}
      
      <div className="mt-8 text-xs text-center text-gray-500">
        <p>By continuing, you agree to ShopTok's Terms of Service & Privacy Policy</p>
        <p className="mt-2">No crypto knowledge needed. All powered by Base.</p>
      </div>
    </div>
  )
} 
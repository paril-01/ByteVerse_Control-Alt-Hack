import { Inter } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '../context/WalletContext'
import { CartProvider } from '../context/CartContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ShopTok - TikTok-style Social Commerce',
  description: 'A TikTok-style social commerce platform on Base',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style>
          {`
            @keyframes slideIn {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            
            @keyframes bounceIn {
              0% { transform: scale(0.3); opacity: 0; }
              50% { transform: scale(1.1); opacity: 0.7; }
              100% { transform: scale(1); opacity: 1; }
            }
            
            .animate-slide-in {
              animation: slideIn 0.3s ease-out forwards;
            }
            
            .animate-bounce-in {
              animation: bounceIn 0.5s ease-out forwards;
            }
          `}
        </style>
      </head>
      <body className={inter.className}>
        <WalletProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </WalletProvider>
      </body>
    </html>
  )
} 
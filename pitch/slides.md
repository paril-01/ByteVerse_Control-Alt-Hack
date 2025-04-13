# ShopTok: TikTok meets Amazon onchain

## Slide 1: Vision

**ShopTok: Social Commerce Owned by its Users**

* Problem: TikTok & Instagram shopping experiences owned by centralized platforms
* Solution: Decentralized social commerce where creators & users share ownership
* Opportunity: $1.2T social commerce market by 2025 (25% annual growth)

---

## Slide 2: Technical Architecture

**How ShopTok Works**

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│ Smart Wallet │────▶│ Base L2 Chain │────▶│ ERC-6551 NFTs │
└─────────────┘     └──────────────┘     └───────────────┘
       │                                          │
       │                                          │
       ▼                                          ▼
┌─────────────┐                         ┌───────────────┐
│ Social Login │                         │ Reputation    │
└─────────────┘                         └───────────────┘
       │                                          ▲
       │                                          │
       ▼                                          │
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│ Product Feed │────▶│ AgentKit AI   │────▶│ User Behavior │
└─────────────┘     └──────────────┘     └───────────────┘
```

* Zero-knowledge onboarding (Google/Apple → Smart Wallet)
* Base L2 for fast, low-cost transactions
* ERC-6551 NFTs for on-chain identity & reputation
* AgentKit for personalized recommendations

---

## Slide 3: Roadmap

**From MVP to Full Platform**

**Phase 1: MVP (Current)**
* 1-click social login
* Mock AI product feed
* Demo purchase flow
* Basic NFT profile badges

**Phase 2: Growth (Q3 2023)**
* Live AgentKit recommendations
* AR product try-ons
* Creator onboarding tools
* Social DAO governance

**Phase 3: Monetization (Q4 2023)**
* Cross-chain loyalty rewards
* NFT-gated referral system
* Dynamic fees via Chainlink
* USDC cross-chain swaps 
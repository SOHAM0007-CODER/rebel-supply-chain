# 🛡️ SUPPLY CHAIN RESILIENCE & RISK ANALYZER

A high-fidelity, advanced frontend platform for analyzing multi-tier supply chain vulnerabilities, detecting single points of failure, simulating cascading disruptions, and automatically finding alternative suppliers.

<img src="https://raw.githubusercontent.com/aryan54-rgb/REBEL_SUPPLY_CHAIN/main/dashboard_screenshot.png" alt="Dashboard Preview">

## 🚀 Overview

The Supply Chain Resilience & Risk Analyzer models complex global supply chains as a Directed Acyclic Graph (DAG) using a realistic, built-in 50-node dataset spanning 5 tiers and 6 continents.

Built with a stunning Neo-Brutalist design system, this platform is optimized for **100% frontend execution**, meaning zero database configuration or backend is required. Simply install and simulate!

### Core Capabilities

- **Interactive Network Graph:** 5-tier DAG layout (Raw Materials → Retailers) beautifully rendered using React Flow, complete with a VS Code style toggleable minimap.
- **Cascading Risk Engine:** Proprietary algorithm that calculates how failures propagate through the network.
- **Disruption Simulator:** Powerful "What-if" analysis. Toggle suppliers offline and instantly visualize the downstream impact via animated paths.
- **Smart Alternative Replacements:** AI-style engine that instantly identifies, ranks, and recommends replacement suppliers (with animated visual links) when a node goes offline.
- **Rich Mitigation Panel:** Detailed impact analysis showcasing Cost changes (Cost Δ), Risk changes (Risk Δ), and Single Points of Failure.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom Neo-Brutalist Design System
- **Visualization:** React Flow (Network) & Recharts (Analytics Data)
- **State Management:** Zustand
- **Icons:** Lucide React

## 📦 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation & Running

1. **Clone the repository:**
   ```bash
   git clone https://github.com/aryan54-rgb/REBEL_SUPPLY_CHAIN.git
   cd REBEL_SUPPLY_CHAIN
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Experience the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

*(Note: This version is specifically optimized to run entirely on frontend mock data and local state, completely removing any Prisma/MySQL backend overhead.)*

## 📊 Dataset Structure

The platform uses a comprehensive electronics supply chain dataset out of the box:

- **Nodes:** 50 Suppliers/Entities across 5 tiers
- **Edges:** 57 Supply Relationships
- **Risk Dimensions:** Geopolitical, Weather, Shipping, Financial Stability, Component Criticality
- **Capacity Metrics:** Production capacity tracking
- **Geographic Data:** Global layout tracking Region and Country for intelligent diversification

## 🎯 Key Interactive Features To Try

1. **Network Minimap:** Head to the Dashboard or Simulate tab and look at the bottom right of the graph. You can toggle the interactive minimap to easily navigate massive supply chains.
2. **Rich Recommendations:** Click on any node in the graph. The Neo-Brutalist Mitigation Panel on the right will instantly give you a detailed breakdown of the node's risk and offer ranked alternatives.
3. **Disruption Simulation:** Go to the "Simulate" tab. In the right panel, toggle any major Tier 1 or Tier 2 supplier to the "Offline" state. Hit **Simulate**! Watch as:
   - The graph recalculates paths.
   - Downstream dependent nodes flash warnings.
   - Beautiful **animated dashed lines** instantly appear, linking your orphaned customer nodes to the highest-ranked alternative suppliers automatically found by the system!

## 📂 Project Structure

```text
REBEL_SUPPLY_CHAIN/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Main dashboard
│   ├── analytics/            # Enhanced analytics with Recharts
│   ├── simulate/             # Advanced disruption simulator
│   └── suppliers/            # Supplier management view
├── components/               # React components
│   ├── NetworkGraph.tsx      # Interactive supply chain visualization (React Flow)
│   ├── DisruptionSimulator.tsx # Simulator controls
│   ├── MitigationPanel.tsx   # Detailed analysis and replacement engine
│   └── Navigation.tsx        # App Navigation
├── lib/                      # Core business logic
│   ├── algorithms.ts         # Cascading risk calculation algorithms
│   ├── alternativeFinder.ts  # Alternative replacement matching engine
│   ├── riskEngine.ts         # Multi-dimensional risk assessment
│   ├── store.ts              # Zustand state management
│   └── mockData.ts           # Built-in 50-node electronics dataset
├── public/                   # Static assets
└── types/                    # TypeScript definitions
```

## 📜 License

MIT License. See LICENSE for details.

## 🙏 Acknowledgments

Built to push the boundaries of modern, interactive UI/UX for complex enterprise data visualization. Designed and optimized with advanced agentic workflows.

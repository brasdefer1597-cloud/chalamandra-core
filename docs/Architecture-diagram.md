```
# 🏗️ Chalamandra Core - Architecture Diagram

## System Overview

```

┌─────────────────────────────────────────────────────────────┐
│CHALAMANDRA CORE                         │
│Chrome Extension (MV3)                      │
└─────────────────────────────────────────────────────────────┘
│
┌────────────────────┼────────────────────┐
│                    │                    │
▼                    ▼                    ▼
┌─────────────────┐┌─────────────────┐  ┌─────────────────┐
│POPUP UI     │  │  CONTENT        │  │  BACKGROUND     │
│INTERFACE    │  │  SCRIPTS        │  │  SERVICE        │
││  │                 │  │  WORKER         │
└─────────────────┘└─────────────────┘  └─────────────────┘
│                    │                    │
└────────────────────┼────────────────────┘
│
▼
┌─────────────────────┐
│   CORE ANALYSIS     │
│      ENGINE         │
└─────────────────────┘
│
┌────────────────────┼────────────────────┐
▼                    ▼                    ▼
┌─────────────────┐┌─────────────────┐  ┌─────────────────┐
│CHROME AI      │  │  MULTIMODAL     │  │  HYBRID         │
│APIS        │  │   ANALYZER      │  │  ORCHESTRATOR   │
││  │                 │  │                 │
│• Prompt API    │  │ • Text          │  │ • Local First   │
│• Summarizer    │  │ • Emojis        │  │ • Cloud Fallback│
│• Rewriter      │  │ • Images        │  │ • Privacy       │
└─────────────────┘└─────────────────┘  └─────────────────┘

```

## Component Architecture

### 1. Chrome Extension Layer
```

Popup UI (src/popup/)
├──popup.html          # Interface
├──popup.css           # Styling
└──popup.js            # Logic

Content Scripts (src/content/)
├──content.js          # Page analysis
└──content.css         # In-page styles

Background (src/background/)
└──service-worker.js   # Message handling

```

### 2. Core Analysis Engine
```

Core Modules (src/core/)
├──chalamandra-engine.js      # Main orchestrator
├──sarcasm-detector.js        # Sarcasm analysis
├──multimodal-analyzer.js     # Text + visual context
├──explainable-ai.js          # Explanation engine
├──hybrid-orchestrator.js     # Local/cloud balance
└──context-analyzer.js        # Platform/relationship

```

### 3. Chrome AI APIs Integration
```

Chrome Built-in AI APIs
├──Prompt API          # Multimodal analysis
├──Summarizer API      # Quick insights
├──Rewriter API        # Recommendations
└──Translator API      # Multilingual support

```

## Data Flow

```

User Input
│
▼
Content Script(Detect communication)
│
▼
Popup UI(Display analysis)
│
▼
Background(Process request)
│
▼
Core Engine(Analyze dimensions)
│
├── Strategic Analysis (Power dynamics)
├── Emotional Analysis (Tone, sentiment)
    └── Relational Analysis (Trust, connection)
│
▼
Chrome AI APIs(Local processing)
│
▼
Results+ Recommendations
│
▼
User Interface(Display insights)

```

## Privacy-First Architecture

```

LOCAL PROCESSING (Default)
┌─────────────────┐┌─────────────────┐
│User Data     │───▶│  Chrome AI      │
││    │     APIs        │
└─────────────────┘└─────────────────┘
│
▼
┌─────────────────┐
│   Results       │
│  (Device Only)  │
└─────────────────┘

HYBRID MODE (Optional)
┌─────────────────┐┌─────────────────┐    ┌─────────────────┐
│User Data     │───▶│  Anonymization  │───▶│   Cloud AI      │
││    │                 │    │   Enhanced      │
└─────────────────┘└─────────────────┘    └─────────────────┘
│                        │
▼                        ▼
┌─────────────────┐    ┌─────────────────┐
│   Local Results │    │  Enhanced       │
│                 │    │   Insights      │
└─────────────────┘    └─────────────────┘

```

## Technology Stack

```

Frontend Layer
├──Chrome Extension Manifest V3
├──Vanilla JavaScript (ES6+)
├──CSS3 with Custom Properties
└──HTML5

AI/ML Layer
├── Chrome Built-in AI APIs
├──Gemini Nano (On-device)
├──Custom heuristic algorithms
└──Multimodal analysis

Data Layer
├──Chrome Storage API
├──Local caching system
└──Privacy-preserving analytics

```

## Security & Privacy

```

Data Protection
├──100% local processing by default
├──Optional cloud with explicit consent
├──Data anonymization for cloud requests
├──No personal data storage

Permissions
├──activeTab (Current page analysis)
├──scripting (Content injection)
└──storage (User preferences)

```

---

*Architecture Version: 2.0.0*  
*Designed for: Google Chrome Built-in AI Challenge 2025*
```

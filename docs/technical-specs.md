'''
# 🔧 Technical Specifications

## ARCHITECTURE OVERVIEW

```

Chalamandra Core Architecture:
┌─────────────────┐┌──────────────────┐
│Content       │    │    Popup UI      │
│Script        │◄──►│   (Analysis      │
│(Page         │    │    Results)      │
│Analysis)     │    └──────────────────┘
└─────────────────┘▲
▲                      │
│                      │
▼                      ▼
┌─────────────────┐┌──────────────────┐
│Service Worker  │    │ Chrome AI APIs   │
│(Hybrid         │    │ (Gemini Nano)    │
│Architecture)  │───►│ • Prompt API     │
└─────────────────┘│ • Summarizer API │
│ • Rewriter API   │
└──────────────────┘

```

## CHROME AI APIS USED

### Prompt API
- **Usage**: Multidimensional communication analysis
- **Input**: Page text content + analysis instructions
- **Output**: Structured JSON with strategic/emotional/relational insights

### Summarizer API  
- **Usage**: Extract key insights and risk factors
- **Input**: Analysis results
- **Output**: Actionable recommendations

### Rewriter API
- **Usage**: Generate improvement suggestions
- **Input**: Problematic communication patterns
- **Output**: Alternative phrasing and recommendations

## PERFORMANCE CHARACTERISTICS

### Analysis Speed
- Quick Mode: < 1 second (100% local)
- Deep Mode: < 2 seconds (hybrid)
- Multimodal: < 3 seconds (server-enhanced)

### Memory Usage
- Base: ~15MB
- During Analysis: ~25MB
- Peak: < 50MB

### Privacy Features
- Default: 100% local processing
- Optional: Anonymous metadata for enhancement
- Consent: Explicit user permission for server features

## BROWSER COMPATIBILITY

### Required
- Chrome 121+ (Chrome AI APIs)
- Manifest V3 support

### Enhanced Features
- TensorFlow.js for advanced ML (fallback)
- Web Workers for performance
- WebAssembly for complex computations
```

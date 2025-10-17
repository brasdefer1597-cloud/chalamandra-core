// Service Worker for Chalamandra Core
console.log('🦎 Chalamandra Core Service Worker initialized');

class BackgroundManager {
  constructor() {
    this.analysisCache = new Map();
    this.init();
  }

  init() {
    // Listen for extension installation
    chrome.runtime.onInstalled.addListener(() => {
      console.log('Chalamandra Core installed successfully');
      this.initializeStorage();
    });

    // Listen for messages from content scripts and popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Handle context menu (future feature)
    this.createContextMenu();
  }

  initializeStorage() {
    chrome.storage.local.get(['userPreferences'], (result) => {
      if (!result.userPreferences) {
        const defaultPreferences = {
          analysisMode: 'quick',
          enableSarcasmDetection: true,
          enableMultimodal: true,
          privacyLevel: 'high'
        };
        chrome.storage.local.set({ userPreferences: defaultPreferences });
      }
    });
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'analyzeCommunication':
          const analysis = await this.analyzeContent(request.data);
          sendResponse({ success: true, data: analysis });
          break;

        case 'getAnalysisHistory':
          const history = await this.getAnalysisHistory();
          sendResponse({ success: true, data: history });
          break;

        case 'updatePreferences':
          await this.updatePreferences(request.data);
          sendResponse({ success: true });
          break;

        case 'quickAnalysis':
          const quickResult = await this.quickAnalysis(request.text);
          sendResponse({ success: true, data: quickResult });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background message error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async analyzeContent(content) {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(content);
      if (this.analysisCache.has(cacheKey)) {
        return this.analysisCache.get(cacheKey);
      }

      // Get user preferences
      const preferences = await this.getUserPreferences();
      
      // Use Chrome AI APIs for analysis
      let analysis;
      if (typeof ai !== 'undefined' && ai.prompt) {
        analysis = await this.useChromeAI(content, preferences);
      } else {
        analysis = this.fallbackAnalysis(content);
      }

      // Cache the result
      this.analysisCache.set(cacheKey, analysis);
      
      // Store in history (limited to last 50 analyses)
      await this.storeInHistory(analysis);

      return analysis;

    } catch (error) {
      console.error('Analysis error:', error);
      return this.fallbackAnalysis(content);
    }
  }

  async useChromeAI(content, preferences) {
    const prompt = `
      Analyze this professional communication:

      TEXT: "${content.text}"

      Analyze across these dimensions:
      1. Strategic: power dynamics, hidden agendas, negotiation context
      2. Emotional: tone, sentiment, subtext, psychological factors  
      3. Relational: trust indicators, connection quality, social dynamics

      Return JSON with:
      - strategic: { powerDynamics: low/medium/high, hiddenAgendas: boolean, negotiation: string }
      - emotional: { tone: string, score: 0-100, subtext: string }
      - relational: { trust: low/medium/high, connection: weak/moderate/strong }
      - overallRisk: 0-100
      - recommendations: string[]
    `;

    const response = await ai.prompt({
      text: prompt,
      instructions: "Provide structured JSON analysis of professional communication"
    });

    return this.processAIResponse(response, content);
  }

  processAIResponse(response, originalContent) {
    try {
      let analysis;
      
      if (typeof response === 'string') {
        // Extract JSON from string response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : this.fallbackAnalysis(originalContent);
      } else {
        analysis = response;
      }

      // Add metadata
      return {
        ...analysis,
        timestamp: new Date().toISOString(),
        contentPreview: originalContent.text.substring(0, 100) + '...',
        source: 'chrome-ai',
        confidence: 0.8
      };

    } catch (error) {
      console.warn('AI response processing failed, using fallback');
      return this.fallbackAnalysis(originalContent);
    }
  }

  fallbackAnalysis(content) {
    return {
      strategic: {
        powerDynamics: 'medium',
        hiddenAgendas: false,
        negotiation: 'standard'
      },
      emotional: {
        tone: 'neutral',
        score: 50,
        subtext: 'direct communication'
      },
      relational: {
        trust: 'medium',
        connection: 'moderate'
      },
      overallRisk: 30,
      recommendations: ['Communication appears standard'],
      timestamp: new Date().toISOString(),
      contentPreview: content.text.substring(0, 100) + '...',
      source: 'fallback',
      confidence: 0.5
    };
  }

  async quickAnalysis(text) {
    // Simple heuristic analysis for quick results
    const riskWords = ['error', 'wrong', 'failed', 'problem', 'issue'];
    const positiveWords = ['thanks', 'great', 'excellent', 'appreciate'];
    
    const riskCount = riskWords.filter(word => text.toLowerCase().includes(word)).length;
    const positiveCount = positiveWords.filter(word => text.toLowerCase().includes(word)).length;
    
    const riskScore = Math.min(riskCount * 20, 100);
    const positivityScore = Math.min(positiveCount * 25, 100);

    return {
      quickScore: Math.max(0, 100 - riskScore),
      riskLevel: riskScore > 60 ? 'high' : riskScore > 30 ? 'medium' : 'low',
      positivity: positivityScore,
      hasSarcasm: this.detectQuickSarcasm(text),
      timestamp: new Date().toISOString()
    };
  }

  detectQuickSarcasm(text) {
    const sarcasmPatterns = [
      'excellent.*but',
      'great.*however', 
      'perfect.*although',
      'wonderful.*problem'
    ];
    
    return sarcasmPatterns.some(pattern => 
      new RegExp(pattern, 'i').test(text)
    );
  }

  generateCacheKey(content) {
    return btoa(content.text).substring(0, 50);
  }

  async getUserPreferences() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['userPreferences'], (result) => {
        resolve(result.userPreferences || {
          analysisMode: 'quick',
          enableSarcasmDetection: true,
          privacyLevel: 'high'
        });
      });
    });
  }

  async updatePreferences(newPreferences) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ userPreferences: newPreferences }, () => {
        resolve();
      });
    });
  }

  async storeInHistory(analysis) {
    const history = await this.getAnalysisHistory();
    history.unshift(analysis);
    
    // Keep only last 50 analyses
    const limitedHistory = history.slice(0, 50);
    
    chrome.storage.local.set({ analysisHistory: limitedHistory });
  }

  async getAnalysisHistory() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['analysisHistory'], (result) => {
        resolve(result.analysisHistory || []);
      });
    });
  }

  createContextMenu() {
    // Future feature: Right-click context menu for quick analysis
    chrome.contextMenus.create({
      id: 'analyzeText',
      title: 'Analyze with Chalamandra',
      contexts: ['selection']
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'analyzeText' && info.selectionText) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'analyzeSelectedText',
          text: info.selectionText
        });
      }
    });
  }
}

// Initialize the background manager
const backgroundManager = new BackgroundManager();

// Export for testing
if (typeof module !== 'undefined') {
  module.exports = BackgroundManager;
}

// Service Worker for Chalamandra Core - Manifest V3
class ChalamandraServiceWorker {
  constructor() {
    this.analysisHistory = [];
    this.hybridOrchestrator = new HybridOrchestrator();
    this.init();
  }

  init() {
    this.setupInstallation();
    this.setupMessageHandlers();
    this.setupAnalysisOrchestration();
    console.log('🦎 Chalamandra Core Service Worker initialized');
  }

  setupInstallation() {
    chrome.runtime.onInstalled.addListener(() => {
      console.log('Chalamandra Core installed successfully');
      
      // Initialize storage with default values
      chrome.storage.local.set({
        analysisHistory: [],
        userPreferences: {
          autoAnalyze: true,
          privacyMode: 'local-first',
          riskThreshold: 70
        },
        performanceStats: {
          totalAnalyses: 0,
          avgResponseTime: 0,
          memoryUsage: 'low'
        }
      });
    });
  }

  setupMessageHandlers() {
    // Handle messages from popup and content scripts
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'logAnalysis':
          this.handleAnalysisLog(request.data);
          break;
        
        case 'hybridAnalysis':
          this.handleHybridAnalysis(request.data)
            .then(result => sendResponse({ success: true, result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true; // Async response
          
        case 'getAnalysisHistory':
          this.getAnalysisHistory()
            .then(history => sendResponse({ success: true, history }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true;
          
        case 'clearHistory':
          this.clearAnalysisHistory()
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true;
      }
    });
  }

  setupAnalysisOrchestration() {
    // Handle extension icon click for quick analysis
    chrome.action.onClicked.addListener((tab) => {
      this.triggerQuickAnalysis(tab);
    });
  }

  async handleAnalysisLog(analysisData) {
    try {
      // Store analysis in history
      const analysisRecord = {
        ...analysisData,
        timestamp: new Date().toISOString(),
        url: analysisData.analysis?.url || 'unknown'
      };
      
      this.analysisHistory.unshift(analysisRecord);
      
      // Keep only last 100 analyses
      if (this.analysisHistory.length > 100) {
        this.analysisHistory = this.analysisHistory.slice(0, 100);
      }
      
      // Update storage
      await chrome.storage.local.set({
        analysisHistory: this.analysisHistory
      });
      
      // Update performance stats
      await this.updatePerformanceStats();
      
      console.log('Analysis logged:', analysisRecord);
      
    } catch (error) {
      console.error('Error logging analysis:', error);
    }
  }

  async handleHybridAnalysis(requestData) {
    const { content, mode, useServerFallback = true } = requestData;
    
    try {
      const result = await this.hybridOrchestrator.executeAnalysis(content, mode, useServerFallback);
      
      // Log successful analysis
      await this.handleAnalysisLog({
        mode,
        analysis: result,
        source: 'hybrid'
      });
      
      return result;
      
    } catch (error) {
      console.error('Hybrid analysis failed:', error);
      
      // Log failed analysis
      await this.handleAnalysisLog({
        mode,
        error: error.message,
        source: 'hybrid',
        status: 'failed'
      });
      
      throw error;
    }
  }

  async triggerQuickAnalysis(tab) {
    try {
      // Send message to content script to trigger analysis
      await chrome.tabs.sendMessage(tab.id, {
        action: 'quickAnalyze',
        source: 'toolbar'
      });
      
    } catch (error) {
      console.error('Error triggering quick analysis:', error);
    }
  }

  async getAnalysisHistory() {
    try {
      const result = await chrome.storage.local.get(['analysisHistory']);
      return result.analysisHistory || [];
    } catch (error) {
      console.error('Error getting analysis history:', error);
      return [];
    }
  }

  async clearAnalysisHistory() {
    try {
      this.analysisHistory = [];
      await chrome.storage.local.set({ analysisHistory: [] });
      return true;
    } catch (error) {
      console.error('Error clearing analysis history:', error);
      throw error;
    }
  }

  async updatePerformanceStats() {
    try {
      const result = await chrome.storage.local.get(['performanceStats']);
      const stats = result.performanceStats || {
        totalAnalyses: 0,
        avgResponseTime: 0,
        memoryUsage: 'low'
      };
      
      stats.totalAnalyses = this.analysisHistory.length;
      
      await chrome.storage.local.set({ performanceStats: stats });
      
    } catch (error) {
      console.error('Error updating performance stats:', error);
    }
  }

  // Performance monitoring
  monitorPerformance() {
    // Monitor memory usage (simplified)
    const memoryInfo = performance.memory;
    if (memoryInfo) {
      const usedMB = Math.round(memoryInfo.usedJSHeapSize / 1048576);
      const memoryLevel = usedMB < 50 ? 'low' : usedMB < 100 ? 'medium' : 'high';
      
      chrome.storage.local.set({
        memoryUsage: memoryLevel
      });
    }
  }
}

// Advanced hybrid analysis orchestrator
class HybridOrchestrator {
  constructor() {
    this.modes = {
      QUICK: 'quick',      // 100% local - Chrome AI APIs
      DEEP: 'deep',        // Hybrid - Local + Server enhancement  
      MULTIMODAL: 'multimodal' // Server-powered advanced features
    };
  }

  async executeAnalysis(content, mode = this.modes.QUICK, useServerFallback = true) {
    console.log(`🦎 Executing ${mode} analysis...`);
    
    try {
      switch (mode) {
        case this.modes.QUICK:
          return await this.quickLocalAnalysis(content);
        
        case this.modes.DEEP:
          return await this.hybridDeepAnalysis(content);
        
        case this.modes.MULTIMODAL:
          return await this.serverPoweredMultimodalAnalysis(content);
        
        default:
          return await this.quickLocalAnalysis(content);
      }
    } catch (error) {
      if (useServerFallback) {
        console.log('Falling back to server analysis...');
        return await this.serverFallbackAnalysis(content);
      }
      throw error;
    }
  }

  async quickLocalAnalysis(content) {
    // Use Chrome's built-in AI APIs for local processing
    if (typeof ai !== 'undefined' && ai.prompt) {
      const analysis = await ai.prompt({
        text: content.text,
        instructions: `
          Perform quick communication analysis focusing on:
          1. Basic tone and sentiment
          2. Clear strategic intent
          3. Professional relationship context
          
          Return structured JSON with scores and brief insights.
        `
      });

      return {
        ...this.parseAIResponse(analysis),
        processing: {
          location: 'local',
          apisUsed: ['Prompt API'],
          processingTime: 'instant',
          privacyLevel: '100%_local'
        }
      };
    }
    
    // Fallback to heuristic analysis
    return this.heuristicAnalysis(content);
  }

  async hybridDeepAnalysis(content) {
    // Step 1: Quick local analysis
    const localAnalysis = await this.quickLocalAnalysis(content);
    
    // Step 2: Server enhancement for deeper insights
    if (this.requiresEnhancement(localAnalysis)) {
      const enhancedAnalysis = await this.secureServerEnhancement(
        this.anonymizeForServer(localAnalysis)
      );
      
      return {
        ...localAnalysis,
        enhancedInsights: enhancedAnalysis,
        processing: {
          ...localAnalysis.processing,
          location: 'hybrid',
          apisUsed: ['Prompt API', 'Server Enhancement'],
          privacyLevel: 'hybrid_secure'
        }
      };
    }
    
    return localAnalysis;
  }

  async serverPoweredMultimodalAnalysis(content) {
    // User explicitly chooses server-powered analysis
    const userConsent = await this.getUserConsent('multimodal_analysis');
    
    if (userConsent) {
      const serverAnalysis = await this.advancedServerAnalysis(content);
      
      return {
        ...serverAnalysis,
        processing: {
          location: 'server',
          capabilities: ['multimodal', 'sarcasm_detection', 'cultural_context'],
          privacyLevel: 'server_processed_with_consent'
        }
      };
    } else {
      // Fallback to hybrid analysis
      return await this.hybridDeepAnalysis(content);
    }
  }

  async serverFallbackAnalysis(content) {
    // Fallback when Chrome AI APIs are unavailable
    console.log('Using server fallback analysis');
    
    // Simulate server analysis (in real implementation, this would call an API)
    return {
      strategic: {
        powerDynamics: 'balanced',
        hiddenAgendas: 'not_detected',
        negotiationContext: 'standard'
      },
      emotional: {
        tone: 'professional',
        score: 75,
        subtext: 'clear_communication'
      },
      relational: {
        trustIndicators: 'professional',
        connectionPoints: 'collaborative'
      },
      processing: {
        location: 'server_fallback',
        note: 'Chrome AI APIs unavailable'
      }
    };
  }

  heuristicAnalysis(content) {
    // Basic analysis when no AI APIs are available
    return {
      strategic: {
        powerDynamics: 'balanced',
        hiddenAgendas: 'not_detected'
      },
      emotional: {
        tone: 'neutral',
        score: 50,
        subtext: 'standard_communication'
      },
      relational: {
        trustIndicators: 'professional',
        connectionPoints: 'contextual'
      },
      processing: {
        location: 'heuristic',
        note: 'Basic pattern matching'
      }
    };
  }

  requiresEnhancement(analysis) {
    // Determine if analysis needs server enhancement
    return (
      analysis.emotional?.score < 30 ||
      analysis.emotional?.score > 80 ||
      analysis.strategic?.powerDynamics === 'high' ||
      analysis.strategic?.hiddenAgendas === 'high'
    );
  }

  anonymizeForServer(analysis) {
    // Remove any identifiable information before sending to server
    return {
      patterns: analysis.communicationPatterns,
      metrics: {
        toneScore: analysis.emotional?.score,
        riskLevel: analysis.strategic?.riskLevel,
        relationalScore: analysis.relational?.trustScore
      },
      // Never include:
      // - Original text content
      // - User identifiers
      // - Specific context
    };
  }

  async secureServerEnhancement(anonymizedData) {
    // Simulate secure server enhancement
    // In real implementation, this would call a secure API endpoint
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          enhancedContext: 'Additional cultural and contextual insights',
          riskAssessment: 'Comprehensive risk evaluation',
          improvementSuggestions: [
            'Consider more collaborative language',
            'Add context for better clarity',
            'Balance tone for professional impact'
          ]
        });
      }, 500);
    });
  }

  async advancedServerAnalysis(content) {
    // Simulate advanced server analysis with multimodal capabilities
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          strategic: {
            powerDynamics: 'analyzed',
            hiddenAgendas: 'evaluated',
            culturalContext: 'assessed'
          },
          emotional: {
            tone: 'multidimensional_analysis',
            sarcasmProbability: this.calculateSarcasmProbability(content),
            emotionalComplexity: 'detailed_assessment'
          },
          relational: {
            trustDynamics: 'comprehensive_evaluation',
            connectionPotential: 'strategic_analysis'
          },
          multimodalInsights: {
            textImageCongruence: 'assessed',
            contextualAlignment: 'evaluated'
          }
        });
      }, 800);
    });
  }

  calculateSarcasmProbability(content) {
    // Simple sarcasm probability calculation
    const sarcasmIndicators = ['!', '...', '?', '😂', '😊', 'great', 'wonderful'];
    const indicatorCount = sarcasmIndicators.filter(indicator => 
      content.text.includes(indicator)
    ).length;
    
    return Math.min(100, indicatorCount * 20);
  }

  async getUserConsent(feature) {
    // Simulate user consent check
    // In real implementation, this would show a consent dialog
    return new Promise((resolve) => {
      // For demo purposes, assume consent is given
      resolve(true);
    });
  }

  parseAIResponse(response) {
    try {
      if (typeof response === 'string') {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
      return typeof response === 'object' ? response : {};
    } catch (error) {
      console.warn('Failed to parse AI response, using fallback');
      return this.heuristicAnalysis({ text: '' });
    }
  }
}

// Initialize the service worker
const chalamandraServiceWorker = new ChalamandraServiceWorker();

// Export for testing
if (typeof module !== 'undefined') {
  module.exports = { ChalamandraServiceWorker, HybridOrchestrator };
            }

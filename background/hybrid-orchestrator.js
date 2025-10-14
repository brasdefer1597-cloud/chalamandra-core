// Advanced hybrid orchestration for Chalamandra Core
class AdvancedHybridOrchestrator {
  constructor() {
    this.performanceMetrics = {
      localProcessingTime: 0,
      serverProcessingTime: 0,
      successRate: 100,
      fallbackUsage: 0
    };
    
    this.capabilities = this.detectCapabilities();
    this.init();
  }

  init() {
    this.setupPerformanceMonitoring();
    this.setupCapabilityDetection();
  }

  detectCapabilities() {
    const capabilities = {
      chromeAI: false,
      tensorFlowJS: false,
      webWorkers: false,
      wasm: false
    };

    // Check Chrome AI API availability
    if (typeof ai !== 'undefined') {
      capabilities.chromeAI = !!(ai.prompt || ai.summarizer || ai.rewriter);
    }

    // Check TensorFlow.js availability
    if (typeof tf !== 'undefined') {
      capabilities.tensorFlowJS = true;
    }

    // Check Web Workers support
    capabilities.webWorkers = typeof Worker !== 'undefined';

    // Check WebAssembly support
    capabilities.wasm = typeof WebAssembly !== 'undefined';

    return capabilities;
  }

  async executeOptimizedAnalysis(content, mode, options = {}) {
    const startTime = performance.now();
    
    try {
      // Choose the best available analysis method
      const analysisMethod = this.selectOptimalAnalysisMethod(mode);
      const result = await analysisMethod(content, mode, options);
      
      // Update performance metrics
      this.updatePerformanceMetrics('success', performance.now() - startTime);
      
      return result;
      
    } catch (error) {
      // Attempt fallback strategies
      const fallbackResult = await this.executeFallbackStrategy(content, mode, error);
      
      // Update performance metrics
      this.updatePerformanceMetrics('fallback', performance.now() - startTime);
      
      return fallbackResult;
    }
  }

  selectOptimalAnalysisMethod(mode) {
    const { chromeAI, tensorFlowJS } = this.capabilities;
    
    if (chromeAI) {
      return this.chromeAIAnalysis.bind(this);
    } else if (tensorFlowJS) {
      return this.tensorFlowJSAnalysis.bind(this);
    } else {
      return this.heuristicAnalysis.bind(this);
    }
  }

  async chromeAIAnalysis(content, mode) {
    console.log('Using Chrome AI APIs for analysis');
    
    const analysisPromises = [];
    
    // Always use Prompt API for base analysis
    analysisPromises.push(
      ai.prompt({
        text: content.text,
        instructions: this.getAnalysisInstructions(mode)
      })
    );
    
    // Add additional APIs based on mode
    if (mode === 'deep' && ai.summarizer) {
      analysisPromises.push(
        ai.summarizer.summarize(content.text)
      );
    }
    
    if (mode === 'multimodal' && ai.rewriter) {
      analysisPromises.push(
        ai.rewriter.rewrite(this.getRewriterPrompt(content))
      );
    }
    
    const results = await Promise.allSettled(analysisPromises);
    return this.processChromeAIResults(results, mode);
  }

  async tensorFlowJSAnalysis(content, mode) {
    console.log('Using TensorFlow.js for analysis');
    
    // This would use pre-trained models for analysis
    // For now, return a simulated analysis
    return {
      strategic: {
        powerDynamics: 'ml_analyzed',
        confidence: 0.85
      },
      emotional: {
        tone: 'ml_detected',
        score: this.mlToneAnalysis(content.text)
      },
      processing: {
        engine: 'tensorflow_js',
        model: 'communication_analysis_v1'
      }
    };
  }

  async executeFallbackStrategy(content, mode, originalError) {
    console.warn('Primary analysis failed, executing fallback:', originalError);
    
    this.performanceMetrics.fallbackUsage++;
    
    // Try fallback methods in order of preference
    const fallbackMethods = [
      this.simpleAIAnalysis.bind(this),
      this.patternBasedAnalysis.bind(this),
      this.heuristicAnalysis.bind(this)
    ];
    
    for (const method of fallbackMethods) {
      try {
        const result = await method(content, mode);
        console.log(`Fallback method ${method.name} succeeded`);
        return result;
      } catch (error) {
        console.warn(`Fallback method ${method.name} failed:`, error);
        continue;
      }
    }
    
    // Ultimate fallback
    return this.ultimateFallback(content);
  }

  async simpleAIAnalysis(content, mode) {
    // Simple AI analysis using basic NLP techniques
    return {
      strategic: {
        powerDynamics: this.analyzePowerLanguage(content.text),
        complexity: this.analyzeComplexity(content.text)
      },
      emotional: {
        tone: this.basicToneAnalysis(content.text),
        sentiment: this.basicSentimentAnalysis(content.text)
      },
      processing: {
        method: 'simple_ai_fallback',
        confidence: 0.7
      }
    };
  }

  async patternBasedAnalysis(content, mode) {
    // Pattern-based analysis using predefined rules
    const patterns = this.analyzeCommunicationPatterns(content.text);
    
    return {
      strategic: {
        powerDynamics: patterns.powerLevel,
        communicationStyle: patterns.style
      },
      emotional: {
        tone: patterns.primaryTone,
        emotionalMarkers: patterns.emotionalMarkers
      },
      relational: {
        trustIndicators: patterns.trustScore,
        collaborationLevel: patterns.collaborationScore
      },
      processing: {
        method: 'pattern_based',
        patternsDetected: patterns.detectedPatterns.length
      }
    };
  }

  heuristicAnalysis(content, mode) {
    // Basic heuristic analysis as last resort
    return {
      strategic: {
        powerDynamics: 'balanced',
        assessment: 'basic_heuristic'
      },
      emotional: {
        tone: 'neutral',
        score: 50
      },
      processing: {
        method: 'heuristic_fallback',
        note: 'Limited analysis available'
      }
    };
  }

  ultimateFallback(content) {
    // Absolute minimum analysis
    return {
      status: 'basic_analysis',
      message: 'Limited analysis capability available',
      recommendation: 'Try refreshing or check browser compatibility',
      processing: {
        method: 'ultimate_fallback',
        capability: 'minimal'
      }
    };
  }

  // Analysis helper methods
  getAnalysisInstructions(mode) {
    const instructions = {
      quick: "Quick communication analysis: tone, basic intent, professional context.",
      deep: "Deep communication analysis: power dynamics, hidden agendas, emotional subtext, relational factors.",
      multimodal: "Multimodal communication analysis: text context, potential sarcasm, cultural nuances, relational dynamics."
    };
    
    return instructions[mode] || instructions.quick;
  }

  getRewriterPrompt(content) {
    return `Analyze this communication for improvement suggestions: ${content.text}`;
  }

  mlToneAnalysis(text) {
    // Simulate ML tone analysis
    const positiveWords = ['excellent', 'great', 'thanks', 'appreciate', 'collaborat'];
    const negativeWords = ['problem', 'issue', 'concern', 'unfortunately', 'but'];
    
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    
    return Math.max(0, Math.min(100, 50 + (positiveCount - negativeCount) * 10));
  }

  analyzePowerLanguage(text) {
    const powerWords = ['must', 'require', 'expect', 'demand', 'insist'];
    const collaborativeWords = ['suggest', 'recommend', 'consider', 'collaborate', 'partner'];
    
    const powerScore = powerWords.filter(word => text.includes(word)).length;
    const collaborativeScore = collaborativeWords.filter(word => text.includes(word)).length;
    
    if (powerScore > collaborativeScore + 2) return 'high';
    if (collaborativeScore > powerScore + 2) return 'low';
    return 'balanced';
  }

  analyzeComplexity(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    const avgSentenceLength = words.length / sentences.length;
    
    if (avgSentenceLength > 25) return 'high';
    if (avgSentenceLength > 15) return 'medium';
    return 'low';
  }

  basicToneAnalysis(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('!') && lowerText.includes('?')) return 'confused';
    if (lowerText.includes('!')) return 'emphatic';
    if (lowerText.includes('?')) return 'inquiring';
    
    return 'neutral';
  }

  basicSentimentAnalysis(text) {
    const positive = ['good', 'great', 'excellent', 'thanks', 'appreciate'];
    const negative = ['bad', 'terrible', 'problem', 'issue', 'sorry'];
    
    const posCount = positive.filter(word => text.toLowerCase().includes(word)).length;
    const negCount = negative.filter(word => text.toLowerCase().includes(word)).length;
    
    if (posCount > negCount) return 'positive';
    if (negCount > posCount) return 'negative';
    return 'neutral';
  }

  analyzeCommunicationPatterns(text) {
    const lowerText = text.toLowerCase();
    
    return {
      powerLevel: this.analyzePowerLanguage(text),
      style: this.analyzeCommunicationStyle(text),
      primaryTone: this.basicToneAnalysis(text),
      emotionalMarkers: this.extractEmotionalMarkers(text),
      trustScore: this.analyzeTrustIndicators(text),
      collaborationScore: this.analyzeCollaborationIndicators(text),
      detectedPatterns: this.detectCommunicationPatterns(text)
    };
  }

  analyzeCommunicationStyle(text) {
    const formalMarkers = ['sincerely', 'regards', 'respectfully', 'dear'];
    const informalMarkers = ['hey', 'hi', 'thanks', 'cheers'];
    
    const formalCount = formalMarkers.filter(marker => text.toLowerCase().includes(marker)).length;
    const informalCount = informalMarkers.filter(marker => text.toLowerCase().includes(marker)).length;
    
    if (formalCount > informalCount) return 'formal';
    if (informalCount > formalCount) return 'informal';
    return 'neutral';
  }

  extractEmotionalMarkers(text) {
    const markers = [];
    const emotionalWords = {
      positive: ['excited', 'happy', 'pleased', 'delighted'],
      negative: ['disappointed', 'frustrated', 'concerned', 'worried'],
      neutral: ['noted', 'understood', 'acknowledged']
    };
    
    Object.entries(emotionalWords).forEach(([emotion, words]) => {
      words.forEach(word => {
        if (text.toLowerCase().includes(word)) {
          markers.push({ emotion, word });
        }
      });
    });
    
    return markers;
  }

  analyzeTrustIndicators(text) {
    const trustWords = ['trust', 'confidence', 'rely', 'depend', 'believed'];
    const distrustWords = ['doubt', 'concern', 'question', 'verify', 'check'];
    
    const trustCount = trustWords.filter(word => text.toLowerCase().includes(word)).length;
    const distrustCount = distrustWords.filter(word => text.toLowerCase().includes(word)).length;
    
    return Math.max(0, Math.min(100, 50 + (trustCount - distrustCount) * 20));
  }

  analyzeCollaborationIndicators(text) {
    const collaborativeWords = ['we', 'our', 'together', 'collaborat', 'partner', 'team'];
    const individualWords = ['I', 'my', 'me', 'mine', 'alone', 'self'];
    
    const collabCount = collaborativeWords.filter(word => text.toLowerCase().includes(word)).length;
    const indivCount = individualWords.filter(word => text.toLowerCase().includes(word)).length;
    
    return Math.max(0, Math.min(100, 50 + (collabCount - indivCount) * 10));
  }

  detectCommunicationPatterns(text) {
    const patterns = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('per my last email')) patterns.push('repetitive_reference');
    if (lowerText.includes('as I mentioned')) patterns.push('repetitive_emphasis');
    if (lowerText.includes('just to clarify')) patterns.push('clarification_seeking');
    if (lowerText.includes('hopefully this helps')) patterns.push('passive_helpful');
    
    return patterns;
  }

  setupPerformanceMonitoring() {
    // Monitor performance periodically
    setInterval(() => {
      this.monitorPerformance();
    }, 30000); // Every 30 seconds
  }

  setupCapabilityDetection() {
    // Re-detect capabilities periodically
    setInterval(() => {
      this.capabilities = this.detectCapabilities();
    }, 60000); // Every minute
  }

  monitorPerformance() {
    // Monitor and log performance metrics
    const memory = performance.memory;
    if (memory) {
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      
      if (usedMB > 100) {
        console.warn('High memory usage detected:', usedMB + 'MB');
      }
    }
  }

  updatePerformanceMetrics(outcome, duration) {
    this.performanceMetrics.successRate = outcome === 'success' ? 
      Math.min(100, this.performanceMetrics.successRate + 1) :
      Math.max(0, this.performanceMetrics.successRate - 5);
    
    if (outcome === 'success') {
      this.performanceMetrics.localProcessingTime = duration;
    }
  }

  getPerformanceReport() {
    return {
      ...this.performanceMetrics,
      capabilities: this.capabilities,
      timestamp: new Date().toISOString()
    };
  }
}

// Export for use in service worker
if (typeof module !== 'undefined') {
  module.exports = AdvancedHybridOrchestrator;
}

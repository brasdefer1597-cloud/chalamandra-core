class ChalamandraEngine {
  constructor() {
    this.sarcasmDetector = new SarcasmDetector();
    this.multimodalAnalyzer = new MultimodalAnalyzer();
    this.explainableAI = new ExplainableAI();
    this.hybridOrchestrator = new HybridOrchestrator();
  }

  async analyzeCommunication(content, mode = 'quick') {
    try {
      console.log('🦎 Chalamandra analyzing communication...', { mode });
      
      const baseAnalysis = await this.quickLocalAnalysis(content);
      
      if (mode === 'deep' || mode === 'multimodal') {
        const advancedAnalysis = await this.deepHybridAnalysis(content, baseAnalysis);
        return this.synthesizeResults(baseAnalysis, advancedAnalysis);
      }
      
      return baseAnalysis;
      
    } catch (error) {
      console.error('Analysis error:', error);
      return this.fallbackAnalysis(content);
    }
  }

  async quickLocalAnalysis(content) {
    if (typeof ai !== 'undefined' && ai.prompt) {
      const analysis = await ai.prompt({
        text: content.text,
        instructions: `
          Analyze professional communication across dimensions:
          1. STRATEGIC: power dynamics, hidden agendas, negotiation
          2. EMOTIONAL: tone, subtext, psychological factors
          3. RELATIONAL: trust, connections, social signals
          
          Return structured JSON with 0-100 scores.
        `
      });
      return this.processAIResponse(analysis);
    }
    
    return this.heuristicAnalysis(content);
  }

  async deepHybridAnalysis(content, baseAnalysis) {
    const multimodalAnalysis = await this.multimodalAnalyzer.detectIncongruence(
      content.text,
      content.images
    );
    
    const explanations = await this.explainableAI.generateExplanations(
      baseAnalysis,
      content.text
    );
    
    return {
      ...multimodalAnalysis,
      explanations,
      mode: 'hybrid',
      timestamp: new Date().toISOString()
    };
  }

  heuristicAnalysis(content) {
    return {
      strategic: {
        powerDynamics: 'balanced',
        hiddenAgendas: 'not detected',
        negotiation: 'standard context'
      },
      emotional: {
        tone: 'professional',
        score: 75,
        subtext: 'direct communication'
      },
      relational: {
        trust: 'professional level',
        connections: 'collaborative context'
      },
      mode: 'fallback',
      confidence: 0.7
    };
  }

  synthesizeResults(...analyses) {
    return {
      communicationProfile: this.createRadarProfile(analyses),
      risks: this.calculateRisks(analyses),
      recommendations: this.generateRecommendations(analyses),
      explanations: this.combineExplanations(analyses)
    };
  }

  createRadarProfile(analyses) {
    return {
      clarity: this.average(analyses, 'clarity') || 85,
      warmth: this.average(analyses, 'warmth') || 70,
      formality: this.average(analyses, 'formality') || 80,
      actionability: this.average(analyses, 'actionability') || 75,
      relationalRisk: this.average(analyses, 'relationalRisk') || 20,
      sarcasm: this.average(analyses, 'sarcasm') || 15
    };
  }

  average(analyses, key) {
    const values = analyses.map(a => a[key]).filter(v => v != null);
    return values.length ? values.reduce((a, b) => a + b) / values.length : null;
  }

  processAIResponse(response) {
    try {
      if (typeof response === 'string') {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
      return typeof response === 'object' ? response : this.heuristicAnalysis();
    } catch (error) {
      return this.heuristicAnalysis();
    }
  }
}

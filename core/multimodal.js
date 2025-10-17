class MultimodalAnalyzer {
  constructor() {
    this.sarcasmDetector = new SarcasmDetector();
  }

  async detectIncongruence(text, visualElements = []) {
    console.log('🔍 Analyzing multimodality...');
    
    const visualContext = this.extractVisualContext(visualElements);
    const sarcasmAnalysis = await this.sarcasmDetector.detectSarcasm(text, visualContext);
    
    return {
      ...sarcasmAnalysis,
      analyzedElements: {
        text: text.substring(0, 100) + '...',
        images: visualElements.length,
        emojis: visualContext.emojis?.length || 0
      },
      recommendations: this.generateIncongruenceRecommendations(sarcasmAnalysis)
    };
  }

  extractVisualContext(visualElements) {
    const context = {
      emojis: [],
      images: [],
      format: {}
    };

    visualElements.forEach(element => {
      if (element.type === 'emoji') {
        context.emojis.push(element.contenido);
      } else if (element.type === 'image') {
        context.images.push({
          src: element.src,
          alt: element.alt,
          context: this.inferImageContext(element.alt)
        });
      }
    });

    return context;
  }

  inferImageContext(altText) {
    if (!altText) return 'unknown';
    
    const positive = ['happy', 'celebration', 'success', 'achievement', 'team'];
    const negative = ['sad', 'problem', 'error', 'conflict', 'sleep'];
    
    if (positive.some(p => altText.toLowerCase().includes(p))) return 'positive';
    if (negative.some(n => altText.toLowerCase().includes(n))) return 'negative';
    
    return 'neutral';
  }

  generateIncongruenceRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.sarcasmScore > 70) {
      recommendations.push({
        level: 'high',
        message: 'High probability of sarcasm detected',
        action: 'Reconsider the message or clarify intention',
        urgency: 'high'
      });
    }
    
    if (analysis.detectedPatterns.includes('incongruent_emoji')) {
      recommendations.push({
        level: 'medium', 
        message: 'Emojis do not match the text tone',
        action: 'Review emojis used in context',
        urgency: 'medium'
      });
    }
    
    if (analysis.detectedPatterns.includes('excessive_positivity')) {
      recommendations.push({
        level: 'low',
        message: 'Excessive positivity may be perceived as sarcasm',
        action: 'Balance the message tone',
        urgency: 'low'
      });
    }

    return recommendations;
  }

  async analyzeCompleteEmail(emailData) {
    const { subject, body, attachments, metadata } = emailData;
    
    const visualElements = [
      ...this.extractEmojis(body),
      ...this.processAttachments(attachments)
    ];

    return await this.detectIncongruence(body, visualElements);
  }

  extractEmojis(text) {
    const emojiRegex = /[\p{Emoji_Presentation}]/gu;
    const emojis = text.match(emojiRegex) || [];
    
    return emojis.map(emoji => ({
      type: 'emoji',
      content: emoji,
      position: text.indexOf(emoji)
    }));
  }

  processAttachments(adjuntos) {
    return adjuntos.map(adjunto => ({
      type: 'image',
      src: adjunto.url,
      alt: adjunto.descripcion || '',
      formato: adjunto.tipo
    }));
  }

  async analyzeTextWithImages(text, imageDescriptions = []) {
    const visualElements = imageDescriptions.map(desc => ({
      type: 'image',
      alt: desc,
      context: this.inferImageContext(desc)
    }));

    return await this.detectIncongruence(text, visualElements);
  }

  getCommunicationScore(analysis) {
    const baseScore = 100 - analysis.sarcasmScore;
    const patternPenalty = analysis.detectedPatterns.length * 5;
    
    return Math.max(0, baseScore - patternPenalty);
  }

  generateImprovementTips(analysis) {
    const tips = [];
    
    if (analysis.sarcasmScore > 50) {
      tips.push({
        tip: "Use direct language instead of sarcasm",
        reason: "Sarcasm often leads to misunderstandings in professional communication",
        example: "Instead of 'Great job breaking the system', try 'Let's work together to fix this issue'"
      });
    }
    
    if (analysis.detectedPatterns.includes('incongruent_emoji')) {
      tips.push({
        tip: "Align emojis with your message tone",
        reason: "Conflicting signals between text and emojis confuse readers",
        example: "If discussing a serious issue, avoid using 😊 or 🎉"
      });
    }

    return tips;
  }
}

if (typeof module !== 'undefined') {
  module.exports = MultimodalAnalyzer;
  }

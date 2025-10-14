class SarcasmDetector {
  constructor() {
    this.sarcasmPatterns = {
      textual: [
        'excessive_positivity',
        'unexpected_hyperbole', 
        'contextual_contradiction',
        'passive_aggressive_language'
      ],
      visual: [
        'incongruent_emoji',
        'contradictory_image',
        'sarcastic_formatting'
      ]
    };
  }

  async detectSarcasm(text, visualContext = null) {
    const textualAnalysis = this.analyzeTextualPatterns(text);
    const visualAnalysis = visualContext ? 
      await this.analyzeVisualContext(visualContext) : 
      { score: 0, patterns: [] };

    return this.combineAnalyses(textualAnalysis, visualAnalysis);
  }

  analyzeTextualPatterns(text) {
    const detectedPatterns = [];
    let score = 0;

    if (this.hasExcessivePositivity(text)) {
      detectedPatterns.push('excessive_positivity');
      score += 25;
    }

    if (this.hasHyperbole(text)) {
      detectedPatterns.push('unexpected_hyperbole');
      score += 30;
    }

    if (this.hasContradictions(text)) {
      detectedPatterns.push('contextual_contradiction');
      score += 35;
    }

    if (this.hasPassiveAggressiveLanguage(text)) {
      detectedPatterns.push('passive_aggressive_language');
      score += 40;
    }

    return {
      score: Math.min(score, 100),
      patterns: detectedPatterns,
      confidence: this.calculateConfidence(detectedPatterns)
    };
  }

  async analyzeVisualContext(visualContext) {
    try {
      if (typeof ai !== 'undefined' && ai.prompt) {
        const analysis = await ai.prompt({
          text: `Analyze visual context: ${JSON.stringify(visualContext)}`,
          instructions: "Detect incongruences between text and visual elements"
        });
        return this.processVisualAnalysis(analysis);
      }
    } catch (error) {
      console.warn('Chrome AI not available for visual analysis');
    }

    return this.heuristicVisualAnalysis(visualContext);
  }

  heuristicVisualAnalysis(visualContext) {
    let score = 0;
    const patterns = [];

    if (visualContext.emojis) {
      visualContext.emojis.forEach(emoji => {
        if (this.isIncongruentEmoji(emoji, visualContext.text)) {
          patterns.push('incongruent_emoji');
          score += 20;
        }
      });
    }

    return {
      score: Math.min(score, 100),
      patterns,
      confidence: 0.6
    };
  }

  combineAnalyses(textual, visual) {
    const totalScore = (textual.score * 0.7) + (visual.score * 0.3);
    const totalPatterns = [...textual.patterns, ...visual.patterns];
    
    return {
      sarcasmScore: Math.min(totalScore, 100),
      detectedPatterns: [...new Set(totalPatterns)],
      totalConfidence: (textual.confidence + visual.confidence) / 2,
      details: {
        textual,
        visual
      }
    };
  }

  hasExcessivePositivity(text) {
    const positiveWords = ['excellent', 'wonderful', 'incredible', 'perfect', 'fantastic'];
    const count = positiveWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    return count >= 3;
  }

  hasHyperbole(text) {
    const hyperboles = ['the best', 'the worst', 'never', 'always', 'completely'];
    return hyperboles.some(hyperbole => text.toLowerCase().includes(hyperbole));
  }

  hasContradictions(text) {
    const contradictions = [
      ['but', 'excellent'],
      ['although', 'perfect'],
      ['however', 'great']
    ];
    return contradictions.some(([contrast, positive]) => 
      text.includes(contrast) && text.includes(positive)
    );
  }

  hasPassiveAggressiveLanguage(text) {
    const paPatterns = [
      'per my last email',
      'as I mentioned before',
      'you should know',
      'I hope this is clear'
    ];
    return paPatterns.some(pattern => text.toLowerCase().includes(pattern));
  }

  isIncongruentEmoji(emoji, text) {
    const positiveEmojis = ['😊', '👍', '🎉', '❤️', '⭐'];
    const negativeEmojis = ['😠', '👎', '💀', '🔥', '💣'];
    
    const textIsNegative = this.textHasNegativeSentiment(text);
    const emojiIsPositive = positiveEmojis.includes(emoji);
    
    return textIsNegative && emojiIsPositive;
  }

  textHasNegativeSentiment(text) {
    const negativeWords = ['problem', 'error', 'bad', 'wrong', 'failure'];
    return negativeWords.some(word => text.toLowerCase().includes(word));
  }

  calculateConfidence(patterns) {
    return patterns.length > 0 ? 0.7 + (patterns.length * 0.1) : 0.3;
  }

  processVisualAnalysis(analysis) {
    try {
      if (typeof analysis === 'string') {
        return {
          score: 50,
          patterns: ['basic_visual_analysis'],
          confidence: 0.7
        };
      }
      return analysis;
    } catch (error) {
      return this.heuristicVisualAnalysis({});
    }
  }
}

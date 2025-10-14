// Advanced content analysis utilities
class AdvancedContentAnalyzer {
  constructor() {
    this.communicationPatterns = {
      positive: [
        'collaboration', 'partnership', 'teamwork', 'appreciate', 'thanks',
        'excellent', 'great work', 'well done', 'looking forward', 'pleasure'
      ],
      negative: [
        'unfortunately', 'however', 'but', 'problem', 'issue',
        'concern', 'disappointed', 'frustrated', 'urgent', 'immediately'
      ],
      passiveAggressive: [
        'per my last email', 'as I mentioned before', 'for future reference',
        'just to clarify', 'I assume you know', 'hopefully this helps'
      ],
      powerDynamics: [
        'you must', 'you need to', 'I require', 'I expect', 'you should',
        'it is mandatory', 'compliance required', 'immediately'
      ]
    };
  }

  analyzeTextPatterns(text) {
    const patterns = {
      positive: this.countPatterns(text, this.communicationPatterns.positive),
      negative: this.countPatterns(text, this.communicationPatterns.negative),
      passiveAggressive: this.countPatterns(text, this.communicationPatterns.passiveAggressive),
      powerDynamics: this.countPatterns(text, this.communicationPatterns.powerDynamics)
    };

    return {
      patterns,
      overallTone: this.calculateOverallTone(patterns),
      riskLevel: this.calculateRiskLevel(patterns)
    };
  }

  countPatterns(text, patterns) {
    const lowerText = text.toLowerCase();
    return patterns.filter(pattern => 
      lowerText.includes(pattern.toLowerCase())
    ).length;
  }

  calculateOverallTone(patterns) {
    const positiveScore = patterns.positive;
    const negativeScore = patterns.negative + patterns.passiveAggressive;
    
    if (positiveScore > negativeScore + 2) return 'positive';
    if (negativeScore > positiveScore + 2) return 'negative';
    return 'neutral';
  }

  calculateRiskLevel(patterns) {
    let riskScore = 0;
    
    riskScore += patterns.passiveAggressive * 2;
    riskScore += patterns.powerDynamics * 3;
    riskScore += patterns.negative * 1;
    
    if (riskScore >= 6) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  }

  extractCommunicationContext() {
    const context = {
      platform: this.detectPlatform(),
      contentType: this.detectContentType(),
      formality: this.detectFormalityLevel(),
      urgency: this.detectUrgencyLevel()
    };

    return context;
  }

  detectPlatform() {
    const url = window.location.href;
    
    if (url.includes('mail.google.com') || url.includes('outlook.office.com')) return 'email';
    if (url.includes('linkedin.com')) return 'linkedin';
    if (url.includes('slack.com')) return 'slack';
    if (url.includes('discord.com')) return 'discord';
    if (url.includes('teams.microsoft.com')) return 'teams';
    
    return 'web';
  }

  detectContentType() {
    const url = window.location.href;
    const title = document.title.toLowerCase();
    
    if (url.includes('compose') || url.includes('write')) return 'composition';
    if (url.includes('inbox') || url.includes('messages')) return 'reading';
    if (title.includes('chat') || title.includes('message')) return 'chat';
    
    return 'general';
  }

  detectFormalityLevel() {
    const platform = this.detectPlatform();
    
    const formalityLevels = {
      'email': 'formal',
      'linkedin': 'semi-formal', 
      'slack': 'informal',
      'discord': 'informal',
      'teams': 'semi-formal',
      'web': 'variable'
    };
    
    return formalityLevels[platform] || 'variable';
  }

  detectUrgencyLevel() {
    const text = document.body.innerText.toLowerCase();
    
    const urgentWords = ['urgent', 'asap', 'immediately', 'emergency', 'critical'];
    const hasUrgency = urgentWords.some(word => text.includes(word));
    
    return hasUrgency ? 'high' : 'normal';
  }

  // Method for highlighting text in page
  highlightTextElements(analysis) {
    this.removeExistingHighlights();
    
    const textElements = this.getTextElements();
    
    textElements.forEach(element => {
      this.highlightElement(element, analysis);
    });
  }

  getTextElements() {
    // Get elements likely to contain communication content
    const selectors = [
      'p', 'div[role="textbox"]', 'div[contenteditable="true"]',
      '.email-body', '.message-content', '.post-content',
      'article', 'section', 'main p'
    ];
    
    return Array.from(document.querySelectorAll(selectors.join(',')))
      .filter(el => {
        const text = el.innerText.trim();
        return text.length > 20 && text.length < 1000;
      });
  }

  highlightElement(element, analysis) {
    const text = element.innerText;
    const patterns = this.analyzeTextPatterns(text);
    
    if (patterns.riskLevel === 'high') {
      element.classList.add('chalamandra-highlight-risk', 'chalamandra-new-highlight');
    } else if (patterns.overallTone === 'negative') {
      element.classList.add('chalamandra-highlight-negative', 'chalamandra-new-highlight');
    } else if (patterns.overallTone === 'positive') {
      element.classList.add('chalamandra-highlight-positive', 'chalamandra-new-highlight');
    }
    
    // Add tooltip on hover
    this.addTooltip(element, patterns);
  }

  addTooltip(element, patterns) {
    element.addEventListener('mouseenter', (e) => {
      this.showTooltip(e.target, patterns);
    });
    
    element.addEventListener('mouseleave', () => {
      this.hideTooltip();
    });
  }

  showTooltip(element, patterns) {
    this.hideTooltip();
    
    const tooltip = document.createElement('div');
    tooltip.className = 'chalamandra-analysis-tooltip';
    tooltip.innerHTML = this.generateTooltipContent(patterns);
    
    document.body.appendChild(tooltip);
    
    // Position tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
    
    this.currentTooltip = tooltip;
  }

  generateTooltipContent(patterns) {
    return `
      <div class="chalamandra-tooltip-title">🦎 Communication Analysis</div>
      <div class="chalamandra-tooltip-content">
        <strong>Tone:</strong> ${patterns.overallTone}<br>
        <strong>Risk Level:</strong> ${patterns.riskLevel}<br>
        <strong>Positive Patterns:</strong> ${patterns.patterns.positive}<br>
        <strong>Concern Patterns:</strong> ${patterns.patterns.negative + patterns.patterns.passiveAggressive}
      </div>
    `;
  }

  hideTooltip() {
    if (this.currentTooltip) {
      this.currentTooltip.remove();
      this.currentTooltip = null;
    }
  }

  removeExistingHighlights() {
    const highlights = document.querySelectorAll([
      '.chalamandra-highlight-positive',
      '.chalamandra-highlight-negative', 
      '.chalamandra-highlight-risk'
    ].join(','));
    
    highlights.forEach(el => {
      el.classList.remove(
        'chalamandra-highlight-positive',
        'chalamandra-highlight-negative',
        'chalamandra-highlight-risk',
        'chalamandra-new-highlight'
      );
    });
    
    this.hideTooltip();
  }

  // Demo method for presentation
  demoPageAnalysis() {
    const demoAnalysis = {
      strategic: {
        powerDynamics: 'balanced',
        hiddenAgendas: 'not detected',
        negotiation: 'collaborative'
      },
      emotional: {
        tone: 'professional', 
        score: 78,
        subtext: 'clear intent'
      },
      relational: {
        trust: 'high',
        connection: 'strong',
        socialCues: 'professional'
      }
    };
    
    this.highlightTextElements(demoAnalysis);
    return demoAnalysis;
  }
}

// Export for use in content.js
if (typeof module !== 'undefined') {
  module.exports = AdvancedContentAnalyzer;
}

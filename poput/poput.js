class PopupManager {
  constructor() {
    this.radar = new RadarVisualization('communicationRadar');
    this.currentAnalysis = null;
    this.init();
  }

  init() {
    this.bindEvents();
    this.autoAnalyze();
  }

  bindEvents() {
    document.getElementById('quickAnalysis').addEventListener('click', () => this.analyzePage('quick'));
    document.getElementById('deepAnalysis').addEventListener('click', () => this.analyzePage('deep'));
    document.getElementById('multimodalAnalysis').addEventListener('click', () => this.analyzePage('multimodal'));
  }

  async analyzePage(mode) {
    this.showLoading();
    this.hideError();
    this.hideResults();

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.startsWith('http')) {
        throw new Error('Cannot analyze non-http pages');
      }

      const analysis = await this.sendAnalysisRequest(tab.id, mode);
      this.displayAnalysisResults(analysis, mode);
      
    } catch (error) {
      console.error('Analysis error:', error);
      this.showError();
    } finally {
      this.hideLoading();
    }
  }

  async sendAnalysisRequest(tabId, mode) {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, { 
        action: 'analyzePage',
        mode: mode 
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response && response.success) {
          resolve(response.analysis);
        } else {
          reject(new Error('Analysis failed'));
        }
      });
    });
  }

  displayAnalysisResults(analysis, mode) {
    this.currentAnalysis = analysis;
    
    // Update radar visualization
    if (analysis.communicationProfile) {
      this.radar.animateTransition(analysis.communicationProfile);
    } else {
      const demoData = this.radar.generateDemoData(
        analysis.sarcasmScore > 70 ? 'sarcastic' : 'normal'
      );
      this.radar.animateTransition(demoData);
    }
    
    // Update dimension content
    this.updateStrategicContent(analysis);
    this.updateEmotionalContent(analysis);
    this.updateRelationalContent(analysis);
    
    // Show explanations if available
    if (analysis.explanations) {
      this.showExplanations(analysis.explanations);
    }
    
    // Highlight used APIs
    this.highlightUsedAPIs(mode);
    
    this.showResults();
  }

  updateStrategicContent(analysis) {
    const strategicContent = document.getElementById('strategic-content');
    
    let content = '';
    if (analysis.strategic) {
      content = `
        <p><strong>Power Dynamics:</strong> ${analysis.strategic.powerDynamics || 'Balanced'}</p>
        <p><strong>Hidden Agendas:</strong> ${analysis.strategic.hiddenAgendas || 'Not detected'}</p>
        <p><strong>Negotiation Context:</strong> ${analysis.strategic.negotiation || 'Standard'}</p>
      `;
    } else {
      content = '<p>Strategic analysis shows balanced professional communication.</p>';
    }
    
    strategicContent.innerHTML = content;
  }

  updateEmotionalContent(analysis) {
    const emotionalContent = document.getElementById('emotional-content');
    const toneFill = document.getElementById('tone-fill');
    const toneValue = document.getElementById('tone-value');
    
    let toneScore = 50;
    let toneText = 'Neutral';
    
    if (analysis.emotional) {
      toneScore = analysis.emotional.score || 50;
      toneText = analysis.emotional.tone || 'Neutral';
    }
    
    // Update tone meter
    toneFill.style.width = `${toneScore}%`;
    toneValue.textContent = toneText;
    toneValue.style.color = this.getToneColor(toneScore);
    
    let content = '';
    if (analysis.emotional) {
      content = `
        <p><strong>Emotional Subtext:</strong> ${analysis.emotional.subtext || 'Direct communication'}</p>
        <p><strong>Psychological Factors:</strong> ${analysis.emotional.psychologicalFactors || 'Standard engagement'}</p>
      `;
    } else {
      content = '<p>Emotional analysis indicates professional tone and clear intent.</p>';
    }
    
    emotionalContent.innerHTML += content;
  }

  updateRelationalContent(analysis) {
    const relationalContent = document.getElementById('relational-content');
    
    let content = '';
    if (analysis.relational) {
      content = `
        <p><strong>Trust Indicators:</strong> ${analysis.relational.trust || 'Professional level'}</p>
        <p><strong>Connection Points:</strong> ${analysis.relational.connection || 'Collaborative context'}</p>
        <p><strong>Social Cues:</strong> ${analysis.relational.socialCues || 'Formal communication'}</p>
      `;
    } else {
      content = '<p>Relational dynamics show professional trust and collaboration.</p>';
    }
    
    relationalContent.innerHTML = content;
  }

  showExplanations(explanations) {
    const explanationContent = document.getElementById('explanation-content');
    const explanationsSection = document.getElementById('explanations');
    
    let content = '';
    
    if (explanations.summary) {
      content += `<p><strong>Summary:</strong> ${explanations.summary}</p>`;
    }
    
    if (explanations.recommendations && explanations.recommendations.length > 0) {
      content += `<p><strong>Recommendations:</strong></p><ul>`;
      explanations.recommendations.forEach(rec => {
        content += `<li>${rec}</li>`;
      });
      content += `</ul>`;
    }
    
    explanationContent.innerHTML = content;
    explanationsSection.style.display = 'block';
  }

  highlightUsedAPIs(mode) {
    // Reset all APIs
    document.querySelectorAll('.api-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Always use Prompt API
    document.querySelector('[data-api="prompt"]').classList.add('active');
    
    switch(mode) {
      case 'quick':
        document.querySelector('[data-api="summarizer"]').classList.add('active');
        break;
      case 'deep':
        document.querySelector('[data-api="summarizer"]').classList.add('active');
        document.querySelector('[data-api="rewriter"]').classList.add('active');
        break;
      case 'multimodal':
        document.querySelectorAll('.api-item').forEach(item => {
          item.classList.add('active');
        });
        break;
    }
  }

  getToneColor(score) {
    if (score < 30) return '#ff6b6b';
    if (score < 70) return '#ffa726';
    return '#4ecdc4';
  }

  showLoading() {
    document.getElementById('status').style.display = 'flex';
  }

  hideLoading() {
    document.getElementById('status').style.display = 'none';
  }

  showResults() {
    document.getElementById('results').style.display = 'block';
  }

  hideResults() {
    document.getElementById('results').style.display = 'none';
  }

  showError() {
    document.getElementById('error').style.display = 'block';
  }

  hideError() {
    document.getElementById('error').style.display = 'none';
  }

  autoAnalyze() {
    // Auto-analyze on popup open
    setTimeout(() => {
      this.analyzePage('quick');
    }, 500);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});

// Demo functionality for presentation
function demoAnalysis(type) {
  const popupManager = new PopupManager();
  const demoData = popupManager.radar.generateDemoData(type);
  popupManager.radar.animateTransition(demoData);
  popupManager.showResults();
}

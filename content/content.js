// Content script for page analysis with Chrome AI APIs
class ContentAnalyzer {
  constructor() {
    this.engine = new ChalamandraEngine();
    this.init();
  }

  init() {
    this.setupMessageListener();
    this.injectAnalysisUI();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'analyzePage') {
        this.analyzeCurrentPage(request.mode)
          .then(analysis => {
            sendResponse({ success: true, analysis });
          })
          .catch(error => {
            sendResponse({ success: false, error: error.message });
          });
        return true; // Will respond asynchronously
      }
    });
  }

  async analyzeCurrentPage(mode) {
    const pageContent = this.extractPageContent();
    const analysis = await this.engine.analizarComunicacion(pageContent, mode);
    
    // Log for demo purposes
    this.logAnalysis({ mode, analysis });
    
    return analysis;
  }

  extractPageContent() {
    const mainContent = document.querySelector('main, article, [role="main"]') || document.body;
    const images = this.extractRelevantImages();
    
    return {
      title: document.title,
      url: window.location.href,
      text: mainContent.innerText.replace(/\s+/g, ' ').substring(0, 3000),
      images: images,
      meta: this.getMetaInformation(),
      structure: this.analyzePageStructure()
    };
  }

  extractRelevantImages() {
    const images = Array.from(document.querySelectorAll('img'))
      .filter(img => {
        // Filter only relevant images (not icons, logos, etc.)
        const naturalArea = img.naturalWidth * img.naturalHeight;
        return naturalArea > 10000 && // Minimum size
               img.src.startsWith('http') && // External images
               !img.src.includes('icon') && // Not icons
               !img.src.includes('logo'); // Not logos
      })
      .slice(0, 5) // Limit to 5 images
      .map(img => ({
        src: img.src,
        alt: img.alt,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        area: img.naturalWidth * img.naturalHeight
      }));

    return images;
  }

  getMetaInformation() {
    const meta = {};
    const metaTags = document.querySelectorAll('meta[name][content]');
    
    metaTags.forEach(tag => {
      const name = tag.getAttribute('name');
      const content = tag.getAttribute('content');
      if (name && content) {
        meta[name] = content;
      }
    });
    
    return meta;
  }

  analyzePageStructure() {
    return {
      hasHeader: !!document.querySelector('header, [role="banner"]'),
      hasNavigation: !!document.querySelector('nav, [role="navigation"]'),
      hasMain: !!document.querySelector('main, [role="main"]'),
      hasFooter: !!document.querySelector('footer, [role="contentinfo"]'),
      headingStructure: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
        tag: h.tagName,
        text: h.innerText.substring(0, 100)
      }))
    };
  }

  injectAnalysisUI() {
    // Inject CSS for analysis overlays
    const style = document.createElement('style');
    style.textContent = `
      .chalamandra-overlay {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: rgba(22, 33, 62, 0.95);
        border: 1px solid #ff6b35;
        border-radius: 12px;
        padding: 16px;
        max-width: 320px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        animation: chalamandraSlideIn 0.3s ease-out;
      }
      
      .chalamandra-analysis-result {
        color: #e0e0e0;
      }
      
      .chalamandra-dimension {
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid #333;
      }
      
      .chalamandra-dimension:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }
      
      .chalamandra-dimension h4 {
        color: #ff6b35;
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 600;
      }
      
      .chalamandra-insight {
        font-size: 12px;
        line-height: 1.4;
        margin-bottom: 4px;
      }
      
      .chalamandra-insight strong {
        color: #4ecdc4;
      }
      
      .chalamandra-close {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        color: #888;
        cursor: pointer;
        font-size: 16px;
        padding: 4px;
      }
      
      .chalamandra-close:hover {
        color: #ff6b35;
      }
      
      @keyframes chalamandraSlideIn {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `;
    document.head.appendChild(style);
  }

  showAnalysisOverlay(analysis) {
    // Remove existing overlay
    this.removeAnalysisOverlay();
    
    const overlay = document.createElement('div');
    overlay.className = 'chalamandra-overlay';
    overlay.innerHTML = this.generateOverlayHTML(analysis);
    
    document.body.appendChild(overlay);
    
    // Add close button functionality
    const closeBtn = overlay.querySelector('.chalamandra-close');
    closeBtn.addEventListener('click', () => {
      this.removeAnalysisOverlay();
    });
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      this.removeAnalysisOverlay();
    }, 10000);
  }

  generateOverlayHTML(analysis) {
    return `
      <button class="chalamandra-close">&times;</button>
      <div class="chalamandra-analysis-result">
        <h4>🦎 Chalamandra Analysis</h4>
        
        <div class="chalamandra-dimension">
          <h5>🧠 Strategic</h5>
          <div class="chalamandra-insight">
            <strong>Power Dynamics:</strong> ${analysis.strategic?.powerDynamics || 'Balanced'}
          </div>
          <div class="chalamandra-insight">
            <strong>Hidden Agendas:</strong> ${analysis.strategic?.hiddenAgendas || 'Not detected'}
          </div>
        </div>
        
        <div class="chalamandra-dimension">
          <h5>💫 Emotional</h5>
          <div class="chalamandra-insight">
            <strong>Tone:</strong> ${analysis.emotional?.tone || 'Professional'}
          </div>
          <div class="chalamandra-insight">
            <strong>Score:</strong> ${analysis.emotional?.score || '75'}/100
          </div>
        </div>
        
        <div class="chalamandra-dimension">
          <h5>🔗 Relational</h5>
          <div class="chalamandra-insight">
            <strong>Trust Level:</strong> ${analysis.relational?.trust || 'Professional'}
          </div>
          <div class="chalamandra-insight">
            <strong>Connection:</strong> ${analysis.relational?.connection || 'Collaborative'}
          </div>
        </div>
      </div>
    `;
  }

  removeAnalysisOverlay() {
    const existingOverlay = document.querySelector('.chalamandra-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
  }

  logAnalysis(data) {
    // Send analysis data to background script for logging
    chrome.runtime.sendMessage({
      action: 'logAnalysis',
      data: data
    });
  }

  // Demo method for testing
  demoAnalysis() {
    const demoContent = {
      text: "This is a sample email demonstrating professional communication with clear intent and collaborative tone.",
      images: [],
      title: "Demo Email",
      url: "https://example.com"
    };
    
    return this.engine.analizarComunicacion(demoContent, 'quick');
  }
}

// Initialize content analyzer
const contentAnalyzer = new ContentAnalyzer();

// Export for testing
if (typeof module !== 'undefined') {
  module.exports = ContentAnalyzer;
  }

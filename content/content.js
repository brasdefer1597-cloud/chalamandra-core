// Chalamandra Core Content Script
// Analyzes communication on web pages in real-time

class ContentAnalyzer {
    constructor() {
        this.isActive = true;
        this.analyzedElements = new Set();
        this.init();
    }

    init() {
        console.log('🦎 Chalamandra Core Content Script initialized');
        
        this.injectStyles();
        this.setupObservers();
        this.bindEvents();
        this.analyzeExistingContent();
    }

    injectStyles() {
        // Styles are injected via content.css
        console.log('Content analyzer styles injected');
    }

    setupObservers() {
        // Observe DOM changes for dynamic content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.analyzeNewContent(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('DOM observer setup complete');
    }

    bindEvents() {
        // Listen for messages from background/popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true;
        });

        // Add context menu support
        document.addEventListener('contextmenu', this.handleContextMenu.bind(this));
    }

    handleMessage(request, sender, sendResponse) {
        switch (request.action) {
            case 'analyzeSelectedText':
                this.analyzeSelectedText(request.text);
                sendResponse({ success: true });
                break;

            case 'analyzePageContent':
                const analysis = this.analyzePageContent();
                sendResponse({ success: true, data: analysis });
                break;

            case 'toggleAnalysis':
                this.isActive = request.enabled;
                sendResponse({ success: true });
                break;

            default:
                sendResponse({ success: false, error: 'Unknown action' });
        }
    }

    handleContextMenu(event) {
        // Future: Add context menu integration
    }

    analyzeExistingContent() {
        if (!this.isActive) return;

        // Analyze common communication elements
        const elements = this.findCommunicationElements();
        elements.forEach(element => {
            this.analyzeElement(element);
        });

        console.log(`Analyzed ${elements.length} communication elements`);
    }

    analyzeNewContent(container) {
        if (!this.isActive) return;

        const elements = this.findCommunicationElements(container);
        elements.forEach(element => {
            if (!this.analyzedElements.has(element)) {
                this.analyzeElement(element);
                this.analyzedElements.add(element);
            }
        });
    }

    findCommunicationElements(container = document) {
        const selectors = [
            // Email clients
            '[role="textbox"]',
            '.editable',
            '[contenteditable="true"]',
            '.email-body',
            '.message-content',
            
            // Chat applications
            '.message',
            '.chat-bubble',
            '.conversation',
            '[data-message]',
            
            // Social media
            '[data-testid="tweet"]',
            '.post-content',
            '.status-update',
            
            // Forms and comments
            'textarea',
            '.comment',
            '.review-content',
            
            // Generic text containers
            '.content',
            '.text',
            '.body'
        ];

        const elements = [];
        selectors.forEach(selector => {
            const found = container.querySelectorAll(selector);
            found.forEach(el => {
                if (this.isValidCommunicationElement(el)) {
                    elements.push(el);
                }
            });
        });

        return elements;
    }

    isValidCommunicationElement(element) {
        const text = element.textContent || element.value || '';
        return text.trim().length >= 10 && text.trim().length <= 5000;
    }

    async analyzeElement(element) {
        try {
            const text = this.extractTextFromElement(element);
            if (!text || text.length < 10) return;

            const analysis = await this.requestAnalysis(text);
            this.displayAnalysis(element, analysis);

        } catch (error) {
            console.warn('Element analysis failed:', error);
        }
    }

    extractTextFromElement(element) {
        // Get clean text content
        let text = '';
        
        if (element.tagName === 'TEXTAREA' || element.isContentEditable) {
            text = element.value || element.textContent || '';
        } else {
            text = element.textContent || '';
        }

        // Clean and trim text
        return text.replace(/\s+/g, ' ').trim().substring(0, 2000);
    }

    async requestAnalysis(text) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: 'analyzeCommunication',
                data: {
                    text: text,
                    timestamp: new Date().toISOString(),
                    source: 'content-script',
                    url: window.location.href
                }
            }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else if (response && response.success) {
                    resolve(response.data);
                } else {
                    reject(new Error(response?.error || 'Analysis failed'));
                }
            });
        });
    }

    displayAnalysis(element, analysis) {
        // Create and show analysis badge
        const badge = this.createAnalysisBadge(analysis);
        
        // Position badge near the element
        this.positionBadge(element, badge);
        
        // Add hover effects
        this.addHoverBehavior(element, badge, analysis);
    }

    createAnalysisBadge(analysis) {
        const badge = document.createElement('div');
        badge.className = 'chalamandra-badge';
        
        const riskLevel = this.getRiskLevel(analysis);
        const riskColor = this.getRiskColor(riskLevel);
        
        badge.innerHTML = `
            <div class="chalamandra-badge-content" style="border-left-color: ${riskColor}">
                <div class="chalamandra-badge-header">
                    <span class="chalamandra-logo">🦎</span>
                    <span class="chalamandra-risk-level">${riskLevel.toUpperCase()}</span>
                </div>
                <div class="chalamandra-badge-body">
                    <div class="chalamandra-score">Score: ${this.calculateOverallScore(analysis)}%</div>
                    <div class="chalamandra-insight">${this.getPrimaryInsight(analysis)}</div>
                </div>
            </div>
        `;

        // Add click behavior for detailed view
        badge.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showDetailedAnalysis(analysis);
        });

        return badge;
    }

    getRiskLevel(analysis) {
        if (analysis.overallRisk >= 70) return 'high';
        if (analysis.overallRisk >= 40) return 'medium';
        return 'low';
    }

    getRiskColor(riskLevel) {
        const colors = {
            high: '#DC143C',
            medium: '#FFA500', 
            low: '#2E8B57'
        };
        return colors[riskLevel] || '#6c757d';
    }

    calculateOverallScore(analysis) {
        const baseScore = 100 - (analysis.overallRisk || 50);
        return Math.max(0, Math.min(100, baseScore));
    }

    getPrimaryInsight(analysis) {
        if (analysis.sarcasmScore > 70) {
            return 'Possible sarcasm detected';
        }
        if (analysis.emotional?.tone === 'negative') {
            return 'Negative tone identified';
        }
        if (analysis.strategic?.powerDynamics === 'high') {
            return 'Directive language used';
        }
        return 'Professional communication';
    }

    positionBadge(element, badge) {
        const rect = element.getBoundingClientRect();
        
        // Position badge to the right of the element
        badge.style.position = 'absolute';
        badge.style.top = `${rect.top + window.scrollY}px`;
        badge.style.left = `${rect.right + 10 + window.scrollX}px`;
        badge.style.zIndex = '10000';
        
        document.body.appendChild(badge);
    }

    addHoverBehavior(element, badge, analysis) {
        let hoverTimeout;
        
        element.addEventListener('mouseenter', () => {
            hoverTimeout = setTimeout(() => {
                badge.style.opacity = '1';
                badge.style.transform = 'translateX(0)';
            }, 300);
        });

        element.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
            badge.style.opacity = '0';
            badge.style.transform = 'translateX(-10px)';
        });

        // Initial hidden state
        badge.style.opacity = '0';
        badge.style.transform = 'translateX(-10px)';
        badge.style.transition = 'all 0.3s ease';
    }

    showDetailedAnalysis(analysis) {
        // Create detailed analysis modal
        const modal = this.createAnalysisModal(analysis);
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });

        // Close on escape key
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                this.closeModal(modal);
                document.removeEventListener('keydown', closeOnEscape);
            }
        }.bind(this));
    }

    createAnalysisModal(analysis) {
        const modal = document.createElement('div');
        modal.className = 'chalamandra-modal';
        
        modal.innerHTML = `
            <div class="chalamandra-modal-content">
                <div class="chalamandra-modal-header">
                    <h3>🦎 Communication Analysis</h3>
                    <button class="chalamandra-close">&times;</button>
                </div>
                <div class="chalamandra-modal-body">
                    <div class="analysis-summary">
                        <div class="overall-score">
                            <div class="score-circle">
                                <span class="score-value">${this.calculateOverallScore(analysis)}</span>
                                <span class="score-label">Score</span>
                            </div>
                            <div class="risk-level ${this.getRiskLevel(analysis)}">
                                ${this.getRiskLevel(analysis).toUpperCase()} RISK
                            </div>
                        </div>
                    </div>
                    
                    <div class="analysis-details">
                        <div class="detail-category">
                            <h4>Strategic Analysis</h4>
                            <p>${this.getStrategicSummary(analysis.strategic)}</p>
                        </div>
                        
                        <div class="detail-category">
                            <h4>Emotional Tone</h4>
                            <p>${this.getEmotionalSummary(analysis.emotional)}</p>
                        </div>
                        
                        <div class="detail-category">
                            <h4>Relational Impact</h4>
                            <p>${this.getRelationalSummary(analysis.relational)}</p>
                        </div>
                    </div>
                    
                    <div class="recommendations">
                        <h4>Recommendations</h4>
                        <ul>
                            ${analysis.recommendations ? analysis.recommendations.map(rec => 
                                `<li>${rec}</li>`
                            ).join('') : '<li>No specific recommendations</li>'}
                        </ul>
                    </div>
                </div>
            </div>
        `;

        // Close button
        modal.querySelector('.chalamandra-close').addEventListener('click', () => {
            this.closeModal(modal);
        });

        return modal;
    }

    getStrategicSummary(strategic) {
        if (!strategic) return 'No strategic analysis available';
        
        const parts = [];
        if (strategic.powerDynamics) parts.push(`Power dynamics: ${strategic.powerDynamics}`);
        if (strategic.hiddenAgendas) parts.push('Possible hidden agendas');
        
        return parts.length > 0 ? parts.join(', ') : 'Balanced strategic communication';
    }

    getEmotionalSummary(emotional) {
        if (!emotional) return 'No emotional analysis available';
        
        const tone = emotional.tone || 'neutral';
        const score = emotional.score || 50;
        
        return `${tone.charAt(0).toUpperCase() + tone.slice(1)} tone (${score}/100)`;
    }

    getRelationalSummary(relational) {
        if (!relational) return 'No relational analysis available';
        
        const parts = [];
        if (relational.trust) parts.push(`Trust level: ${relational.trust}`);
        if (relational.connection) parts.push(`Connection: ${relational.connection}`);
        
        return parts.length > 0 ? parts.join(', ') : 'Standard professional relationship';
    }

    closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    analyzeSelectedText(selectedText) {
        this.requestAnalysis(selectedText).then(analysis => {
            // Show quick analysis for selected text
            this.showQuickAnalysis(selectedText, analysis);
        }).catch(error => {
            console.warn('Selected text analysis failed:', error);
        });
    }

    showQuickAnalysis(text, analysis) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'chalamandra-quick-analysis';
        notification.innerHTML = `
            <div class="quick-analysis-content">
                <strong>🦎 Quick Analysis</strong>
                <p>${this.getPrimaryInsight(analysis)}</p>
                <small>Score: ${this.calculateOverallScore(analysis)}%</small>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-left: 4px solid ${this.getRiskColor(this.getRiskLevel(analysis))};
            padding: 12px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            max-width: 300px;
            font-family: sans-serif;
            font-size: 14px;
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    analyzePageContent() {
        const elements = this.findCommunicationElements();
        const analyses = [];
        
        elements.forEach(element => {
            const text = this.extractTextFromElement(element);
            if (text) {
                analyses.push({
                    text: text.substring(0, 100) + '...',
                    element: element.tagName,
                    hasAnalysis: this.analyzedElements.has(element)
                });
            }
        });

        return {
            pageUrl: window.location.href,
            totalElements: elements.length,
            analyzedElements: this.analyzedElements.size,
            elements: analyses.slice(0, 10) // Limit to first 10
        };
    }
}

// Initialize content analyzer
const contentAnalyzer = new ContentAnalyzer();

// Export for testing
if (typeof module !== 'undefined') {
    module.exports = ContentAnalyzer;
}

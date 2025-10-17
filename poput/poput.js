// Chalamandra Core Popup JavaScript
class PopupManager {
    constructor() {
        this.currentAnalysis = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadUserPreferences();
        console.log('🦎 Chalamandra Core Popup initialized');
    }

    bindEvents() {
        // Analysis button
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.analyzeText();
        });

        // New analysis button
        document.getElementById('newAnalysisBtn').addEventListener('click', () => {
            this.resetAnalysis();
        });

        // Retry button
        document.getElementById('retryBtn').addEventListener('click', () => {
            this.analyzeText();
        });

        // Enter key in textarea
        document.getElementById('textInput').addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.analyzeText();
            }
        });

        // Footer buttons
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettings();
        });

        document.getElementById('historyBtn').addEventListener('click', () => {
            this.showHistory();
        });

        document.getElementById('helpBtn').addEventListener('click', () => {
            this.showHelp();
        });
    }

    async analyzeText() {
        const textInput = document.getElementById('textInput');
        const text = textInput.value.trim();

        if (!text) {
            this.showError('Please enter some text to analyze');
            return;
        }

        this.showLoading();

        try {
            const analysis = await this.sendAnalysisRequest(text);
            this.displayResults(analysis);
        } catch (error) {
            console.error('Analysis error:', error);
            this.showError('Failed to analyze text. Please try again.');
        }
    }

    async sendAnalysisRequest(text) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: 'analyzeCommunication',
                data: {
                    text: text,
                    timestamp: new Date().toISOString(),
                    source: 'popup'
                }
            }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else if (response && response.success) {
                    resolve(response.data);
                } else {
                    reject(new Error(response?.error || 'Unknown error'));
                }
            });
        });
    }

    displayResults(analysis) {
        this.currentAnalysis = analysis;
        this.showResults();

        // Update confidence score
        document.getElementById('confidenceValue').textContent = 
            `${Math.round((analysis.confidence || 0.7) * 100)}%`;

        // Update risk indicators
        this.updateRiskIndicators(analysis);

        // Update insights
        this.updateInsights(analysis);

        // Update recommendations
        this.updateRecommendations(analysis);

        // Update detail bars
        this.updateDetailBars(analysis);
    }

    updateRiskIndicators(analysis) {
        const container = document.getElementById('riskIndicators');
        container.innerHTML = '';

        const indicators = [];

        // Sarcasm risk
        if (analysis.sarcasmScore > 70) {
            indicators.push({
                text: `Sarcasm: ${analysis.sarcasmScore}%`,
                level: 'high'
            });
        }

        // Overall risk
        if (analysis.overallRisk > 70) {
            indicators.push({
                text: `High Risk: ${analysis.overallRisk}%`,
                level: 'high'
            });
        } else if (analysis.overallRisk > 40) {
            indicators.push({
                text: `Medium Risk: ${analysis.overallRisk}%`,
                level: 'medium'
            });
        } else {
            indicators.push({
                text: `Low Risk: ${analysis.overallRisk}%`,
                level: 'low'
            });
        }

        // Strategic risk
        if (analysis.strategic?.powerDynamics === 'high') {
            indicators.push({
                text: 'Power Dynamics',
                level: 'medium'
            });
        }

        // Create indicator elements
        indicators.forEach(indicator => {
            const element = document.createElement('div');
            element.className = `risk-indicator risk-${indicator.level}`;
            element.textContent = indicator.text;
            container.appendChild(element);
        });
    }

    updateInsights(analysis) {
        const container = document.getElementById('insightsList');
        container.innerHTML = '';

        const insights = [];

        // Emotional insights
        if (analysis.emotional) {
            if (analysis.emotional.tone === 'sarcastic') {
                insights.push('Sarcastic tone detected - may cause misunderstandings');
            } else if (analysis.emotional.tone === 'negative') {
                insights.push('Negative tone - consider more constructive language');
            } else if (analysis.emotional.tone === 'positive') {
                insights.push('Positive tone - good for team morale');
            }

            if (analysis.emotional.score < 30) {
                insights.push('Low emotional score - review message impact');
            }
        }

        // Strategic insights
        if (analysis.strategic) {
            if (analysis.strategic.hiddenAgendas) {
                insights.push('Possible hidden agendas - be more transparent');
            }
            if (analysis.strategic.powerDynamics === 'high') {
                insights.push('Hierarchical language - consider collaborative approach');
            }
        }

        // Relational insights
        if (analysis.relational) {
            if (analysis.relational.trust === 'low') {
                insights.push('Low trust indicators - build more transparency');
            }
            if (analysis.relational.connection === 'weak') {
                insights.push('Weak connection - strengthen relational language');
            }
        }

        // Add insights to container
        insights.forEach(insight => {
            const element = document.createElement('div');
            element.className = 'insight-item';
            element.textContent = insight;
            container.appendChild(element);
        });

        // If no insights, show default
        if (insights.length === 0) {
            const element = document.createElement('div');
            element.className = 'insight-item';
            element.textContent = 'Communication appears professional and clear';
            container.appendChild(element);
        }
    }

    updateRecommendations(analysis) {
        const container = document.getElementById('recommendationsList');
        container.innerHTML = '';

        let recommendations = analysis.recommendations || [];

        // Add default recommendations if none provided
        if (recommendations.length === 0) {
            recommendations = [
                'Maintain current communication style',
                'Continue using clear and professional language'
            ];
        }

        // Add recommendations to list
        recommendations.forEach(rec => {
            const element = document.createElement('li');
            element.textContent = rec;
            container.appendChild(element);
        });
    }

    updateDetailBars(analysis) {
        // Strategic bar
        const strategicValue = this.calculateStrategicValue(analysis.strategic);
        document.getElementById('strategicBar').style.width = `${strategicValue}%`;
        document.getElementById('strategicValue').textContent = 
            this.getStrategicLabel(strategicValue);

        // Emotional bar
        const emotionalValue = analysis.emotional?.score || 50;
        document.getElementById('emotionalBar').style.width = `${emotionalValue}%`;
        document.getElementById('emotionalValue').textContent = 
            this.getEmotionalLabel(emotionalValue);

        // Relational bar
        const relationalValue = this.calculateRelationalValue(analysis.relational);
        document.getElementById('relationalBar').style.width = `${relationalValue}%`;
        document.getElementById('relationalValue').textContent = 
            this.getRelationalLabel(relationalValue);
    }

    calculateStrategicValue(strategic) {
        if (!strategic) return 50;
        
        let score = 50;
        if (strategic.powerDynamics === 'low') score += 20;
        if (strategic.powerDynamics === 'high') score -= 20;
        if (strategic.hiddenAgendas) score -= 30;
        
        return Math.max(0, Math.min(100, score));
    }

    calculateRelationalValue(relational) {
        if (!relational) return 50;
        
        let score = 50;
        if (relational.trust === 'high') score += 25;
        if (relational.trust === 'low') score -= 25;
        if (relational.connection === 'strong') score += 15;
        if (relational.connection === 'weak') score -= 15;
        
        return Math.max(0, Math.min(100, score));
    }

    getStrategicLabel(value) {
        if (value >= 70) return 'Collaborative';
        if (value >= 40) return 'Balanced';
        return 'Directive';
    }

    getEmotionalLabel(value) {
        if (value >= 70) return 'Positive';
        if (value >= 40) return 'Neutral';
        return 'Negative';
    }

    getRelationalLabel(value) {
        if (value >= 70) return 'Strong';
        if (value >= 40) return 'Moderate';
        return 'Weak';
    }

    showLoading() {
        this.hideAllSections();
        document.getElementById('loading').classList.remove('hidden');
        
        const analyzeBtn = document.getElementById('analyzeBtn');
        analyzeBtn.disabled = true;
        analyzeBtn.querySelector('.btn-text').textContent = 'Analyzing...';
        analyzeBtn.querySelector('.loading-spinner').style.display = 'block';
    }

    showResults() {
        this.hideAllSections();
        document.getElementById('results').classList.remove('hidden');
        
        const analyzeBtn = document.getElementById('analyzeBtn');
        analyzeBtn.disabled = false;
        analyzeBtn.querySelector('.btn-text').textContent = 'Analyze Communication';
        analyzeBtn.querySelector('.loading-spinner').style.display = 'none';
    }

    showError(message) {
        this.hideAllSections();
        document.getElementById('error').classList.remove('hidden');
        document.getElementById('errorMessage').textContent = message;
        
        const analyzeBtn = document.getElementById('analyzeBtn');
        analyzeBtn.disabled = false;
        analyzeBtn.querySelector('.btn-text').textContent = 'Analyze Communication';
        analyzeBtn.querySelector('.loading-spinner').style.display = 'none';
    }

    resetAnalysis() {
        this.hideAllSections();
        document.getElementById('analysis-section').classList.remove('hidden');
        document.getElementById('textInput').value = '';
        document.getElementById('textInput').focus();
    }

    hideAllSections() {
        const sections = ['analysis-section', 'results', 'loading', 'error'];
        sections.forEach(section => {
            const element = document.getElementById(section);
            if (element) {
                element.classList.add('hidden');
            }
        });
    }

    showSettings() {
        // Future feature: Open options page
        chrome.runtime.openOptionsPage();
    }

    showHistory() {
        // Future feature: Show analysis history
        alert('Analysis history feature coming soon!');
    }

    showHelp() {
        // Future feature: Show help documentation
        window.open('https://github.com/brasdefer1597-cloud/chalamandra-core', '_blank');
    }

    async loadUserPreferences() {
        try {
            const preferences = await new Promise((resolve) => {
                chrome.storage.local.get(['userPreferences'], (result) => {
                    resolve(result.userPreferences);
                });
            });
            
            if (preferences) {
                console.log('User preferences loaded:', preferences);
            }
        } catch (error) {
            console.warn('Failed to load user preferences:', error);
        }
    }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});

// Add some demo text for testing
document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    
    // Add demo text for easy testing
    if (!textInput.value) {
        textInput.value = "Great job on the project! I'm really impressed with how everything turned out, especially considering the tight deadlines. Looking forward to working together again soon!";
    }
    
    textInput.focus();
});

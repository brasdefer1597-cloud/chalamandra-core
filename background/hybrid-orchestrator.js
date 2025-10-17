class HybridOrchestrator {
    constructor() {
        this.localEngine = new ChalamandraEngine();
        this.useCloudEnhancement = false;
        this.cloudEndpoints = {
            deepAnalysis: 'https://api.chalamandra-core.com/v1/analyze',
            sentiment: 'https://api.chalamandra-core.com/v1/sentiment',
            culturalContext: 'https://api.chalamandra-core.com/v1/cultural'
        };
        this.init();
    }

    init() {
        this.loadUserPreferences();
        this.setupConnectivityCheck();
    }

    async loadUserPreferences() {
        try {
            const preferences = await new Promise((resolve) => {
                chrome.storage.local.get(['userPreferences'], (result) => {
                    resolve(result.userPreferences);
                });
            });
            
            this.useCloudEnhancement = preferences?.enableCloudEnhancement || false;
            this.privacyLevel = preferences?.privacyLevel || 'high';
        } catch (error) {
            console.warn('Failed to load hybrid preferences:', error);
        }
    }

    async analyzeCommunication(content, options = {}) {
        const {
            mode = 'auto',
            requireConsent = true,
            timeout = 5000
        } = options;

        console.log(`🦎 Hybrid analysis started (mode: ${mode})`);

        // Always start with local analysis
        const localAnalysis = await this.localEngine.analyzeCommunication(content, 'quick');
        
        // Determine if cloud enhancement is needed and allowed
        const shouldUseCloud = await this.shouldUseCloudEnhancement(localAnalysis, mode, requireConsent);
        
        if (shouldUseCloud) {
            try {
                const cloudAnalysis = await this.performCloudAnalysis(content, localAnalysis, timeout);
                return this.mergeAnalyses(localAnalysis, cloudAnalysis);
            } catch (cloudError) {
                console.warn('Cloud analysis failed, using local only:', cloudError);
                return this.enhanceWithFallback(localAnalysis);
            }
        }

        return localAnalysis;
    }

    async shouldUseCloudEnhancement(localAnalysis, mode, requireConsent) {
        // Check user preferences
        if (!this.useCloudEnhancement) return false;
        
        // Check privacy level
        if (this.privacyLevel === 'high') return false;
        
        // Check connectivity
        if (!await this.isOnline()) return false;
        
        // Check if consent is required and given
        if (requireConsent && !await this.hasCloudConsent()) return false;
        
        // Mode-based decisions
        switch (mode) {
            case 'local-only':
                return false;
            case 'cloud-only':
                return true;
            case 'auto':
            default:
                return this.needsCloudEnhancement(localAnalysis);
        }
    }

    needsCloudEnhancement(localAnalysis) {
        // Use cloud when local analysis has low confidence
        if (localAnalysis.confidence < 0.6) return true;
        
        // Use cloud for high-risk communications
        if (localAnalysis.overallRisk > 70) return true;
        
        // Use cloud when sarcasm detection is uncertain
        if (localAnalysis.sarcasmScore > 50 && localAnalysis.sarcasmScore < 80) return true;
        
        // Use cloud for complex multimodal analysis
        if (localAnalysis.multimodalElements?.length > 2) return true;
        
        return false;
    }

    async performCloudAnalysis(content, localAnalysis, timeout) {
        console.log('☁️ Starting cloud-enhanced analysis');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const payload = this.prepareCloudPayload(content, localAnalysis);
            
            const response = await fetch(this.cloudEndpoints.deepAnalysis, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-Version': '2.0.0',
                    'X-Client-ID': this.getClientId()
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Cloud API error: ${response.status}`);
            }

            const cloudData = await response.json();
            return this.validateCloudResponse(cloudData);

        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    prepareCloudPayload(content, localAnalysis) {
        // Remove any personally identifiable information
        const sanitizedContent = this.sanitizeContent(content);
        
        return {
            text: sanitizedContent.text,
            localAnalysis: {
                confidence: localAnalysis.confidence,
                riskScore: localAnalysis.overallRisk,
                sarcasmScore: localAnalysis.sarcasmScore,
                emotionalTone: localAnalysis.emotional?.tone
            },
            context: {
                contentType: this.detectContentType(content),
                language: 'en',
                requiresCulturalContext: true,
                multimodalElements: content.images?.length || 0
            },
            options: {
                enhanceSentiment: true,
                culturalAnalysis: true,
                relationshipDynamics: true,
                professionalContext: true
            }
        };
    }

    sanitizeContent(content) {
        // Basic sanitization - remove emails, phone numbers, etc.
        const sanitizedText = content.text
            .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
            .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]')
            .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[CREDIT_CARD]');
            
        return {
            ...content,
            text: sanitizedText
        };
    }

    detectContentType(content) {
        const text = content.text.toLowerCase();
        
        if (text.includes('dear') && text.includes('sincerely')) return 'email';
        if (text.includes('@') && text.length < 280) return 'social_media';
        if (text.includes('meeting') && text.includes('agenda')) return 'business';
        if (text.includes('?') && text.length < 150) return 'question';
        
        return 'general';
    }

    validateCloudResponse(cloudData) {
        const requiredFields = ['enhancedAnalysis', 'confidence', 'culturalContext'];
        const missingFields = requiredFields.filter(field => !(field in cloudData));
        
        if (missingFields.length > 0) {
            throw new Error(`Invalid cloud response: missing ${missingFields.join(', ')}`);
        }
        
        return {
            ...cloudData,
            source: 'cloud-enhanced',
            timestamp: new Date().toISOString()
        };
    }

    mergeAnalyses(localAnalysis, cloudAnalysis) {
        return {
            // Prefer cloud analysis when available
            strategic: cloudAnalysis.enhancedAnalysis?.strategic || localAnalysis.strategic,
            emotional: cloudAnalysis.enhancedAnalysis?.emotional || localAnalysis.emotional,
            relational: cloudAnalysis.enhancedAnalysis?.relational || localAnalysis.relational,
            
            // Use cloud-enhanced scores with local fallback
            overallRisk: this.calculateHybridRisk(localAnalysis, cloudAnalysis),
            sarcasmScore: cloudAnalysis.enhancedAnalysis?.sarcasmScore || localAnalysis.sarcasmScore,
            
            // Combine recommendations
            recommendations: [
                ...(localAnalysis.recommendations || []),
                ...(cloudAnalysis.enhancedAnalysis?.recommendations || [])
            ].slice(0, 5), // Limit to top 5
            
            // Metadata
            source: 'hybrid',
            confidence: Math.max(localAnalysis.confidence, cloudAnalysis.confidence),
            culturalContext: cloudAnalysis.culturalContext,
            timestamp: new Date().toISOString(),
            
            // Debug info
            _hybridInfo: {
                localConfidence: localAnalysis.confidence,
                cloudConfidence: cloudAnalysis.confidence,
                usedCloud: true
            }
        };
    }

    calculateHybridRisk(localAnalysis, cloudAnalysis) {
        const localRisk = localAnalysis.overallRisk || 50;
        const cloudRisk = cloudAnalysis.enhancedAnalysis?.overallRisk || 50;
        const cloudConfidence = cloudAnalysis.confidence || 0.5;
        
        // Weighted average based on cloud confidence
        return Math.round(
            (localRisk * (1 - cloudConfidence)) + 
            (cloudRisk * cloudConfidence)
        );
    }

    enhanceWithFallback(localAnalysis) {
        // Add fallback enhancements when cloud is unavailable
        return {
            ...localAnalysis,
            culturalContext: this.generateFallbackCulturalContext(),
            recommendations: [
                ...(localAnalysis.recommendations || []),
                'Consider cultural context in communication',
                'Be mindful of timezone differences in global teams'
            ],
            source: 'local-enhanced',
            _hybridInfo: {
                usedCloud: false,
                fallbackEnhancement: true
            }
        };
    }

    generateFallbackCulturalContext() {
        return {
            directness: 'medium',
            formality: 'professional',
            contextStyle: 'neutral',
            note: 'Based on general professional communication patterns'
        };
    }

    async isOnline() {
        try {
            const response = await fetch('https://www.google.com/favicon.ico', {
                method: 'HEAD',
                cache: 'no-cache'
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    async hasCloudConsent() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['cloudConsent'], (result) => {
                resolve(result.cloudConsent === true);
            });
        });
    }

    async requestCloudConsent() {
        return new Promise((resolve) => {
            // Show consent dialog
            chrome.runtime.sendMessage({
                action: 'showConsentDialog',
                data: {
                    title: 'Cloud Enhancement',
                    message: 'Enable cloud-based analysis for improved accuracy? Your data will be anonymized.',
                    options: ['Accept', 'Decline']
                }
            }, (response) => {
                const accepted = response?.choice === 'Accept';
                
                if (accepted) {
                    chrome.storage.local.set({ cloudConsent: true });
                }
                
                resolve(accepted);
            });
        });
    }

    getClientId() {
        // Generate or retrieve anonymous client ID
        let clientId = localStorage.getItem('chalamandra_client_id');
        if (!clientId) {
            clientId = 'client_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chalamandra_client_id', clientId);
        }
        return clientId;
    }

    setupConnectivityCheck() {
        // Periodic connectivity checks
        setInterval(() => {
            this.isOnline().then(online => {
                this.isOnlineStatus = online;
            });
        }, 30000); // Check every 30 seconds
    }

    // Performance monitoring
    async performanceCheck() {
        const localStart = performance.now();
        await this.localEngine.analyzeCommunication({ text: 'Test performance' }, 'quick');
        const localTime = performance.now() - localStart;

        let cloudTime = null;
        if (await this.shouldUseCloudEnhancement({ confidence: 0.5 }, 'auto', false)) {
            const cloudStart = performance.now();
            try {
                await this.performCloudAnalysis(
                    { text: 'Test performance' }, 
                    { confidence: 0.5 }, 
                    3000
                );
                cloudTime = performance.now() - cloudStart;
            } catch {
                cloudTime = 'failed';
            }
        }

        return {
            localAnalysisTime: Math.round(localTime),
            cloudAnalysisTime: cloudTime,
            hybridEnabled: this.useCloudEnhancement,
            isOnline: this.isOnlineStatus
        };
    }
}

if (typeof module !== 'undefined') {
    module.exports = HybridOrchestrator;
}

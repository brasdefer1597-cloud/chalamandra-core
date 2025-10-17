class ContextAnalyzer {
    constructor() {
        this.platformPatterns = {
            email: {
                indicators: ['@', 'subject:', 'dear', 'sincerely', 'regards'],
                context: 'professional'
            },
            slack: {
                indicators: ['channel', 'thread', '<@', '<!'],
                context: 'team_collaboration'
            },
            linkedin: {
                indicators: ['connect', 'endorse', 'profile', 'linkedin'],
                context: 'professional_networking'
            },
            twitter: {
                indicators: ['tweet', 'retweet', 'hashtag', '@', '#'],
                context: 'social_public'
            },
            whatsapp: {
                indicators: ['whatsapp', 'message', 'chat'],
                context: 'personal_informal'
            }
        };

        this.relationshipContexts = {
            manager_subordinate: {
                formality: 'high',
                directness: 'medium',
                riskFactors: ['power_imbalance', 'career_impact']
            },
            peer_colleague: {
                formality: 'medium', 
                directness: 'high',
                riskFactors: ['collaboration', 'team_dynamics']
            },
            client_vendor: {
                formality: 'high',
                directness: 'medium',
                riskFactors: ['business_relationship', 'reputation']
            },
            team_group: {
                formality: 'low',
                directness: 'high', 
                riskFactors: ['group_dynamics', 'inclusion']
            }
        };

        this.init();
    }

    init() {
        this.loadContextPatterns();
    }

    async analyzeContext(content, metadata = {}) {
        const context = {
            platform: this.detectPlatform(metadata),
            relationship: this.inferRelationship(metadata),
            urgency: this.detectUrgency(content),
            formality: this.detectFormalityLevel(content),
            culturalFactors: this.analyzeCulturalFactors(content),
            temporalContext: this.analyzeTemporalContext(metadata),
            riskProfile: this.calculateRiskProfile(content, metadata)
        };

        return {
            ...context,
            recommendations: this.generateContextRecommendations(context),
            confidence: this.calculateContextConfidence(context)
        };
    }

    detectPlatform(metadata) {
        const url = metadata.url || '';
        const userAgent = metadata.userAgent || '';
        const text = metadata.text || '';

        // URL-based detection
        if (url.includes('mail.google.com') || url.includes('outlook.office.com')) {
            return { type: 'email', variant: 'gmail' };
        }
        if (url.includes('slack.com')) {
            return { type: 'slack', variant: 'team_chat' };
        }
        if (url.includes('linkedin.com')) {
            return { type: 'linkedin', variant: 'professional_network' };
        }
        if (url.includes('twitter.com') || url.includes('x.com')) {
            return { type: 'twitter', variant: 'social_media' };
        }

        // Content-based detection
        for (const [platform, patterns] of Object.entries(this.platformPatterns)) {
            if (patterns.indicators.some(indicator => 
                text.toLowerCase().includes(indicator.toLowerCase())
            )) {
                return { type: platform, variant: patterns.context };
            }
        }

        return { type: 'unknown', variant: 'general' };
    }

    inferRelationship(metadata) {
        // Analyze relationship based on content and context
        const text = metadata.text || '';
        const participants = metadata.participants || 1;

        if (text.includes('report to') || text.includes('your manager')) {
            return 'manager_subordinate';
        }
        if (text.includes('client') || text.includes('customer')) {
            return 'client_vendor'; 
        }
        if (participants > 2 || text.includes('team') || text.includes('group')) {
            return 'team_group';
        }
        if (text.includes('colleague') || text.includes('peer')) {
            return 'peer_colleague';
        }

        // Default based on formality
        const formality = this.detectFormalityLevel({ text });
        return formality === 'high' ? 'client_vendor' : 'peer_colleague';
    }

    detectUrgency(content) {
        const text = content.text.toLowerCase();
        const urgencyIndicators = {
            high: ['asap', 'urgent', 'immediately', 'emergency', 'deadline', 'today'],
            medium: ['soon', 'prompt', 'attention', 'important', 'follow up'],
            low: ['when convenient', 'no rush', 'at your leisure', 'when possible']
        };

        for (const [level, indicators] of Object.entries(urgencyIndicators)) {
            if (indicators.some(indicator => text.includes(indicator))) {
                return level;
            }
        }

        return 'low';
    }

    detectFormalityLevel(content) {
        const text = content.text;
        
        // Formal indicators
        const formalMarkers = [
            /\b(dear|sincerely|regards|respectfully)\b/i,
            /\b(please|kindly|would you)\b/i,
            /\b(meeting|agenda|minutes|conference)\b/i,
            /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/ // Full names
        ];

        // Informal indicators  
        const informalMarkers = [
            /\b(hey|hi|hello|yo)\b/i,
            /\b(lol|haha|lmao)\b/i,
            /\b(gonna|wanna|gotta)\b/i,
            /!{2,}/, // Multiple exclamation marks
            /\b(thanks|thx|cheers)\b/i
        ];

        const formalScore = formalMarkers.filter(pattern => pattern.test(text)).length;
        const informalScore = informalMarkers.filter(pattern => pattern.test(text)).length;

        if (formalScore > informalScore) return 'high';
        if (informalScore > formalScore) return 'low';
        return 'medium';
    }

    analyzeCulturalFactors(content) {
        const text = content.text.toLowerCase();
        const factors = {};

        // Directness analysis
        factors.directness = this.analyzeDirectness(text);
        
        // Formality analysis
        factors.formality = this.analyzeFormality(text);
        
        // Emotional expressiveness
        factors.expressiveness = this.analyzeExpressiveness(text);
        
        // Context dependence
        factors.contextDependence = this.analyzeContextDependence(text);

        return factors;
    }

    analyzeDirectness(text) {
        const directPhrases = ['i need', 'you must', 'we should', 'directly', 'clearly'];
        const indirectPhrases = ['perhaps', 'maybe', 'could you', 'would it be possible', 'i wonder'];
        
        const directCount = directPhrases.filter(phrase => text.includes(phrase)).length;
        const indirectCount = indirectPhrases.filter(phrase => text.includes(phrase)).length;
        
        if (directCount > indirectCount) return 'high';
        if (indirectCount > directCount) return 'low';
        return 'medium';
    }

    analyzeFormality(text) {
        const formalWords = ['therefore', 'however', 'furthermore', 'additionally'];
        const informalWords = ['cool', 'awesome', 'stuff', 'things', 'guy'];
        
        const formalCount = formalWords.filter(word => text.includes(word)).length;
        const informalCount = informalWords.filter(word => text.includes(word)).length;
        
        if (formalCount > informalCount) return 'high';
        if (informalCount > formalCount) return 'low';
        return 'medium';
    }

    analyzeExpressiveness(text) {
        const emotionalIndicators = ['!', '!!', '!!!', '😊', '😠', '😢', '❤️', '😂'];
        let expressivenessScore = 0;
        
        emotionalIndicators.forEach(indicator => {
            const count = (text.match(new RegExp(indicator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
            expressivenessScore += count;
        });
        
        if (expressivenessScore >= 3) return 'high';
        if (expressivenessScore >= 1) return 'medium';
        return 'low';
    }

    analyzeContextDependence(text) {
        // High context cultures use more implicit communication
        const implicitMarkers = ['as you know', 'obviously', 'of course', 'naturally'];
        const explicitMarkers = ['specifically', 'exactly', 'precisely', 'in detail'];
        
        const implicitCount = implicitMarkers.filter(marker => text.includes(marker)).length;
        const explicitCount = explicitMarkers.filter(marker => text.includes(marker)).length;
        
        if (implicitCount > explicitCount) return 'high';
        if (explicitCount > implicitCount) return 'low';
        return 'medium';
    }

    analyzeTemporalContext(metadata) {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay(); // 0 = Sunday, 6 = Saturday
        
        const context = {
            timeOfDay: this.getTimeOfDay(hour),
            isWeekend: day === 0 || day === 6,
            isBusinessHours: hour >= 9 && hour <= 17 && day >= 1 && day <= 5,
            season: this.getSeason(now)
        };

        return context;
    }

    getTimeOfDay(hour) {
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 22) return 'evening';
        return 'night';
    }

    getSeason(date) {
        const month = date.getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'fall';
        return 'winter';
    }

    calculateRiskProfile(content, metadata) {
        let riskScore = 50; // Base score
        
        const context = this.analyzeContext(content, metadata);
        
        // Platform risk adjustments
        const platformRisk = {
            'email': 10,
            'slack': 20,
            'linkedin': 30,
            'twitter': 40,
            'whatsapp': 25
        };
        
        riskScore += platformRisk[context.platform.type] || 15;
        
        // Relationship risk adjustments
        const relationshipRisk = {
            'manager_subordinate': 25,
            'client_vendor': 20,
            'peer_colleague': 10,
            'team_group': 15
        };
        
        riskScore += relationshipRisk[context.relationship] || 15;
        
        // Urgency risk
        if (context.urgency === 'high') riskScore += 15;
        if (context.urgency === 'medium') riskScore += 5;
        
        // Cultural risk (misunderstandings)
        if (context.culturalFactors.directness === 'high') riskScore += 10;
        if (context.culturalFactors.expressiveness === 'high') riskScore += 8;
        
        return {
            score: Math.min(100, riskScore),
            level: riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low',
            factors: this.getRiskFactors(context)
        };
    }

    getRiskFactors(context) {
        const factors = [];
        
        if (context.platform.type === 'twitter') {
            factors.push('Public communication platform');
        }
        
        if (context.relationship === 'manager_subordinate') {
            factors.push('Power dynamics present');
        }
        
        if (context.urgency === 'high') {
            factors.push('High urgency context');
        }
        
        if (context.culturalFactors.directness === 'high') {
            factors.push('Direct communication style');
        }
        
        if (!context.isBusinessHours) {
            factors.push('Outside business hours');
        }
        
        return factors;
    }

    generateContextRecommendations(context) {
        const recommendations = [];
        
        // Platform-specific recommendations
        switch (context.platform.type) {
            case 'twitter':
                recommendations.push('Consider public visibility of this message');
                recommendations.push('Be mindful of character limits and clarity');
                break;
            case 'slack':
                recommendations.push('Use appropriate channels for different topics');
                recommendations.push('Consider using threads for complex discussions');
                break;
            case 'email':
                recommendations.push('Use clear subject lines');
                recommendations.push('Consider time zones for recipients');
                break;
        }
        
        // Relationship recommendations
        switch (context.relationship) {
            case 'manager_subordinate':
                recommendations.push('Maintain professional boundaries');
                recommendations.push('Provide clear expectations and feedback');
                break;
            case 'client_vendor':
                recommendations.push('Focus on value and solutions');
                recommendations.push('Maintain professional documentation');
                break;
        }
        
        // Cultural recommendations
        if (context.culturalFactors.directness === 'high') {
            recommendations.push('Direct communication may need softening for some cultures');
        }
        
        if (context.culturalFactors.expressiveness === 'high') {
            recommendations.push('High emotional expression - ensure professional tone');
        }
        
        // Temporal recommendations
        if (!context.isBusinessHours) {
            recommendations.push('Consider sending during business hours for better response');
        }
        
        return recommendations.slice(0, 5); // Limit to top 5
    }

    calculateContextConfidence(context) {
        let confidence = 70; // Base confidence
        
        // Increase confidence for clear platform detection
        if (context.platform.type !== 'unknown') confidence += 10;
        
        // Increase confidence for clear relationship context
        if (context.relationship !== 'peer_colleague') confidence += 5;
        
        // Adjust based on data completeness
        if (context.temporalContext && context.culturalFactors) confidence += 10;
        
        return Math.min(95, confidence) / 100;
    }

    loadContextPatterns() {
        // Could load additional patterns from storage or API
        console.log('Context patterns loaded');
    }

    // Method to update context patterns dynamically
    updatePlatformPatterns(newPatterns) {
        this.platformPatterns = { ...this.platformPatterns, ...newPatterns };
    }

    // Method to add custom relationship contexts
    addRelationshipContext(name, attributes) {
        this.relationshipContexts[name] = attributes;
    }
}

if (typeof module !== 'undefined') {
    module.exports = ContextAnalyzer;
}

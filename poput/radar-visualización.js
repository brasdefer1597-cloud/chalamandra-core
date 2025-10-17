class RadarVisualization {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            width: 300,
            height: 300,
            levels: 5,
            maxValue: 100,
            radius: 120,
            ...options
        };
        
        this.dimensions = [
            'Clarity',
            'Warmth', 
            'Formality',
            'Actionability',
            'Trust',
            'Collaboration'
        ];
        
        this.init();
    }

    init() {
        if (!this.container) {
            console.error('Radar container not found');
            return;
        }
        
        this.setupCanvas();
        this.drawBaseRadar();
    }

    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '0 auto';
        
        this.ctx = this.canvas.getContext('2d');
        this.container.innerHTML = '';
        this.container.appendChild(this.canvas);
    }

    drawBaseRadar() {
        const { width, height, levels, radius } = this.options;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Draw concentric circles
        for (let level = 1; level <= levels; level++) {
            const levelRadius = (radius / levels) * level;
            
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, levelRadius, 0, 2 * Math.PI);
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
        
        // Draw dimension axes
        const angleStep = (2 * Math.PI) / this.dimensions.length;
        
        this.dimensions.forEach((dimension, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const endX = centerX + radius * Math.cos(angle);
            const endY = centerY + radius * Math.sin(angle);
            
            // Draw axis line
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(endX, endY);
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // Draw dimension label
            const labelX = centerX + (radius + 25) * Math.cos(angle);
            const labelY = centerY + (radius + 25) * Math.sin(angle);
            
            this.ctx.fillStyle = '#333';
            this.ctx.font = '11px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(dimension, labelX, labelY);
        });
    }

    updateData(analysisData, comparisonData = null) {
        this.drawBaseRadar();
        
        const scores = this.normalizeScores(analysisData);
        this.drawRadarShape(scores, '#ff6b35', 'Current');
        
        if (comparisonData) {
            const comparisonScores = this.normalizeScores(comparisonData);
            this.drawRadarShape(comparisonScores, '#667eea', 'Comparison');
        }
        
        this.drawLegend();
    }

    normalizeScores(analysisData) {
        return {
            Clarity: analysisData.clarity || 50,
            Warmth: analysisData.warmth || 50,
            Formality: analysisData.formality || 50,
            Actionability: analysisData.actionability || 50,
            Trust: analysisData.trust || 50,
            Collaboration: analysisData.collaboration || 50
        };
    }

    drawRadarShape(scores, color, label) {
        const { width, height, radius, maxValue } = this.options;
        const centerX = width / 2;
        const centerY = height / 2;
        const angleStep = (2 * Math.PI) / this.dimensions.length;
        
        this.ctx.beginPath();
        
        this.dimensions.forEach((dimension, i) => {
            const score = scores[dimension] || 0;
            const normalizedRadius = (score / maxValue) * radius;
            const angle = i * angleStep - Math.PI / 2;
            
            const x = centerX + normalizedRadius * Math.cos(angle);
            const y = centerY + normalizedRadius * Math.sin(angle);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        
        // Close the shape
        this.ctx.closePath();
        
        // Fill the shape
        this.ctx.fillStyle = this.hexToRgba(color, 0.3);
        this.ctx.fill();
        
        // Draw the border
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw data points
        this.dimensions.forEach((dimension, i) => {
            const score = scores[dimension] || 0;
            const normalizedRadius = (score / maxValue) * radius;
            const angle = i * angleStep - Math.PI / 2;
            
            const x = centerX + normalizedRadius * Math.cos(angle);
            const y = centerY + normalizedRadius * Math.sin(angle);
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, 2 * Math.PI);
            this.ctx.fillStyle = color;
            this.ctx.fill();
        });
        
        // Store for legend
        if (!this.legendData) this.legendData = [];
        this.legendData.push({ color, label });
    }

    drawLegend() {
        if (!this.legendData) return;
        
        const legend = document.createElement('div');
        legend.style.cssText = `
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 15px;
            font-family: Arial, sans-serif;
            font-size: 12px;
        `;
        
        this.legendData.forEach(item => {
            const legendItem = document.createElement('div');
            legendItem.style.cssText = `
                display: flex;
                align-items: center;
                gap: 5px;
            `;
            
            const colorBox = document.createElement('div');
            colorBox.style.cssText = `
                width: 12px;
                height: 12px;
                background: ${item.color};
                border-radius: 2px;
            `;
            
            const label = document.createElement('span');
            label.textContent = item.label;
            label.style.color = '#333';
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(label);
            legend.appendChild(legendItem);
        });
        
        this.container.appendChild(legend);
        this.legendData = [];
    }

    hexToRgba(hex, opacity) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    createCommunicationProfile(analysis) {
        const profileData = {
            clarity: analysis.strategic?.clarity || 60,
            warmth: analysis.emotional?.warmth || 50,
            formality: analysis.strategic?.formality || 70,
            actionability: analysis.strategic?.actionability || 65,
            trust: analysis.relational?.trust === 'high' ? 80 : 
                   analysis.relational?.trust === 'low' ? 30 : 50,
            collaboration: analysis.relational?.connection === 'strong' ? 75 :
                          analysis.relational?.connection === 'weak' ? 35 : 55
        };
        
        this.updateData(profileData);
        return this.getProfileInsights(profileData);
    }

    getProfileInsights(profileData) {
        const insights = [];
        
        if (profileData.Clarity < 40) {
            insights.push('Low clarity - consider being more specific');
        }
        if (profileData.Warmth < 40) {
            insights.push('Low warmth - could benefit from more empathetic language');
        }
        if (profileData.Trust < 40) {
            insights.push('Low trust indicators - build more transparency');
        }
        
        return insights;
    }

    exportAsImage(filename = 'communication-radar.png') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = this.canvas.toDataURL();
        link.click();
    }

    resize(newWidth, newHeight) {
        this.options.width = newWidth;
        this.options.height = newHeight;
        this.setupCanvas();
        this.drawBaseRadar();
    }
}

// Utility function to create quick radar
function createQuickRadar(containerId, analysisData, options = {}) {
    const radar = new RadarVisualization(containerId, options);
    radar.updateData(analysisData);
    return radar;
}

// Export for use in other modules
if (typeof module !== 'undefined') {
    module.exports = {
        RadarVisualization,
        createQuickRadar
    };
}

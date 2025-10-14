class RadarVisualization {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.radius = Math.min(this.width, this.height) / 2 - 20;
    
    this.axes = [
      { name: 'clarity', label: '🗣️ Clarity', color: '#4ecdc4' },
      { name: 'warmth', label: '❤️ Warmth', color: '#ff6b6b' },
      { name: 'formality', label: '🎩 Formality', color: '#45b7d1' },
      { name: 'actionability', label: '🎯 Actionability', color: '#ffa726' },
      { name: 'relationalRisk', label: '⚠️ Relational', color: '#9966cc' },
      { name: 'sarcasm', label: '🎭 Sarcasm', color: '#ff6b35' }
    ];
    
    this.currentData = null;
  }

  drawRadar(data) {
    this.currentData = data;
    this.clearCanvas();
    this.drawGrid();
    this.drawAxes();
    this.drawDataPolygon(data);
    this.drawAxisLabels();
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  drawGrid() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;
    
    // Draw concentric circles
    for (let i = 1; i <= 4; i++) {
      const radius = this.radius * (i / 4);
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, radius, 0, 2 * Math.PI);
      this.ctx.stroke();
    }
  }

  drawAxes() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    
    const angleStep = (2 * Math.PI) / this.axes.length;
    
    this.axes.forEach((axis, index) => {
      const angle = index * angleStep;
      const endX = this.centerX + Math.cos(angle) * this.radius;
      const endY = this.centerY + Math.sin(angle) * this.radius;
      
      this.ctx.beginPath();
      this.ctx.moveTo(this.centerX, this.centerY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    });
  }

  drawDataPolygon(data) {
    if (!data) return;
    
    const angleStep = (2 * Math.PI) / this.axes.length;
    this.ctx.fillStyle = 'rgba(78, 205, 196, 0.3)';
    this.ctx.strokeStyle = '#4ecdc4';
    this.ctx.lineWidth = 2;
    
    this.ctx.beginPath();
    
    this.axes.forEach((axis, index) => {
      const value = data[axis.name] || 0;
      const normalizedValue = Math.max(0, Math.min(100, value)) / 100;
      const angle = index * angleStep;
      const pointRadius = this.radius * normalizedValue;
      
      const x = this.centerX + Math.cos(angle) * pointRadius;
      const y = this.centerY + Math.sin(angle) * pointRadius;
      
      if (index === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    
    // Draw data points
    this.axes.forEach((axis, index) => {
      const value = data[axis.name] || 0;
      const normalizedValue = Math.max(0, Math.min(100, value)) / 100;
      const angle = index * angleStep;
      const pointRadius = this.radius * normalizedValue;
      
      const x = this.centerX + Math.cos(angle) * pointRadius;
      const y = this.centerY + Math.sin(angle) * pointRadius;
      
      this.ctx.fillStyle = axis.color;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 4, 0, 2 * Math.PI);
      this.ctx.fill();
    });
  }

  drawAxisLabels() {
    this.ctx.fillStyle = '#e0e0e0';
    this.ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const angleStep = (2 * Math.PI) / this.axes.length;
    const labelRadius = this.radius + 20;
    
    this.axes.forEach((axis, index) => {
      const angle = index * angleStep;
      const x = this.centerX + Math.cos(angle) * labelRadius;
      const y = this.centerY + Math.sin(angle) * labelRadius;
      
      this.ctx.fillText(axis.label, x, y);
    });
  }

  updateRiskLevel(data) {
    const riskLevel = document.getElementById('riskLevel');
    const riskBadge = riskLevel.querySelector('.risk-badge');
    
    if (!data) return;
    
    const totalRisk = (data.relationalRisk || 0) + (data.sarcasm || 0);
    const avgRisk = totalRisk / 2;
    
    riskBadge.className = 'risk-badge ';
    
    if (avgRisk < 30) {
      riskBadge.classList.add('low');
      riskBadge.textContent = 'LOW RISK';
    } else if (avgRisk < 70) {
      riskBadge.classList.add('medium');
      riskBadge.textContent = 'MEDIUM RISK';
    } else {
      riskBadge.classList.add('high');
      riskBadge.textContent = 'HIGH RISK';
    }
  }

  // Demo data for presentation
  generateDemoData(type = 'normal') {
    const demos = {
      normal: {
        clarity: 85,
        warmth: 75,
        formality: 80,
        actionability: 90,
        relationalRisk: 15,
        sarcasm: 10
      },
      risky: {
        clarity: 60,
        warmth: 40,
        formality: 85,
        actionability: 55,
        relationalRisk: 65,
        sarcasm: 80
      },
      sarcastic: {
        clarity: 70,
        warmth: 25,
        formality: 75,
        actionability: 60,
        relationalRisk: 45,
        sarcasm: 95
      }
    };
    
    return demos[type] || demos.normal;
  }

  animateTransition(newData, duration = 1000) {
    if (!this.currentData) {
      this.drawRadar(newData);
      this.updateRiskLevel(newData);
      return;
    }
    
    const startData = { ...this.currentData };
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeProgress = this.easeInOutCubic(progress);
      
      const intermediateData = {};
      this.axes.forEach(axis => {
        const startValue = startData[axis.name] || 0;
        const endValue = newData[axis.name] || 0;
        intermediateData[axis.name] = startValue + (endValue - startValue) * easeProgress;
      });
      
      this.drawRadar(intermediateData);
      this.updateRiskLevel(intermediateData);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}

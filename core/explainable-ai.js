class ExplainableAI {
  constructor() {
    this.explanations = {
      strategic: {
        power_dynamics: {
          low: "Collaborative and balanced communication",
          medium: "Some indications of hierarchy in language", 
          high: "Directive and hierarchical language detected"
        },
        hidden_agendas: {
          low: "Transparency in communicative intentions",
          medium: "Possible omissions of important context",
          high: "Signals of undeclared agendas present"
        }
      },
      emotional: {
        tone: {
          positive: "Constructive and encouraging language",
          neutral: "Standard professional communication",
          negative: "Tone that may generate resistance",
          sarcastic: "Possible sarcasm or irony detected"
        },
        subtext: {
          clear: "Message aligned with explicit content",
          ambiguous: "Possible alternative interpretations",
          contradictory: "Contradictory emotional signals"
        }
      },
      relational: {
        trust: {
          high: "Language that builds trust",
          medium: "Standard professional communication", 
          low: "Elements that may erode trust"
        },
        connection: {
          strong: "Encourages collaboration and connection",
          moderate: "Maintains professional relationships",
          weak: "May create relational distance"
        }
      }
    };
  }

  generateExplanations(analysis, originalText) {
    const explanations = {
      summary: this.generateExecutiveSummary(analysis),
      dimensions: this.explainDimensions(analysis),
      keyElements: this.identifyKeyElements(analysis, originalText),
      recommendations: this.generateActionableRecommendations(analysis)
    };

    return explanations;
  }

  generateExecutiveSummary(analysis) {
    const overallScore = this.calculateOverallScore(analysis);
    
    if (overallScore >= 80) {
      return "✅ Effective and professional communication. Good balance across all dimensions.";
    } else if (overallScore >= 60) {
      return "⚠️ Acceptable communication with improvement areas. Review specific recommendations.";
    } else {
      return "🚨 High-risk communication. Complete review recommended before sending.";
    }
  }

  explainDimensions(analysis) {
    const dimensions = {};

    if (analysis.strategic) {
      dimensions.strategic = this.explainStrategic(analysis.strategic);
    }

    if (analysis.emotional) {
      dimensions.emotional = this.explainEmotional(analysis.emotional);
    }

    if (analysis.relational) {
      dimensions.relational = this.explainRelational(analysis.relational);
    }

    return dimensions;
  }

  explainStrategic(strategic) {
    const explanations = [];
    
    if (strategic.powerDynamics) {
      explanations.push(this.explanations.strategic.power_dynamics[strategic.powerDynamics] ||
        "Power dynamics: " + strategic.powerDynamics);
    }
    
    if (strategic.hiddenAgendas) {
      explanations.push(this.explanations.strategic.hidden_agendas[strategic.hiddenAgendas] ||
        "Agendas: " + strategic.hiddenAgendas);
    }

    return explanations;
  }

  explainEmotional(emotional) {
    const explanations = [];
    
    if (emotional.tone) {
      explanations.push(this.explanations.emotional.tone[emotional.tone] ||
        "Tone: " + emotional.tone);
    }
    
    if (emotional.subtext) {
      explanations.push(this.explanations.emotional.subtext[emotional.subtext] ||
        "Subtext: " + emotional.subtext);
    }

    if (emotional.score !== undefined) {
      if (emotional.score < 30) {
        explanations.push("Predominantly negative tone");
      } else if (emotional.score > 70) {
        explanations.push("Predominantly positive tone");
      }
    }

    return explanations;
  }

  explainRelational(relational) {
    const explanations = [];
    
    if (relational.trust) {
      explanations.push(this.explanations.relational.trust[relational.trust] ||
        "Trust: " + relational.trust);
    }
    
    if (relational.connection) {
      explanations.push(this.explanations.relational.connection[relational.connection] ||
        "Connection: " + relational.connection);
    }

    return explanations;
  }

  identifyKeyElements(analysis, originalText) {
    const elements = [];
    
    const riskWords = ['should', 'need to', 'incorrect', 'error', 'wrong', 'failed', 'problem'];
    const positiveWords = ['thanks', 'appreciate', 'excellent', 'collaboration', 'great', 'teamwork'];
    const passiveAggressiveWords = ['per my last email', 'as I mentioned', 'you should know', 'hopefully'];
    
    riskWords.forEach(word => {
      if (originalText.toLowerCase().includes(word)) {
        elements.push({
          type: 'risk',
          element: word,
          impact: 'May be perceived as authoritarian or critical',
          suggestion: 'Consider more collaborative language'
        });
      }
    });
    
    positiveWords.forEach(word => {
      if (originalText.toLowerCase().includes(word)) {
        elements.push({
          type: 'positive',
          element: word,
          impact: 'Contributes to constructive tone',
          suggestion: 'Maintain this type of language'
        });
      }
    });

    passiveAggressiveWords.forEach(word => {
      if (originalText.toLowerCase().includes(word)) {
        elements.push({
          type: 'passive_aggressive',
          element: word,
          impact: 'Can create tension and defensiveness',
          suggestion: 'Rephrase to be more direct and collaborative'
        });
      }
    });

    return elements;
  }

  generateActionableRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.strategic?.powerDynamics === 'high') {
      recommendations.push("Consider more collaborative and less directive language");
    }
    
    if (analysis.strategic?.hiddenAgendas === 'high') {
      recommendations.push("Be more explicit about intentions and expectations");
    }
    
    if (analysis.emotional?.tone === 'negative') {
      recommendations.push("Rephrase to use more constructive language");
    }
    
    if (analysis.emotional?.subtext === 'contradictory') {
      recommendations.push("Aline explicit message with emotional signals");
    }
    
    if (analysis.relational?.trust === 'low') {
      recommendations.push("Include elements that build trust and transparency");
    }
    
    if (analysis.relational?.connection === 'weak') {
      recommendations.push("Encourage connection and collaboration language");
    }

    if (analysis.sarcasmScore > 70) {
      recommendations.push("Rephrase to eliminate sarcasm - use direct communication");
    }

    return recommendations;
  }

  calculateOverallScore(analysis) {
    let score = 50;
    
    if (analysis.emotional?.score) {
      score += (analysis.emotional.score - 50) * 0.3;
    }
    
    if (analysis.strategic?.powerDynamics === 'high') score -= 15;
    if (analysis.strategic?.agendasOcultas === 'high') score -= 20;
    
    if (analysis.relational?.trust === 'high') score += 10;
    if (analysis.relational?.trust === 'low') score -= 15;
    
    if (analysis.sarcasmScore > 70) score -= 25;
    
    return Math.max(0, Math.min(100, score));
  }

  createVisualizationData(analysis, originalText) {
    const explanations = this.generateExplanations(analysis, originalText);
    
    return {
      summary: explanations.summary,
      alertas: explanations.recomendaciones.filter(rec => 
        rec.includes('rephrase') || rec.includes('eliminate') || rec.includes('high-risk')
      ),
      elementosDestacados: explanations.elementosClave.slice(0, 3),
      puntuacion: this.calcularPuntuacionGeneral(analysis),
      dimensiones: {
        estrategico: analysis.estrategico ? 70 : 50,
        emocional: analysis.emocional?.score || 50,
        relacional: analysis.relacional ? 65 : 50
      }
    };
  }

  generarReporteEjecutivo(analysis, textoOriginal) {
    const explicaciones = this.generarExplicaciones(analysis, textoOriginal);
    const puntuacion = this.calcularPuntuacionGeneral(analysis);
    
    return {
      titulo: "Reporte de Análisis de Comunicación",
      puntuacionGeneral: puntuacion,
      nivelRiesgo: puntuacion >= 80 ? "Bajo" : puntuacion >= 60 ? "Medio" : "Alto",
      resumen: explicaciones.resumen,
      recomendacionesPrioritarias: explicaciones.recomendaciones.slice(0, 3),
      elementosClave: explicaciones.elementosClave.filter(e => e.tipo === 'risk').slice(0, 2)
    };
  }
}

if (typeof module !== 'undefined') {
  module.exports = ExplainableAI;
}

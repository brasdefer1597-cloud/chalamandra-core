class SarcasmDetector {
  constructor() {
    this.patronesSarcasmo = {
      textual: [
        'excesiva_positividad',
        'hiperbole_inesperada', 
        'contradiccion_contextual',
        'lenguaje_pasivo_agresivo'
      ]
    };
  }

  async detectarSarcasmo(texto, contextoVisual = null) {
    const analisisTextual = this.analizarPatronesTextuales(texto);
    const analisisVisual = contextoVisual ? 
      await this.analizarContextoVisual(contextoVisual) : 
      { score: 0, patrones: [] };

    return this.combinarAnalisis(analisisTextual, analisisVisual);
  }

  analizarPatronesTextuales(texto) {
    const patronesDetectados = [];
    let score = 0;

    if (this.tieneExcesivaPositividad(texto)) {
      patronesDetectados.push('excesiva_positividad');
      score += 25;
    }

    if (this.tieneHiperbole(texto)) {
      patronesDetectados.push('hiperbole_inesperada');
      score += 30;
    }

    if (this.tieneContradicciones(texto)) {
      patronesDetectados.push('contradiccion_contextual');
      score += 35;
    }

    if (this.tieneLenguajePasivoAgresivo(texto)) {
      patronesDetectados.push('lenguaje_pasivo_agresivo');
      score += 40;
    }

    return {
      score: Math.min(score, 100),
      patrones: patronesDetectados,
      confianza: this.calcularConfianza(patronesDetectados)
    };
  }

  async analizarContextoVisual(contextoVisual) {
    try {
      if (typeof ai !== 'undefined' && ai.prompt) {
        const analisis = await ai.prompt({
          text: `Analizar contexto visual: ${JSON.stringify(contextoVisual)}`,
          instructions: "Detectar incongruencias entre texto y elementos visuales"
        });
        return this.procesarAnalisisVisual(analisis);
      }
    } catch (error) {
      console.warn('Chrome AI no disponible para análisis visual');
    }

    return this.analisisVisualHeuristico(contextoVisual);
  }

  analisisVisualHeuristico(contextoVisual) {
    let score = 0;
    const patrones = [];

    if (contextoVisual.emojis) {
      contextoVisual.emojis.forEach(emoji => {
        if (this.esEmojiIncongruente(emoji, contextoVisual.texto)) {
          patrones.push('emoji_incongruente');
          score += 20;
        }
      });
    }

    return {
      score: Math.min(score, 100),
      patrones,
      confianza: 0.6
    };
  }

  combinarAnalisis(textual, visual) {
    const scoreTotal = (textual.score * 0.7) + (visual.score * 0.3);
    const patronesTotales = [...textual.patrones, ...visual.patrones];
    
    return {
      scoreSarcasmo: Math.min(scoreTotal, 100),
      patronesDetectados: [...new Set(patronesTotales)],
      confianzaTotal: (textual.confianza + visual.confianza) / 2,
      detalles: {
        textual,
        visual
      }
    };
  }

  tieneExcesivaPositividad(texto) {
    const palabrasPositivas = ['excelente', 'maravilloso', 'increíble', 'perfecto', 'fantástico'];
    const conteo = palabrasPositivas.filter(palabra => 
      texto.toLowerCase().includes(palabra)
    ).length;
    return conteo >= 3;
  }

  tieneHiperbole(texto) {
    const hiperboles = ['el mejor', 'el peor', 'nunca', 'siempre', 'completamente'];
    return hiperboles.some(hiperbole => texto.toLowerCase().includes(hiperbole));
  }

  tieneContradicciones(texto) {
    const contradicciones = [
      ['pero', 'excelente'],
      ['aunque', 'perfecto'],
      ['sin embargo', 'genial']
    ];
    return contradicciones.some(([contrast, positive]) => 
      texto.includes(contrast) && texto.includes(positive)
    );
  }

  tieneLenguajePasivoAgresivo(texto) {
    const patronesPA = [
      'según mi último correo',
      'como ya mencioné',
      'deberías saber',
      'espero que esto quede claro'
    ];
    return patronesPA.some(patron => texto.toLowerCase().includes(patron));
  }

  esEmojiIncongruente(emoji, texto) {
    const emojisPositivos = ['😊', '👍', '🎉', '❤️', '⭐'];
    const emojisNegativos = ['😠', '👎', '💀', '🔥', '💣'];
    
    const textoEsNegativo = this.textoTieneSentimientoNegativo(texto);
    const emojiEsPositivo = emojisPositivos.includes(emoji);
    
    return textoEsNegativo && emojiEsPositivo;
  }

  textoTieneSentimientoNegativo(texto) {
    const palabrasNegativas = ['problema', 'error', 'mal', 'incorrecto', 'falla'];
    return palabrasNegativas.some(palabra => texto.toLowerCase().includes(palabra));
  }

  calcularConfianza(patrones) {
    return patrones.length > 0 ? 0.7 + (patrones.length * 0.1) : 0.3;
  }

  procesarAnalisisVisual(analisis) {
    try {
      if (typeof analisis === 'string') {
        return {
          score: 50,
          patrones: ['analisis_visual_basico'],
          confianza: 0.7
        };
      }
      return analisis;
    } catch (error) {
      return this.analisisVisualHeuristico({});
    }
  }
}

class CholamandraEngine {
  constructor() {
    this.sarcasmDetector = new SarcasmDetector();
    this.multimodalAnalyzer = new MultimodalAnalyzer();
    this.explainableAI = new ExplainableAI();
  }

  async analizarComunicacion(contenido, modo = 'quick') {
    try {
      console.log('🦎 Chalamandra analizando comunicación...', { modo });
      
      const analisisBase = await this.analisisRapidoLocal(contenido);
      
      if (modo === 'deep' || modo === 'multimodal') {
        const analisisAvanzado = await this.analisisProfundoHibrido(contenido, analisisBase);
        return this.sintetizarResultados(analisisBase, analisisAvanzado);
      }
      
      return analisisBase;
      
    } catch (error) {
      console.error('Error en análisis:', error);
      return this.fallbackAnalysis(contenido);
    }
  }

  async analisisRapidoLocal(contenido) {
    if (typeof ai !== 'undefined' && ai.prompt) {
      const analisis = await ai.prompt({
        text: contenido.text,
        instructions: `
          Analizar comunicación profesional en dimensiones:
          1. ESTRATÉGICA: dinámicas poder, agendas ocultas, negociación
          2. EMOCIONAL: tono, subtexto, factores psicológicos
          3. RELACIONAL: confianza, conexiones, señales sociales
          
          Retornar JSON estructurado con scores 0-100.
        `
      });
      return this.procesarRespuestaIA(analisis);
    }
    
    return this.analisisHeuristico(contenido);
  }

  async analisisProfundoHibrido(contenido, analisisBase) {
    const analisisMultimodal = await this.multimodalAnalyzer.detectarIncongruencia(
      contenido.text,
      contenido.imagenes
    );
    
    const explicaciones = await this.explainableAI.generarExplicaciones(
      analisisBase,
      contenido.text
    );
    
    return {
      ...analisisMultimodal,
      explicaciones,
      modo: 'hibrido',
      timestamp: new Date().toISOString()
    };
  }

  analisisHeuristico(contenido) {
    return {
      estrategico: {
        poderDinamicas: 'balanceado',
        agendasOcultas: 'no detectadas',
        negociacion: 'contexto estandar'
      },
      emocional: {
        tono: 'profesional',
        score: 75,
        subtexto: 'comunicacion directa'
      },
      relacional: {
        confianza: 'nivel profesional',
        conexiones: 'contexto colaborativo'
      },
      modo: 'fallback',
      confidence: 0.7
    };
  }

  sintetizarResultados(...analisis) {
    return {
      perfilComunicacion: this.crearPerfilRadar(analisis),
      riesgos: this.calcularRiesgos(analisis),
      recomendaciones: this.generarRecomendaciones(analisis),
      explicaciones: this.combinarExplicaciones(analisis)
    };
  }

  crearPerfilRadar(analisis) {
    return {
      claridad: this.promedio(analisis, 'claridad') || 85,
      calidez: this.promedio(analisis, 'calidez') || 70,
      formalidad: this.promedio(analisis, 'formalidad') || 80,
      accionabilidad: this.promedio(analisis, 'accionabilidad') || 75,
      riesgoRelacional: this.promedio(analisis, 'riesgoRelacional') || 20,
      sarcasmo: this.promedio(analisis, 'sarcasmo') || 15
    };
  }

  promedio(analisis, clave) {
    const valores = analisis.map(a => a[clave]).filter(v => v != null);
    return valores.length ? valores.reduce((a, b) => a + b) / valores.length : null;
  }

  procesarRespuestaIA(respuesta) {
    try {
      if (typeof respuesta === 'string') {
        const jsonMatch = respuesta.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
      return typeof respuesta === 'object' ? respuesta : this.analisisHeuristico();
    } catch (error) {
      return this.analisisHeuristico();
    }
  }
}

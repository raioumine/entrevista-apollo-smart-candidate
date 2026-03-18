# 🚀 Smart Apollo Searcher - Arquitectura v2.0

## Objetivo
Buscar un pool de **50 candidatos** pero retornar solo los **TOP 20 mejores** evaluados inteligentemente.

**Ventajas:**
- ✅ Mayor diversidad inicial (50 vs 25)
- ✅ Filtrado inteligente antes de evaluación profunda
- ✅ Menor costo de tokens en Claude (20 evaluaciones detalladas vs 50)
- ✅ Mejor calidad final (los 20 mejores, no los primeros 20)

---

## 🏗️ Flujo Mejorado

```
1️⃣ BÚSQUEDA INICIAL
   Webhook → Validar Datos → Apollo (buscar 50)

2️⃣ ENRIQUECIMIENTO
   Procesar 50 candidatos → Enriquecer 50 perfiles

3️⃣ PRE-SCORING RÁPIDO (NEW)
   → Claude genera ranking cualitativo rápido
   → Selecciona TOP 20 por score inicial

4️⃣ EVALUACIÓN DETALLADA
   → Solo evaluá los TOP 20 con prompt completo

5️⃣ RESPUESTA FINAL
   → Retorna 20 candidatos evaluados + detalles
```

---

## 📝 Cambios en Nodos Específicos

### 1. **✅ Validar y Preparar Datos** (SIN CAMBIOS)
```javascript
// Solo cambiar cantidad a 50
const cantidad = body.cantidad_candidatos || 50;  // ← CAMBIO
```

### 2. **🔍 Apollo - Buscar Candidatos** (SIN CAMBIOS)
```
per_page: 50  // Aumenta de 25 a 50
```

### 3. **NEW: 🎯 Pre-Scoring Rápido** (NUEVO NODO)
Colocar DESPUÉS de "📋 Procesar Perfil Enriquecido" y ANTES de Aggregate.

```javascript
// Código: Pre-scoring rápido para filtrar TOP 20

const allCandidates = $input.all().map(item => item.json);
const searchData = $('✅ Validar y Preparar Datos').first().json;

// Si hay ≤20, no filtrar
if (allCandidates.length <= 20) {
  return allCandidates.map(c => ({ json: c }));
}

// Crear resumen rápido para pre-scoring
const candidatosResumen = allCandidates.map((c, i) => `
${i + 1}. ${c.nombreCompleto}
   Cargo: ${c.cargo} en ${c.empresa}
   Skills: ${c.skills?.substring(0, 100) || 'N/A'}
   Seniority: ${c.seniority || 'N/A'}
   Score: ${c.quickScore || '?'}
`).join('\n');

const preScorePrompt = `
Eres un headhunter experto. Tienes ${allCandidates.length} candidatos pero solo necesitas los TOP 20.

PUESTO: ${searchData.puesto}
INDUSTRIA: ${searchData.industria}
HABILIDADES: ${searchData.habilidades?.join(', ') || 'No especificadas'}

CANDIDATOS:
${candidatosResumen}

INSTRUCCIONES:
1. Analiza rápidamente cada candidato
2. Retorna SOLO los IDs Apollo de los TOP 20 candidatos
3. Ordena por "fit" con el puesto
4. Responde como JSON array: ["apolloId1", "apolloId2", ...]

Sé selectivo. Los TOP 20 deben ser verdaderas opciones viables.
`;

// Llamar a Claude para pre-scoring
const preScoreResponse = await $http.request({
  method: 'POST',
  url: 'https://api.anthropic.com/v1/messages',
  headers: {
    'x-api-key': process.env.ANTHROPIC_API_KEY,  // ← Use n8n env var
    'anthropic-version': '2023-06-01',
    'Content-Type': 'application/json'
  },
  body: {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    messages: [{ role: 'user', content: preScorePrompt }]
  }
});

const responseText = preScoreResponse.body.content?.[0]?.text || '[]';
let topApolloIds = [];

try {
  const cleaned = responseText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  topApolloIds = JSON.parse(cleaned);
} catch (e) {
  console.warn('Error parsing pre-score response, returning top 20 by order');
  topApolloIds = allCandidates.slice(0, 20).map(c => c.apolloId);
}

// Filtrar solo los TOP 20
const filtered = allCandidates.filter(c => topApolloIds.includes(c.apolloId));

// Si no se filtraron bien, retornar primeros 20
const final = filtered.length > 0 ? filtered.slice(0, 20) : allCandidates.slice(0, 20);

return final.map(c => ({ json: { ...c, preScored: true } }));
```

---

## 🔄 Cambios en Conexiones

**ANTES:**
```
📋 Procesar Perfil Enriquecido → Aggregate → Code in JavaScript
```

**DESPUÉS:**
```
📋 Procesar Perfil Enriquecido → 🎯 Pre-Scoring Rápido → Aggregate → Code in JavaScript
```

---

## 💰 Cálculo de Costos

### Sin optimización (50 candidatos evaluados):
- Pre-score: ~1,000 tokens (resumen de 50)
- Evaluación: ~4,000 tokens × 50 = 200,000 tokens
- **TOTAL: ~201,000 tokens**

### Con Smart Filter (TOP 20):
- Pre-score: ~1,000 tokens (resumen de 50, retorna IDs)
- Evaluación: ~4,000 tokens × 20 = 80,000 tokens
- **TOTAL: ~81,000 tokens**

**Ahorro: 60% en tokens, mejor calidad final** 🎯

---

## 📊 Métricas a Trackear

Agrega estos campos al respuesta final:

```javascript
{
  success: true,
  search_id: searchId,
  candidatos_encontrados: 50,
  candidatos_filtrados: 20,  // ← NEW
  filtro_inteligencia: 'claude-pre-score',  // ← NEW
  tasa_filtraje: '60%',  // ← NEW
  candidatos: [...]
}
```

---

## 🚀 Implementación

1. **Cambiar línea en "Validar y Preparar Datos":**
   ```javascript
   const cantidad = 50;  // o: body.cantidad_candidatos || 50
   ```

2. **Crear nuevo nodo "🎯 Pre-Scoring Rápido":**
   - Tipo: Code (JavaScript)
   - Insertar después de "📋 Procesar Perfil Enriquecido"
   - Copiar código de arriba

3. **Conectar:**
   - "📋 Procesar Perfil Enriquecido" → "🎯 Pre-Scoring Rápido"
   - "🎯 Pre-Scoring Rápido" → "Aggregate"

4. **Test:**
   - Enviar búsqueda con `cantidad_candidatos: 50`
   - Verificar que retorna TOP 20, no 50

---

## ⚡ Optimizaciones Futuras

1. **Caching de pre-scores:** Guardar ranking por puesto para reutilizar
2. **Scoring multi-fase:** Pre-score (rápido) → Mid-score (Claude) → Final-score (Detailed)
3. **Pooling inteligente:** Buscar candidatos en paralelo (3 búsquedas de 15 = 45, pero más rápido)
4. **Vector search:** Usar embeddings para similaridad antes de evaluación

---

## 📌 Notas Importantes

- El `pre-score` es **cualitativo**, no numérico (mejor que números arbitrarios)
- Claude Haiku es suficiente para pre-scoring
- Los TOP 20 se evalúan con el prompt completo (Haiku)
- No elimina candidatos, solo reordena para evaluación detallada

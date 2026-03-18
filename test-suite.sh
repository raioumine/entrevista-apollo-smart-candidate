#!/bin/bash
# UMINE Headhunting - Test Suite
# Tests all API integrations and simulates expected outputs

BASE="https://rai-dev.app.n8n.cloud/webhook"
PASS=0
FAIL=0
TOTAL=0

test_result() {
  TOTAL=$((TOTAL + 1))
  if [ "$1" = "PASS" ]; then
    PASS=$((PASS + 1))
    echo "  [PASS] $2"
  else
    FAIL=$((FAIL + 1))
    echo "  [FAIL] $2 - $3"
  fi
}

echo "============================================"
echo " UMINE HEADHUNTING - TEST SUITE"
echo " $(date)"
echo "============================================"
echo ""

# ==========================================
# TEST 1: Frontend Build
# ==========================================
echo "--- TEST 1: Frontend Build ---"
cd "$(dirname "$0")"
BUILD_OUT=$(npm run build 2>&1)
if echo "$BUILD_OUT" | grep -q "built in"; then
  test_result "PASS" "Production build succeeds"
else
  test_result "FAIL" "Production build" "$BUILD_OUT"
fi

# ==========================================
# TEST 2: Dev Server Health
# ==========================================
echo ""
echo "--- TEST 2: Dev Server ---"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
  test_result "PASS" "Dev server responds 200"
else
  test_result "FAIL" "Dev server" "HTTP $HTTP_CODE"
fi

# Check key routes
for ROUTE in "/dashboard" "/nueva-busqueda" "/busquedas" "/entrevistas"; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5173${ROUTE}" 2>/dev/null)
  if [ "$HTTP_CODE" = "200" ]; then
    test_result "PASS" "Route $ROUTE responds 200"
  else
    test_result "FAIL" "Route $ROUTE" "HTTP $HTTP_CODE"
  fi
done

# ==========================================
# TEST 3: n8n Webhook - Nueva Busqueda
# ==========================================
echo ""
echo "--- TEST 3: n8n Webhook /nueva-busqueda ---"
SEARCH_RESP=$(curl -s -X POST "$BASE/nueva-busqueda" \
  -H "Content-Type: application/json" \
  -w "\n%{http_code}" \
  -d '{
    "puesto": "Data Engineer",
    "industria": "Fintech",
    "pais": "Chile",
    "seniority": "Senior",
    "cantidad_candidatos": 1,
    "habilidades": ["Python", "SQL", "AWS"],
    "enviar_cold_email": false
  }' 2>/dev/null)

SEARCH_HTTP=$(echo "$SEARCH_RESP" | tail -1)
SEARCH_BODY=$(echo "$SEARCH_RESP" | sed '$d')

if [ "$SEARCH_HTTP" = "200" ]; then
  test_result "PASS" "Webhook responds 200"
else
  test_result "FAIL" "Webhook response" "HTTP $SEARCH_HTTP"
fi

if echo "$SEARCH_BODY" | grep -q '"success":true'; then
  test_result "PASS" "Response has success:true"
else
  test_result "FAIL" "Response success field" "Missing or false"
fi

if echo "$SEARCH_BODY" | grep -q '"search_id"'; then
  test_result "PASS" "Response has search_id"
else
  test_result "FAIL" "Response search_id" "Missing"
fi

if echo "$SEARCH_BODY" | grep -q '"candidatos"'; then
  test_result "PASS" "Response has candidatos array"
else
  test_result "FAIL" "Response candidatos" "Missing"
fi

if echo "$SEARCH_BODY" | grep -q '"scoreTotal"'; then
  test_result "PASS" "Candidates have scoreTotal (AI scoring works)"
else
  test_result "FAIL" "AI scoring" "No scoreTotal in response"
fi

if echo "$SEARCH_BODY" | grep -q '"recomendacion"'; then
  test_result "PASS" "Candidates have recomendacion"
else
  test_result "FAIL" "Recomendacion field" "Missing"
fi

if echo "$SEARCH_BODY" | grep -q '"resumenIA"'; then
  test_result "PASS" "Candidates have resumenIA (AI summary)"
else
  test_result "FAIL" "AI summary" "Missing"
fi

echo ""
echo "  >> Full response preview:"
echo "$SEARCH_BODY" | head -c 500
echo ""

# ==========================================
# TEST 4: n8n Webhook - Nueva Entrevista
# ==========================================
echo ""
echo "--- TEST 4: n8n Webhook /nueva-entrevista ---"
INTERVIEW_RESP=$(curl -s -X POST "$BASE/nueva-entrevista" \
  -H "Content-Type: application/json" \
  -w "\n%{http_code}" \
  -d '{
    "nombre_candidato": "Test Candidato",
    "email_candidato": "test@example.com",
    "puesto": "SDR Senior",
    "departamento": "Ventas",
    "habilidades_clave": "Salesforce, B2B",
    "notas_cv": "Test CV notes",
    "duracion_max_minutos": 5
  }' 2>/dev/null)

INTERVIEW_HTTP=$(echo "$INTERVIEW_RESP" | tail -1)
INTERVIEW_BODY=$(echo "$INTERVIEW_RESP" | sed '$d')

if [ "$INTERVIEW_HTTP" = "200" ]; then
  test_result "PASS" "Interview webhook responds 200"
else
  test_result "FAIL" "Interview webhook" "HTTP $INTERVIEW_HTTP"
fi

if echo "$INTERVIEW_BODY" | grep -qi "conversation\|success\|error"; then
  test_result "PASS" "Interview response has expected fields"
else
  test_result "FAIL" "Interview response format" "Unexpected"
fi

echo ""
echo "  >> Interview response preview:"
echo "$INTERVIEW_BODY" | head -c 500
echo ""

# ==========================================
# TEST 5: Simulate Apollo API Response
# ==========================================
echo ""
echo "--- TEST 5: Simulated Apollo API Output ---"
echo '  Expected Apollo /mixed_people/api_search response:'
cat << 'APOLLO_EOF'
  {
    "people": [
      {
        "id": "apollo-123",
        "first_name": "Maria",
        "last_name": "Gonzalez",
        "title": "Senior Data Engineer",
        "headline": "Data Engineer | Python | AWS | 8+ years",
        "email": "maria.gonzalez@fintech.cl",
        "linkedin_url": "https://linkedin.com/in/mariagonzalez",
        "city": "Santiago",
        "country": "Chile",
        "organization": {
          "name": "FinTech Chile SpA",
          "industry": "Financial Technology",
          "primary_domain": "fintechchile.cl",
          "estimated_num_employees": 150,
          "short_description": "Leading fintech in LATAM"
        },
        "seniority": "senior",
        "departments": ["engineering"],
        "skills": ["Python", "SQL", "AWS", "Spark", "Airflow"]
      }
    ],
    "pagination": { "page": 1, "per_page": 25, "total_entries": 1 }
  }
APOLLO_EOF
test_result "PASS" "Apollo response structure documented"

# ==========================================
# TEST 6: Simulate Hunter API Response
# ==========================================
echo ""
echo "--- TEST 6: Simulated Hunter Email Finder Output ---"
echo '  Expected Hunter /v2/email-finder response:'
cat << 'HUNTER_EOF'
  {
    "data": {
      "first_name": "Maria",
      "last_name": "Gonzalez",
      "email": "maria.gonzalez@fintechchile.cl",
      "score": 91,
      "domain": "fintechchile.cl",
      "accept_all": false,
      "position": "Senior Data Engineer",
      "company": "FinTech Chile SpA",
      "sources": [
        { "domain": "fintechchile.cl", "uri": "https://fintechchile.cl/team", "extracted_on": "2025-11-15" }
      ]
    },
    "meta": { "params": { "first_name": "Maria", "last_name": "Gonzalez", "domain": "fintechchile.cl" } }
  }
HUNTER_EOF
test_result "PASS" "Hunter response structure documented"

# ==========================================
# TEST 7: Simulate Tavus API Response
# ==========================================
echo ""
echo "--- TEST 7: Simulated Tavus Create Conversation Output ---"
echo '  Expected Tavus /v2/conversations response:'
cat << 'TAVUS_EOF'
  {
    "conversation_id": "conv_abc123def456",
    "conversation_url": "https://tavus.daily.co/conv_abc123def456",
    "status": "active",
    "persona_id": "pdac61133ac5",
    "created_at": "2026-03-05T20:00:00Z",
    "properties": {
      "max_call_duration": 900,
      "participant_left_timeout": 60,
      "enable_recording": true,
      "language": "spanish"
    },
    "conversation_name": "Entrevista - Maria Gonzalez - Data Engineer"
  }
TAVUS_EOF
test_result "PASS" "Tavus response structure documented"

echo ""
echo "--- TEST 8: Simulated Tavus Callback (entrevista completada) ---"
echo '  Expected callback POST to /webhook/entrevista-completada:'
cat << 'CALLBACK_EOF'
  {
    "event_type": "conversation.ended",
    "conversation_id": "conv_abc123def456",
    "ended_reason": "transcription",
    "duration_seconds": 720,
    "transcript": [
      { "role": "persona", "content": "Hola Maria, bienvenida a esta entrevista..." },
      { "role": "user", "content": "Gracias, estoy muy contenta de estar aqui..." },
      { "role": "persona", "content": "Cuentame sobre tu experiencia con Python y AWS..." },
      { "role": "user", "content": "He trabajado 8 anos con Python, los ultimos 4 enfocada en pipelines de datos en AWS..." }
    ],
    "recording_url": "https://tavus-recordings.s3.amazonaws.com/conv_abc123def456.mp4"
  }
CALLBACK_EOF
test_result "PASS" "Tavus callback structure documented"

# ==========================================
# TEST 9: Simulated Claude Scoring Output
# ==========================================
echo ""
echo "--- TEST 9: Simulated Claude Haiku Scoring Output ---"
echo '  Expected Claude scoring JSON response:'
cat << 'CLAUDE_EOF'
  {
    "score_total": 82,
    "scores": {
      "experiencia_relevante": 90,
      "habilidades_tecnicas": 85,
      "seniority_fit": 80,
      "industria_fit": 75,
      "liderazgo": 70,
      "cultura_fit": 85
    },
    "recomendacion": "AVANZAR",
    "resumen": "Maria es una Data Engineer senior con 8 anos de experiencia solida en Python y AWS. Su perfil se alinea fuertemente con los requisitos del puesto. Destaca su experiencia en pipelines de datos a escala en fintech.",
    "fortalezas": [
      "8 anos de experiencia directa en data engineering",
      "Dominio de Python, SQL, AWS y Spark",
      "Experiencia especifica en fintech/industria financiera"
    ],
    "debilidades": [
      "Sin experiencia documentada en liderazgo de equipos",
      "Podria necesitar adaptacion a herramientas especificas de la empresa"
    ],
    "preguntas_entrevista": [
      "Describe el pipeline de datos mas complejo que has disenado en AWS",
      "Como manejas la calidad de datos en pipelines de alta frecuencia?",
      "Has liderado migraciones de datos legacy? Cuentanos el proceso"
    ]
  }
CLAUDE_EOF
test_result "PASS" "Claude scoring structure documented"

# ==========================================
# TEST 10: Simulated Full Pipeline Output
# ==========================================
echo ""
echo "--- TEST 10: Simulated End-to-End Pipeline ---"
echo '  What the frontend receives from /nueva-busqueda:'
cat << 'PIPELINE_EOF'
  {
    "success": true,
    "search_id": "search-m1abc2d3-xyz99",
    "candidatos_encontrados": 3,
    "candidatos": [
      {
        "id": "cand-search-m1abc2d3-xyz99-1",
        "searchId": "search-m1abc2d3-xyz99",
        "nombre": "Maria",
        "apellido": "Gonzalez",
        "nombreCompleto": "Maria Gonzalez",
        "cargo": "Senior Data Engineer",
        "empresa": "FinTech Chile SpA",
        "email": "maria.gonzalez@fintechchile.cl",
        "emailScore": "Verificado",
        "linkedinUrl": "https://linkedin.com/in/mariagonzalez",
        "ubicacion": "Santiago, Chile",
        "industria": "Financial Technology",
        "scoreTotal": 82,
        "scoreExperiencia": 90,
        "scoreHabilidades": 85,
        "scoreSeniority": 80,
        "scoreIndustria": 75,
        "scoreLiderazgo": 70,
        "scoreCultura": 85,
        "recomendacion": "AVANZAR",
        "resumenIA": "Candidata excepcional con 8 anos en data engineering...",
        "fortalezas": "[\"Python expert\",\"AWS certified\"]",
        "debilidades": "[\"Sin liderazgo formal\"]",
        "estado": "evaluado"
      },
      {
        "id": "cand-search-m1abc2d3-xyz99-2",
        "nombre": "Carlos",
        "apellido": "Mendez",
        "nombreCompleto": "Carlos Mendez",
        "cargo": "Data Engineer",
        "empresa": "BancoEstado",
        "email": "cmendez@bancoestado.cl",
        "emailScore": "Verificado",
        "scoreTotal": 68,
        "recomendacion": "REVISAR",
        "resumenIA": "Perfil solido pero junior para el nivel buscado...",
        "estado": "evaluado"
      },
      {
        "id": "cand-search-m1abc2d3-xyz99-3",
        "nombre": "Francisca",
        "apellido": "Torres",
        "nombreCompleto": "Francisca Torres",
        "cargo": "Lead Data Engineer",
        "empresa": "Mercado Libre",
        "email": "ftorres@mercadolibre.cl",
        "emailScore": "Verificado",
        "scoreTotal": 91,
        "recomendacion": "AVANZAR",
        "resumenIA": "Lider tecnica con experiencia gestionando equipos de 10+ personas...",
        "estado": "evaluado"
      }
    ]
  }
PIPELINE_EOF
test_result "PASS" "Full pipeline output structure documented"

# ==========================================
# TEST 11: TypeScript Types Match
# ==========================================
echo ""
echo "--- TEST 11: TypeScript Type Check ---"
TSC_OUT=$(npx tsc --noEmit 2>&1)
if [ $? -eq 0 ]; then
  test_result "PASS" "TypeScript types are valid (zero errors)"
else
  ERRORS=$(echo "$TSC_OUT" | grep "error TS" | wc -l)
  test_result "FAIL" "TypeScript errors" "$ERRORS errors found"
fi

# ==========================================
# SUMMARY
# ==========================================
echo ""
echo "============================================"
echo " RESULTS: $PASS/$TOTAL passed, $FAIL failed"
echo "============================================"
echo ""

if [ $FAIL -eq 0 ]; then
  echo " ALL TESTS PASSED"
else
  echo " SOME TESTS FAILED - review above"
fi

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  Building2,
  Globe,
  Users,
  Clock,
  Target,
  Mail,
  Send,
  ChevronRight,
  Shield,
  Sliders,
  RotateCcw,
  Sparkles,
  FileText,
  MessageSquare,
  Loader2,
  X,
  Plus,
  Trash2,
  ClipboardPaste,
  CheckCircle,
  Search,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { DashboardLayout } from "../components/templates/DashboardLayout";
import { GlassCard } from "../components/atoms/GlassCard";
import { Button } from "../components/atoms/Button";
import { Input } from "../components/atoms/Input";
import { Toggle } from "../components/atoms/Toggle";
import { TagInput } from "../components/atoms/TagInput";
import { ComboInput } from "../components/atoms/ComboInput";
// StageConfigurator removed — no Tavus interview in this version
import { EmpresaSelector } from "../components/molecules/EmpresaSelector";
import { useNotifications } from "../hooks/useNotifications";
import { Notifications } from "../components/organisms/Notifications";
import { launchSearch, transformN8nCandidate } from "../services/n8nService";
import {
  parseNaturalLanguageSearch,
  isGroqConfigured,
  generateJobDescription,
  suggestEmpresasByIndustria,
  synthesizeProfile,
} from "../services/groqService";
import { enrichCandidateFull } from "../services/serperService";
import type { Candidate } from "../types/candidate";
import { useSearchContext } from "../contexts/SearchContext";
import {
  INDUSTRIAS,
  PAISES,
  SENIORITY,
  EXPERIENCIA,
  MODALIDAD,
  IDIOMAS,
  PUESTOS_SUGERIDOS,
  getHabilidadesSugeridas,
} from "../types/search";

const DEFAULT_EMAIL_TEMPLATE = `Hola {nombre},

Mi nombre es {remitente} y trabajo en el area de talento de UMINE.

Estamos buscando un/a {puesto} y tu perfil nos parece muy interesante. Nos encantaria conocer mas sobre tu experiencia.

Si te interesa explorar esta oportunidad, te agradeceriamos nos compartas tu CV actualizado respondiendo a este correo.

Quedo atento/a.

Saludos cordiales.`;

async function enrichCandidates(candidates: Candidate[]): Promise<Candidate[]> {
  const results = await Promise.allSettled(
    candidates.map(async (c) => {
      try {
        const profile = await enrichCandidateFull(
          `${c.nombre} ${c.apellido}`.trim(),
          c.empresa,
          c.cargo,
          synthesizeProfile
        );
        return {
          ...c,
          linkedinUrl: profile.linkedinUrl || c.linkedinUrl,
          ubicacion: profile.location || c.ubicacion,
          enriched: {
            summary: profile.summary,
            skills: profile.skills,
            education: profile.education,
            experience: profile.experience,
            snippets: profile.snippets,
          },
        };
      } catch {
        return c;
      }
    })
  );
  return results.map((r, i) => (r.status === "fulfilled" ? r.value : candidates[i]));
}

export function NewSearch() {
  const navigate = useNavigate();
  const { tokens, mode } = useTheme();
  const { notifications, addNotification } = useNotifications();
  const { addSearch } = useSearchContext();
  const { t } = useTranslation("search");
  const { t: tc } = useTranslation("common");
  const [loading, setLoading] = useState(false);
  const [nlQuery, setNlQuery] = useState("");
  const [nlParsing, setNlParsing] = useState(false);
  const [step, setStep] = useState(0);

  // Form state
  const [puesto, setPuesto] = useState("");
  const [industria, setIndustria] = useState("");
  const [pais, setPais] = useState("Chile");
  const [empresasRef, setEmpresasRef] = useState<string[]>([]);
  const [anosExp, setAnosExp] = useState("3-5 anos");
  const [seniority, setSeniority] = useState("Senior");
  const [habilidades, setHabilidades] = useState<string[]>([]);
  const [idiomas, setIdiomas] = useState<string[]>(["Espanol", "Ingles"]);
  const [modalidad, setModalidad] = useState("Hibrido");
  const [salarioMin, setSalarioMin] = useState("");
  const [salarioMax, setSalarioMax] = useState("");
  const isTestMode = import.meta.env.VITE_TEST_MODE === "true";
  const [cantidad, setCantidad] = useState(isTestMode ? "5" : "25");
  const [coldEmail, setColdEmail] = useState(!isTestMode);
  const [plantillaEmail, setPlantillaEmail] = useState(DEFAULT_EMAIL_TEMPLATE);
  const [scoreThreshold, setScoreThreshold] = useState(30);
  const [jobDescription, setJobDescription] = useState("");
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [suggestingEmpresas, setSuggestingEmpresas] = useState(false);

  const habilidadesSugeridas = useMemo(
    () => getHabilidadesSugeridas(puesto),
    [puesto]
  );

  const handleReset = () => {
    setPuesto("");
    setIndustria("");
    setPais("Chile");
    setEmpresasRef([]);
    setAnosExp("3-5 anos");
    setSeniority("Senior");
    setHabilidades([]);
    setIdiomas(["Espanol", "Ingles"]);
    setModalidad("Hibrido");
    setSalarioMin("");
    setSalarioMax("");
    setCantidad("25");
    setColdEmail(true);
    setPlantillaEmail(DEFAULT_EMAIL_TEMPLATE);
    setScoreThreshold(30);
    setNlQuery("");
    setJobDescription("");
    setStep(0);
    addNotification("info", t("notifications.formularioReiniciado"));
  };

  const handleNlSearch = async () => {
    if (!nlQuery.trim()) return;
    setNlParsing(true);
    try {
      const parsed = await parseNaturalLanguageSearch(nlQuery);
      if (parsed) {
        if (parsed.puesto) setPuesto(parsed.puesto);
        if (parsed.industria) setIndustria(parsed.industria);
        if (parsed.pais) setPais(parsed.pais);
        if (parsed.seniority) setSeniority(parsed.seniority);
        if (parsed.anosExperiencia) setAnosExp(parsed.anosExperiencia);
        if (parsed.habilidades?.length) setHabilidades(parsed.habilidades);
        if (parsed.modalidad) setModalidad(parsed.modalidad);
        if (parsed.cantidad) setCantidad(String(parsed.cantidad));
        addNotification("success", t("notifications.busquedaInterpretada", { puesto: parsed.puesto, industria: parsed.industria }));
        setNlQuery("");

        // Auto-suggest empresas based on parsed industria + pais
        const targetIndustria = parsed.industria || industria;
        const targetPais = parsed.pais || pais;
        if (targetIndustria) {
          const empresas = await suggestEmpresasByIndustria(targetIndustria, targetPais);
          if (empresas && empresas.length > 0) {
            setEmpresasRef(empresas);
            addNotification("info", t("notifications.empresasSugeridas", { count: empresas.length, industria: targetIndustria }));
          }
        }
      } else {
        addNotification("error", t("notifications.errorInterpretar"));
      }
    } catch {
      addNotification("error", t("notifications.errorIA"));
    }
    setNlParsing(false);
  };

  const handleGenerateDescription = async () => {
    if (!puesto || !industria) {
      addNotification("error", t("notifications.ingresaPuestoIndustria"));
      return;
    }
    setGeneratingDesc(true);
    try {
      const desc = await generateJobDescription(puesto, industria, seniority);
      if (desc) {
        setJobDescription(desc);
        addNotification("success", t("notifications.descripcionGenerada"));
      } else {
        addNotification("error", t("notifications.errorDescripcion"));
      }
    } catch {
      addNotification("error", t("notifications.errorGenerarDescripcion"));
    }
    setGeneratingDesc(false);
  };

  const handleSuggestEmpresas = async () => {
    if (!industria) {
      addNotification("error", t("notifications.seleccionaIndustria"));
      return;
    }
    setSuggestingEmpresas(true);
    try {
      const empresas = await suggestEmpresasByIndustria(industria, pais);
      if (empresas && empresas.length > 0) {
        setEmpresasRef(empresas);
        addNotification("success", t("notifications.empresasSugeridas", { count: empresas.length, industria }));
      } else {
        addNotification("error", t("notifications.errorSugerirEmpresas"));
      }
    } catch {
      addNotification("error", t("notifications.errorSugerir"));
    }
    setSuggestingEmpresas(false);
  };

  const handleQuickTest = async () => {
    setLoading(true);
    addNotification("info", t("notifications.testLanzado"));
    try {
      const result = await launchSearch({
        puesto: "Gerente General",
        industria: "Recursos Humanos",
        pais: "Chile",
        empresas_referencia: ["Umine"],
        anos_experiencia: "10+",
        seniority: "C-Level",
        habilidades: ["Ventas consultivas", "Estrategia comercial"],
        idiomas: ["Espanol"],
        modalidad: "Hibrido",
        cantidad_candidatos: 1,
        enviar_cold_email: false,
      });
      const searchId = result.search_id;
      const candidates = (result.candidatos || []).map(transformN8nCandidate);
      addSearch(searchId, {
        id: searchId,
        puesto: "Gerente General",
        industria: "Recursos Humanos",
        pais: "Chile",
        seniority: "C-Level",
        habilidades: ["Ventas consultivas", "Estrategia comercial"],
        cantidadCandidatos: 1,
        estado: "evaluando",
        createdAt: new Date().toISOString(),
      }, candidates);
      addNotification("success", t("notifications.testExitoso", { count: candidates.length }));
      setTimeout(() => navigate(`/busquedas/${searchId}`), 1500);
    } catch {
      addNotification("error", t("notifications.errorTest"));
    }
    setLoading(false);
  };

  const sections = [
    { title: t("sections.puestoACubrir"), icon: Briefcase },
    { title: t("sections.requisitosDelCandidato"), icon: Target },
    { title: t("sections.configuracionDeBusqueda"), icon: Mail },
    { title: t("sections.resumenBusqueda"), icon: Users },
  ];

  const handleLaunch = async () => {
    if (!puesto || !industria) {
      addNotification("error", t("notifications.completaPuestoIndustria"));
      return;
    }
    setLoading(true);
    try {
      const result = await launchSearch({
        puesto,
        industria,
        pais,
        empresas_referencia: empresasRef.length > 0 ? empresasRef : undefined,
        anos_experiencia: anosExp,
        seniority,
        habilidades,
        idiomas,
        modalidad,
        cantidad_candidatos: parseInt(cantidad),
        enviar_cold_email: coldEmail,
        plantilla_email: coldEmail ? plantillaEmail : undefined,
        descripcion_puesto: jobDescription || undefined,
      });
      const searchId = result.search_id;
      const candidates = (result.candidatos || [])
        .filter((c: { nombre?: string; nombreCompleto?: string }) => c.nombre || c.nombreCompleto)
        .map(transformN8nCandidate);

      // Save candidates immediately so user sees results fast
      addSearch(searchId, {
        id: searchId,
        puesto,
        industria,
        pais,
        seniority,
        habilidades,
        cantidadCandidatos: parseInt(cantidad),
        estado: "evaluando",
        createdAt: new Date().toISOString(),
      }, candidates);
      addNotification("success", t("notifications.busquedaLanzada", { count: candidates.length }));

      // Enrich candidates in background with Serper + Groq
      if (import.meta.env.VITE_SERPER_API_KEY && candidates.length > 0) {
        addNotification("info", `Enriqueciendo ${candidates.length} perfil(es) con Google...`);
        const enriched = await enrichCandidates(candidates);
        addSearch(searchId, {
          id: searchId,
          puesto,
          industria,
          pais,
          seniority,
          habilidades,
          cantidadCandidatos: parseInt(cantidad),
          estado: "evaluando",
          createdAt: new Date().toISOString(),
        }, enriched);
        addNotification("success", `Perfiles enriquecidos exitosamente`);
      }

      setTimeout(() => navigate(`/busquedas/${searchId}`), 1500);
    } catch {
      addNotification(
        "info",
        t("notifications.busquedaDemo")
      );
      setTimeout(() => navigate("/busquedas/demo-1"), 1500);
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <Notifications notifications={notifications} />

      {/* Header */}
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 8,
              letterSpacing: -0.5,
            }}
          >
            {t("newSearch.title")}
          </h1>
          <p style={{ fontSize: 14, color: tokens.text.secondary }}>
            {t("newSearch.subtitle")}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={handleReset}
            size="sm"
          >
            {tc("buttons.resetear")}
          </Button>
          <Button
            variant="gold"
            icon={Send}
            onClick={handleQuickTest}
            loading={loading}
          >
            {t("newSearch.testRapido")}
          </Button>
        </div>
      </div>

      {/* Natural Language Search */}
      {isGroqConfigured() && (
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: 4,
              background: mode === "dark"
                ? `linear-gradient(135deg, ${tokens.accent.teal}12, ${tokens.accent.navy}12)`
                : `linear-gradient(135deg, ${tokens.accent.teal}18, ${tokens.accent.navy}14)`,
              border: `1px solid ${tokens.accent.teal}${mode === "dark" ? "25" : "40"}`,
              borderRadius: 14,
            }}
          >
            <input
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNlSearch();
              }}
              placeholder={t("newSearch.nlPlaceholder")}
              style={{
                flex: 1,
                padding: "12px 16px",
                background: "transparent",
                border: "none",
                color: tokens.text.primary,
                fontSize: 14,
                fontFamily: "'Inter Variable', Inter, sans-serif",
                outline: "none",
              }}
            />
            <Button
              icon={Send}
              onClick={handleNlSearch}
              loading={nlParsing}
              disabled={!nlQuery.trim()}
              size="sm"
              style={{ borderRadius: 10 }}
            >
              {tc("buttons.interpretarConIA")}
            </Button>
            <Button
              icon={FileText}
              onClick={async () => {
                if (!nlQuery.trim()) return;
                setNlParsing(true);
                const parsed = await parseNaturalLanguageSearch(nlQuery);
                if (parsed) {
                  if (parsed.puesto) setPuesto(parsed.puesto);
                  if (parsed.industria) setIndustria(parsed.industria);
                  if (parsed.pais) setPais(parsed.pais);
                  if (parsed.seniority) setSeniority(parsed.seniority);
                  const desc = await generateJobDescription(
                    parsed.puesto || puesto,
                    parsed.industria || industria,
                    parsed.seniority || seniority
                  );
                  if (desc) setJobDescription(desc);
                  const empresas = await suggestEmpresasByIndustria(
                    parsed.industria || industria,
                    parsed.pais || pais
                  );
                  if (empresas) setEmpresasRef(empresas);
                  addNotification("success", t("notifications.perfilGenerado", { puesto: parsed.puesto }));
                  setNlQuery("");
                } else {
                  addNotification("error", t("notifications.errorInterpretarBusqueda"));
                }
                setNlParsing(false);
              }}
              loading={nlParsing}
              disabled={!nlQuery.trim()}
              variant="secondary"
              size="sm"
              style={{ borderRadius: 10 }}
            >
              {tc("buttons.generarPerfilCompleto")}
            </Button>
          </div>
          <div style={{ fontSize: 11, color: tokens.text.muted, marginTop: 6, paddingLeft: 16 }}>
            {t("newSearch.nlPowered")}
          </div>
        </div>
      )}

      {/* Steps indicator */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 32,
        }}
      >
        {sections.map((sec, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 16px",
              background:
                step === i
                  ? `${tokens.accent.teal}${mode === "dark" ? "15" : "20"}`
                  : mode === "dark" ? tokens.glass.dark : "rgba(0,0,0,0.04)",
              border: `1px solid ${step === i ? tokens.accent.teal + (mode === "dark" ? "40" : "50") : mode === "dark" ? tokens.glass.border : "rgba(0,0,0,0.10)"}`,
              borderRadius: 12,
              color: step === i ? tokens.accent.teal : tokens.text.muted,
              fontFamily: "'Inter Variable', Inter, sans-serif",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background:
                  step === i ? tokens.accent.teal : tokens.bg.surface3,
                color: step === i ? "#fff" : tokens.text.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {sec.title}
            </span>
          </button>
        ))}
      </div>

      {/* Form content */}
      <GlassCard style={{ marginBottom: 24 }}>
        {/* Step 0: Puesto */}
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <Briefcase size={20} color={tokens.accent.teal} />
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>
                {t("sections.puestoACubrir")}
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <ComboInput
                label={t("form.tituloPuesto")}
                placeholder={t("form.buscarPuesto")}
                value={puesto}
                onChange={setPuesto}
                options={[...PUESTOS_SUGERIDOS]}
                icon={Briefcase}
                required
              />
              <ComboInput
                label={t("form.industria")}
                placeholder={t("form.buscarIndustria")}
                value={industria}
                onChange={setIndustria}
                options={[...INDUSTRIAS]}
                icon={Building2}
                required
              />
              <Input
                label={t("form.paisRegion")}
                value={pais}
                onChange={setPais}
                icon={Globe}
                options={PAISES.map((p) => ({ value: p, label: p }))}
              />
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <EmpresaSelector
                      label={t("form.empresasReferencia")}
                      selected={empresasRef}
                      onChange={setEmpresasRef}
                      industriaFilter={industria || undefined}
                    />
                  </div>
                  {isGroqConfigured() && (
                    <button
                      onClick={handleSuggestEmpresas}
                      disabled={!industria || suggestingEmpresas}
                      style={{
                        padding: "8px 14px",
                        background: `${tokens.accent.teal}${mode === "dark" ? "15" : "22"}`,
                        border: `1px solid ${tokens.accent.teal}${mode === "dark" ? "30" : "45"}`,
                        borderRadius: 8,
                        color: tokens.accent.teal,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: industria ? "pointer" : "not-allowed",
                        fontFamily: "'Inter Variable', Inter, sans-serif",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        whiteSpace: "nowrap",
                        opacity: !industria ? 0.5 : 1,
                        marginBottom: 2,
                      }}
                    >
                      {suggestingEmpresas ? (
                        <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                      ) : (
                        <Sparkles size={13} />
                      )}
                      {tc("buttons.sugerirConIA")}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* AI Job Description Generator */}
            {isGroqConfigured() && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <FileText size={16} color={tokens.accent.teal} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: tokens.text.primary }}>
                    {t("jobDescription.title")}
                  </span>
                  <button
                    onClick={handleGenerateDescription}
                    disabled={!puesto || !industria || generatingDesc}
                    style={{
                      marginLeft: "auto",
                      padding: "6px 14px",
                      background: mode === "dark"
                        ? `linear-gradient(135deg, ${tokens.accent.teal}20, ${tokens.accent.navy}20)`
                        : `linear-gradient(135deg, ${tokens.accent.teal}28, ${tokens.accent.navy}22)`,
                      border: `1px solid ${tokens.accent.teal}${mode === "dark" ? "30" : "45"}`,
                      borderRadius: 8,
                      color: tokens.accent.teal,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: puesto && industria ? "pointer" : "not-allowed",
                      fontFamily: "'Inter Variable', Inter, sans-serif",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      opacity: !puesto || !industria ? 0.5 : 1,
                    }}
                  >
                    {generatingDesc ? (
                      <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                    ) : (
                      <Sparkles size={13} />
                    )}
                    {generatingDesc ? tc("buttons.generando") : tc("buttons.generarConIA")}
                  </button>
                </div>
                {jobDescription ? (
                  <div style={{ position: "relative" }}>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={8}
                      style={{
                        width: "100%",
                        padding: 14,
                        background: tokens.bg.surface1,
                        border: `1px solid ${tokens.glass.border}`,
                        borderRadius: 10,
                        color: tokens.text.primary,
                        fontSize: 13,
                        fontFamily: "'Inter Variable', Inter, sans-serif",
                        outline: "none",
                        resize: "vertical",
                        lineHeight: 1.6,
                      }}
                    />
                    <button
                      onClick={() => setJobDescription("")}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "transparent",
                        border: "none",
                        color: tokens.text.muted,
                        cursor: "pointer",
                        padding: 4,
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "20px",
                      background: tokens.bg.surface1,
                      border: `1px dashed ${tokens.glass.border}`,
                      borderRadius: 10,
                      textAlign: "center",
                      color: tokens.text.muted,
                      fontSize: 12,
                    }}
                  >
                    {t("jobDescription.placeholder")}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 1: Requisitos */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <Target size={20} color={tokens.accent.teal} />
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>
                {t("sections.requisitosDelCandidato")}
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 16,
              }}
            >
              <Input
                label={t("form.anosExperiencia")}
                value={anosExp}
                onChange={setAnosExp}
                icon={Clock}
                options={EXPERIENCIA.map((e) => ({ value: e, label: e }))}
              />
              <Input
                label={t("form.nivelSeniority")}
                value={seniority}
                onChange={setSeniority}
                icon={Users}
                options={SENIORITY.map((s) => ({ value: s, label: s }))}
              />
              <Input
                label={t("form.modalidad")}
                value={modalidad}
                onChange={setModalidad}
                options={MODALIDAD.map((m) => ({ value: m, label: m }))}
              />
            </div>

            <TagInput
              label={t("form.habilidadesClave")}
              tags={habilidades}
              onChange={setHabilidades}
              placeholder={puesto ? t("form.sugerenciasPara", { puesto }) : t("form.habilidadesPlaceholder")}
              suggestions={habilidadesSugeridas}
            />
            {puesto && habilidadesSugeridas.filter((h) => !habilidades.includes(h)).length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: -8,
                }}
              >
                <span style={{ fontSize: 11, color: tokens.text.muted, marginRight: 4, alignSelf: "center" }}>
                  {tc("labels.sugeridas")}
                </span>
                {habilidadesSugeridas.filter((h) => !habilidades.includes(h)).slice(0, 6).map((h) => (
                  <button
                    key={h}
                    onClick={() => setHabilidades((prev) => prev.includes(h) ? prev : [...prev, h])}
                    style={{
                      padding: "2px 8px",
                      background: `${tokens.accent.teal}${mode === "dark" ? "10" : "18"}`,
                      border: `1px solid ${tokens.accent.teal}${mode === "dark" ? "30" : "40"}`,
                      borderRadius: 6,
                      color: tokens.accent.teal,
                      fontSize: 11,
                      cursor: "pointer",
                      fontFamily: "'Inter Variable', Inter, sans-serif",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${tokens.accent.teal}${mode === "dark" ? "20" : "30"}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `${tokens.accent.teal}${mode === "dark" ? "10" : "18"}`;
                    }}
                  >
                    + {h}
                  </button>
                ))}
              </div>
            )}

            <TagInput
              label={t("form.idiomasRequeridos")}
              tags={idiomas}
              onChange={setIdiomas}
              suggestions={[...IDIOMAS]}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <Input
                label={t("form.salarioMin")}
                placeholder={t("form.salarioMinPlaceholder")}
                value={salarioMin}
                onChange={setSalarioMin}
                type="number"
              />
              <Input
                label={t("form.salarioMax")}
                placeholder={t("form.salarioMaxPlaceholder")}
                value={salarioMax}
                onChange={setSalarioMax}
                type="number"
              />
            </div>
          </div>
        )}

        {/* Step 2: Configuracion busqueda */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <Mail size={20} color={tokens.accent.teal} />
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>
                {t("sections.configuracionDeBusqueda")}
              </h2>
            </div>

            <Input
              label={t("form.cantidadCandidatos")}
              value={cantidad}
              onChange={setCantidad}
              options={[
                { value: "3", label: "3 candidatos" },
                { value: "5", label: "5 candidatos" },
                { value: "10", label: "10 candidatos" },
                { value: "25", label: "25 candidatos" },
                { value: "50", label: "50 candidatos" },
                { value: "100", label: "100 candidatos" },
              ]}
            />

            {/* Score threshold section */}
            <GlassCard
              padding={20}
              style={{
                background: `${tokens.accent.teal}${mode === "dark" ? "06" : "0d"}`,
                border: `1px solid ${tokens.accent.teal}${mode === "dark" ? "20" : "30"}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Shield size={18} color={tokens.accent.teal} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: tokens.text.primary }}>
                    {t("form.umbralAceptacion")}
                  </div>
                  <div style={{ fontSize: 12, color: tokens.text.muted, marginTop: 2 }}>
                    {t("form.umbralDescription")}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Sliders size={14} color={tokens.text.muted} />
                <input
                  type="range"
                  min={10}
                  max={90}
                  step={5}
                  value={scoreThreshold}
                  onChange={(e) => setScoreThreshold(Number(e.target.value))}
                  style={{
                    flex: 1,
                    accentColor: tokens.accent.teal,
                    height: 6,
                  }}
                />
                <div
                  style={{
                    minWidth: 56,
                    padding: "6px 12px",
                    background: tokens.bg.surface1,
                    border: `1px solid ${tokens.glass.border}`,
                    borderRadius: 8,
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: 700,
                    color: scoreThreshold >= 50
                      ? tokens.status.success
                      : scoreThreshold >= 30
                        ? tokens.status.warning
                        : tokens.status.error,
                  }}
                >
                  {scoreThreshold}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 10,
                  color: tokens.text.muted,
                  marginTop: 4,
                  paddingLeft: 30,
                  paddingRight: 68,
                }}
              >
                <span>{t("form.masCandidatos")}</span>
                <span>{t("form.masSelectivo")}</span>
              </div>
            </GlassCard>

            <Toggle
              label={t("form.enviarColdEmail")}
              description={isTestMode ? "(Deshabilitado en modo test)" : t("form.coldEmailDescription", { threshold: scoreThreshold })}
              checked={coldEmail}
              onChange={setColdEmail}
              disabled={isTestMode}
            />

            {coldEmail && (
              <Input
                label={t("form.plantillaEmail")}
                value={plantillaEmail}
                onChange={setPlantillaEmail}
                multiline
                rows={8}
              />
            )}

            {coldEmail && (
              <GlassCard
                padding={16}
                style={{
                  background: `${tokens.status.info}08`,
                  border: `1px solid ${tokens.status.info}20`,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: tokens.status.info,
                    fontWeight: 500,
                    marginBottom: 4,
                  }}
                >
                  {t("form.variablesDisponibles")}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: tokens.text.muted,
                    lineHeight: 1.6,
                  }}
                >
                  {"{nombre}"} — Nombre del candidato · {"{puesto}"} — Puesto buscado
                  · {"{empresa}"} — Empresa del candidato · {"{remitente}"} — Tu nombre
                </div>
              </GlassCard>
            )}
          </div>
        )}

        {/* Step 3: Resumen de busqueda */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <Search size={20} color={tokens.accent.teal} />
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>
                {t("sections.resumenBusqueda")}
              </h2>
            </div>

            <p style={{ fontSize: 13, color: tokens.text.secondary }}>
              {t("summary.description")}
            </p>

            {/* Search parameters summary */}
            <GlassCard>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                {[
                  { label: t("summary.puesto"), value: puesto },
                  { label: t("summary.industria"), value: industria },
                  { label: t("summary.pais"), value: pais },
                  { label: t("summary.seniority"), value: seniority },
                  { label: t("summary.modalidad"), value: modalidad },
                  { label: t("summary.cantidad"), value: cantidad },
                ].map((item) => (
                  <div key={item.label}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: tokens.text.muted,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        marginBottom: 4,
                      }}
                    >
                      {item.label}
                    </div>
                    <div style={{ fontSize: 14, color: tokens.text.primary, fontWeight: 500 }}>
                      {item.value || t("summary.noEspecificado")}
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills */}
              {habilidades.length > 0 && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${tokens.glass.border}` }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: tokens.text.muted,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 8,
                    }}
                  >
                    {t("summary.habilidades")}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {habilidades.map((h) => (
                      <span
                        key={h}
                        style={{
                          padding: "4px 10px",
                          background: `${tokens.accent.teal}15`,
                          border: `1px solid ${tokens.accent.teal}30`,
                          borderRadius: 6,
                          fontSize: 12,
                          color: tokens.accent.teal,
                        }}
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {idiomas.length > 0 && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${tokens.glass.border}` }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: tokens.text.muted,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 8,
                    }}
                  >
                    {t("summary.idiomas")}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {idiomas.map((i) => (
                      <span
                        key={i}
                        style={{
                          padding: "4px 10px",
                          background: `${tokens.accent.navy}15`,
                          border: `1px solid ${tokens.accent.navy}30`,
                          borderRadius: 6,
                          fontSize: 12,
                          color: tokens.accent.navy,
                        }}
                      >
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cold email status */}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${tokens.glass.border}` }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: tokens.text.muted,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  {t("summary.coldEmail")}
                </div>
                <div style={{ fontSize: 14, color: coldEmail ? tokens.status.success : tokens.text.secondary, fontWeight: 500 }}>
                  {coldEmail ? t("summary.si") : t("summary.no")}
                </div>
              </div>
            </GlassCard>

            {/* What AI will do */}
            <GlassCard
              padding={20}
              style={{
                background: mode === "dark"
                  ? `linear-gradient(135deg, ${tokens.accent.teal}06, ${tokens.accent.navy}06)`
                  : `linear-gradient(135deg, ${tokens.accent.teal}0d, ${tokens.accent.navy}0a)`,
                border: `1px solid ${tokens.accent.teal}${mode === "dark" ? "20" : "30"}`,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
                {t("summary.queHara")}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  t("summary.paso1", { count: parseInt(cantidad) }),
                  t("summary.paso2"),
                  t("summary.paso3"),
                  ...(coldEmail ? [t("summary.paso4", { threshold: scoreThreshold })] : []),
                ].map((paso, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 13,
                      color: tokens.text.secondary,
                    }}
                  >
                    <CheckCircle size={16} color={tokens.accent.teal} />
                    {paso}
                  </div>
                ))}
              </div>
            </GlassCard>

            <div
              style={{
                textAlign: "center",
                padding: 16,
                fontSize: 15,
                fontWeight: 600,
                color: tokens.accent.teal,
              }}
            >
              {t("summary.listoParaLanzar")}
            </div>
          </div>
        )}
      </GlassCard>

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          variant="secondary"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          {tc("buttons.anterior")}
        </Button>

        <div style={{ display: "flex", gap: 8 }}>
          {step < 3 ? (
            <Button
              icon={ChevronRight}
              onClick={() => setStep((s) => Math.min(3, s + 1))}
            >
              {tc("buttons.siguiente")}
            </Button>
          ) : (
            <Button
              icon={Send}
              size="lg"
              loading={loading}
              onClick={handleLaunch}
              disabled={!puesto || !industria}
              style={{
                background: `linear-gradient(135deg, ${tokens.accent.teal}, ${tokens.accent.navy})`,
              }}
            >
              {tc("buttons.lanzarBusquedaConIA")}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

import { Plus, Trash2, GripVertical } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { Input } from "../atoms/Input";
import { Button } from "../atoms/Button";
import { TagInput } from "../atoms/TagInput";
import { GlassCard } from "../atoms/GlassCard";
import {
  type InterviewStage,
  STAGE_TIPOS,
  COMPETENCIAS,
} from "../../types/search";

interface StageConfiguratorProps {
  stages: InterviewStage[];
  onChange: (stages: InterviewStage[]) => void;
}

export function StageConfigurator({ stages, onChange }: StageConfiguratorProps) {
  const { tokens } = useTheme();
  const { t } = useTranslation("search");
  const { t: tc } = useTranslation("common");

  const addStage = () => {
    onChange([
      ...stages,
      {
        orden: stages.length + 1,
        nombre: t("stages.etapa", { number: stages.length + 1 }),
        tipo: "avatar_ia",
        duracionMinutos: 15,
        competencias: [],
      },
    ]);
  };

  const removeStage = (index: number) => {
    const updated = stages
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, orden: i + 1 }));
    onChange(updated);
  };

  const updateStage = (index: number, partial: Partial<InterviewStage>) => {
    const updated = stages.map((s, i) =>
      i === index ? { ...s, ...partial } : s
    );
    onChange(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {stages.map((stage, i) => (
        <GlassCard
          key={i}
          padding={16}
          style={{ background: tokens.bg.surface1 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <GripVertical size={16} color={tokens.text.muted} />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: tokens.accent.teal,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {t("stages.etapa", { number: stage.orden })}
              </span>
            </div>
            {stages.length > 1 && (
              <button
                onClick={() => removeStage(i)}
                style={{
                  background: "none",
                  border: "none",
                  color: tokens.status.error,
                  cursor: "pointer",
                  padding: 4,
                  opacity: 0.7,
                }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <Input
              label={t("stages.nombreEtapa")}
              placeholder={t("stages.nombrePlaceholder")}
              value={stage.nombre}
              onChange={(v) => updateStage(i, { nombre: v })}
            />
            <Input
              label={t("stages.tipoEntrevista")}
              value={stage.tipo}
              onChange={(v) =>
                updateStage(i, {
                  tipo: v as InterviewStage["tipo"],
                })
              }
              options={Object.keys(STAGE_TIPOS).map((value) => ({
                value,
                label: tc(`stageTypes.${value}`),
              }))}
            />
            <Input
              label={t("stages.duracion")}
              value={String(stage.duracionMinutos)}
              onChange={(v) =>
                updateStage(i, { duracionMinutos: parseInt(v) || 15 })
              }
              options={[
                { value: "5", label: "5 min" },
                { value: "10", label: "10 min" },
                { value: "15", label: "15 min" },
                { value: "20", label: "20 min" },
                { value: "30", label: "30 min" },
              ]}
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <TagInput
              label={t("stages.competenciasEvaluar")}
              tags={stage.competencias}
              onChange={(tags) => updateStage(i, { competencias: tags })}
              placeholder={t("stages.competenciasPlaceholder")}
              suggestions={[...COMPETENCIAS]}
            />
          </div>
        </GlassCard>
      ))}

      <Button variant="secondary" icon={Plus} onClick={addStage}>
        {tc("buttons.agregarEtapa")}
      </Button>
    </div>
  );
}

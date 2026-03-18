import { useState } from "react";
import { X } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

interface TagInputProps {
  label?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

export function TagInput({
  label,
  tags,
  onChange,
  placeholder = "Escribe y presiona Enter...",
  suggestions = [],
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { tokens, mode } = useTheme();

  const hoverBg = mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
    setShowSuggestions(false);
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const filtered = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: tokens.text.secondary,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          padding: "8px 12px",
          background: tokens.bg.surface1,
          border: `1px solid ${tokens.glass.border}`,
          borderRadius: 10,
          minHeight: 42,
          position: "relative",
        }}
      >
        {tags.map((tag, i) => (
          <span
            key={tag}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              background: `${tokens.accent.teal}20`,
              color: tokens.accent.teal,
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {tag}
            <X
              size={12}
              style={{ cursor: "pointer", opacity: 0.7 }}
              onClick={() => removeTag(i)}
            />
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag(input);
            }
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={tags.length === 0 ? placeholder : ""}
          style={{
            flex: 1,
            minWidth: 120,
            border: "none",
            background: "none",
            color: tokens.text.primary,
            fontSize: 14,
            fontFamily: "'Inter Variable', Inter, sans-serif",
            outline: "none",
          }}
        />
        {showSuggestions && input && filtered.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: tokens.bg.surface2,
              border: `1px solid ${tokens.glass.border}`,
              borderRadius: 10,
              marginTop: 4,
              maxHeight: 160,
              overflowY: "auto",
              zIndex: 10,
            }}
          >
            {filtered.slice(0, 6).map((s) => (
              <div
                key={s}
                onMouseDown={() => addTag(s)}
                style={{
                  padding: "8px 12px",
                  fontSize: 13,
                  color: tokens.text.secondary,
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = hoverBg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

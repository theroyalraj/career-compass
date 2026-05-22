"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Template {
  id: string;
  name: string;
  audience: string;
  bodyMd: string;
  variables: string[];
}

export function OutreachClient({ templates }: { templates: Template[] }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || ""
  );

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  // Variable values dictionary (e.g. { '{{Name}}': 'Alex' })
  const [values, setValues] = useState<Record<string, string>>({});
  const [copySuccess, setCopySuccess] = useState(false);

  if (!selectedTemplate) {
    return (
      <div className="glass-card text-center py-12">
        <p className="text-sm text-muted-foreground">No templates available.</p>
      </div>
    );
  }

  // Generate preview body
  let previewText = selectedTemplate.bodyMd;
  selectedTemplate.variables.forEach((variable) => {
    const replacementVal = values[variable] || variable; // Fallback to raw placeholder if empty
    previewText = previewText.replaceAll(variable, replacementVal);
  });

  const handleInputChange = (variable: string, val: string) => {
    setValues((prev) => ({
      ...prev,
      [variable]: val,
    }));
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(previewText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Templates Selector */}
      <div className="space-y-4 lg:col-span-1">
        <h3 className="text-lg font-bold text-foreground">Select Template</h3>
        <div className="space-y-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setSelectedTemplateId(t.id);
                setValues({});
              }}
              className={`w-full text-left rounded-xl border p-4 transition-all duration-300 ${
                t.id === selectedTemplateId
                  ? "border-primary bg-primary/10"
                  : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-secondary tracking-wider block">
                {t.audience}
              </span>
              <span className="text-sm font-bold text-foreground block mt-1">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Preview */}
      <div className="lg:col-span-2 space-y-6">
        {/* Editor (Variables Input) */}
        {selectedTemplate.variables.length > 0 && (
          <div className="glass-card space-y-4">
            <h3 className="font-bold text-foreground">Customize Variables</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {selectedTemplate.variables.map((variable) => {
                const cleanedLabel = variable.replace("{{", "").replace("}}", "");
                return (
                  <div key={variable} className="space-y-1">
                    <Label htmlFor={variable}>{cleanedLabel}</Label>
                    <Input
                      id={variable}
                      placeholder={`e.g. Enter ${cleanedLabel}`}
                      value={values[variable] || ""}
                      onChange={(e) => handleInputChange(variable, e.target.value)}
                      className="bg-white/5 border-white/10 text-foreground"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Preview */}
        <div className="glass-card space-y-4 bg-gradient-to-br from-card to-primary/5">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="font-bold text-foreground">Populated Message Preview</h3>
            <Button
              onClick={handleCopyToClipboard}
              className={`rounded-full px-5 font-semibold text-xs transition-all ${
                copySuccess
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-primary hover:bg-primary/95 text-primary-foreground"
              }`}
            >
              {copySuccess ? "✓ Copied!" : "📋 Copy Message"}
            </Button>
          </div>

          <div className="rounded-xl border border-white/5 bg-black/25 p-5 font-mono text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {previewText}
          </div>
        </div>
      </div>
    </div>
  );
}

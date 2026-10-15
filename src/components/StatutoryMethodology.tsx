"use client";

import React, { useState } from "react";
import { BookOpen, ChevronDown, ExternalLink, ShieldCheck, Scale, FileCode2 } from "lucide-react";

export interface CitationItem {
  act: string;
  section?: string;
  description: string;
  govUrl?: string;
}

export interface StatutoryMethodologyProps {
  moduleTitle: string;
  formulaDescription: string;
  citations: CitationItem[];
  defaultOpen?: boolean;
}

export function StatutoryMethodology({
  moduleTitle,
  formulaDescription,
  citations,
  defaultOpen = false,
}: StatutoryMethodologyProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="statutory-methodology glass-panel" aria-label={`Statutory Sources and Mathematical Methodology for ${moduleTitle}`}>
      <button
        type="button"
        className="statutory-methodology__header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="statutory-methodology__title-group">
          <div className="statutory-methodology__icon">
            <BookOpen size={16} />
          </div>
          <div>
            <h3 className="statutory-methodology__title">
              Statutory Sources & Mathematical Methodology
            </h3>
            <p className="statutory-methodology__subtitle">
              Audited against UK Parliamentary Acts, HMRC manuals, and Bank of England monetary frameworks
            </p>
          </div>
        </div>
        <div className="statutory-methodology__toggle">
          <span className="statutory-methodology__status-pill">
            <ShieldCheck size={13} />
            <span>FCA & HMRC Aligned</span>
          </span>
          <ChevronDown
            size={18}
            className={`statutory-methodology__chevron ${isOpen ? "open" : ""}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="statutory-methodology__content">
          <div className="statutory-methodology__formula-card">
            <div className="statutory-methodology__formula-title">
              <FileCode2 size={14} />
              <span>Computational Formula & Assumptions</span>
            </div>
            <p className="statutory-methodology__formula-text">
              {formulaDescription}
            </p>
          </div>

          <div className="statutory-methodology__citations">
            <h4 className="statutory-methodology__citations-title">
              <Scale size={14} />
              <span>Statutory Legal Authorities & Regulatory References</span>
            </h4>
            <div className="statutory-methodology__citations-grid">
              {citations.map((item, idx) => (
                <div key={idx} className="statutory-citation-card">
                  <div className="statutory-citation-badge">
                    <span>{item.act}</span>
                    {item.section && <span className="statutory-citation-section">{item.section}</span>}
                  </div>
                  <p className="statutory-citation-desc">{item.description}</p>
                  {item.govUrl && (
                    <a
                      href={item.govUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="statutory-citation-link"
                    >
                      <span>View Official Legislation</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

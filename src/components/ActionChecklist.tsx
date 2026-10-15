"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Square, CheckCircle2, ListOrdered, Share2, Sparkles } from "lucide-react";

export interface ChecklistItem {
  id: string;
  stepNumber: number;
  title: string;
  detail: string;
  actionTag?: string;
}

export interface ActionChecklistProps {
  id: string;
  title: string;
  subtitle: string;
  items: ChecklistItem[];
}

export function ActionChecklist({ id, title, subtitle, items }: ActionChecklistProps) {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`ladderpass_checklist_${id}`);
        if (saved) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCheckedIds(JSON.parse(saved));
        }
      } catch {
        // Fallback gracefully on storage restrictions
      }
    }
  }, [id]);

  const toggleItem = (itemId: string) => {
    const next = { ...checkedIds, [itemId]: !checkedIds[itemId] };
    setCheckedIds(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`ladderpass_checklist_${id}`, JSON.stringify(next));
      } catch {
        // Fallback gracefully
      }
    }
  };

  const completedCount = items.filter((item) => checkedIds[item.id]).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  const handleCopyChecklist = () => {
    if (typeof window !== "undefined") {
      const text = `${title}\n${subtitle}\n\n` +
        items
          .map(
            (i) =>
              `[${checkedIds[i.id] ? "X" : " "}] Step ${i.stepNumber}: ${i.title}\n   ${i.detail}`
          )
          .join("\n\n") +
        `\n\nProgress: ${completedCount}/${items.length} completed via LadderPass (https://ladderpass.vercel.app)`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="action-checklist glass-panel" aria-label={title}>
      <div className="action-checklist__header">
        <div className="action-checklist__title-group">
          <div className="action-checklist__icon">
            <ListOrdered size={16} />
          </div>
          <div>
            <h3 className="action-checklist__title">{title}</h3>
            <p className="action-checklist__subtitle">{subtitle}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyChecklist}
          className="action-checklist__copy-btn"
          title="Copy formatted checklist to clipboard"
        >
          {copied ? <CheckCircle2 size={13} style={{ color: "var(--accent-green)" }} /> : <Share2 size={13} />}
          <span>{copied ? "Copied" : "Copy Steps"}</span>
        </button>
      </div>

      <div className="action-checklist__progress-wrap">
        <div className="action-checklist__progress-labels">
          <span className="action-checklist__progress-status">
            {completedCount === items.length ? (
              <span className="text-primary flex items-center gap-1 font-bold">
                <Sparkles size={12} /> All Steps Completed — Ready for Action
              </span>
            ) : (
              <span>Progress: {completedCount} of {items.length} actions bounded</span>
            )}
          </span>
          <span className="action-checklist__progress-percent font-mono">{progressPercent}%</span>
        </div>
        <div className="action-checklist__progress-bar">
          <div
            className="action-checklist__progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="action-checklist__list">
        {items.map((item) => {
          const isChecked = Boolean(checkedIds[item.id]);
          return (
            <div
              key={item.id}
              className={`action-checklist__item ${isChecked ? "action-checklist__item--checked" : ""}`}
              onClick={() => toggleItem(item.id)}
              role="checkbox"
              aria-checked={isChecked}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  toggleItem(item.id);
                }
              }}
            >
              <div className="action-checklist__checkbox">
                {isChecked ? (
                  <CheckSquare size={18} className="text-primary" />
                ) : (
                  <Square size={18} className="text-muted" />
                )}
              </div>
              <div className="action-checklist__item-body">
                <div className="action-checklist__item-header">
                  <span className="action-checklist__step-tag">Step {item.stepNumber}</span>
                  <span className="action-checklist__item-title">{item.title}</span>
                  {item.actionTag && (
                    <span className="action-checklist__action-tag">{item.actionTag}</span>
                  )}
                </div>
                <p className="action-checklist__item-desc">{item.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

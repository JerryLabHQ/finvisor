"use client";

import { ProStatus } from "./types";

const PRO_STORAGE_KEY = "finvisor_pro_status_v1";

export function getProStatus(): ProStatus {
  if (typeof window === "undefined") {
    return { isPro: false };
  }
  try {
    const raw = localStorage.getItem(PRO_STORAGE_KEY);
    if (!raw) return { isPro: false };
    const parsed: ProStatus = JSON.parse(raw);
    return parsed;
  } catch {
    return { isPro: false };
  }
}

export function saveProStatus(status: ProStatus): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PRO_STORAGE_KEY, JSON.stringify(status));
    window.dispatchEvent(new Event("finvisor-pro-change"));
  } catch (err) {
    console.error("Failed to save pro status:", err);
  }
}

export function activatePro(plan: "lifetime" | "monthly" | "demo" = "lifetime", licenseKey?: string): ProStatus {
  const status: ProStatus = {
    isPro: true,
    plan,
    licenseKey: licenseKey || `PRO-DEV-${Date.now().toString(36).toUpperCase()}`,
    unlockedAt: new Date().toISOString(),
  };
  saveProStatus(status);
  return status;
}

export function resetProStatus(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PRO_STORAGE_KEY);
  window.dispatchEvent(new Event("finvisor-pro-change"));
}

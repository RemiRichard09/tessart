"use client";

import { useState, useCallback } from "react";
import type { SavingsEstimate } from "@/lib/hydro-quebec";

type Tab = "upload" | "manual";

export default function EconomiePage() {
  const [tab, setTab] = useState<Tab>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SavingsEstimate | null>(null);

  // Manual form state
  const [manualKwh, setManualKwh] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualDays, setManualDays] = useState("30");

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      setError("");
    } else {
      setError("Veuillez déposer un fichier PDF.");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type === "application/pdf") {
        setFile(selected);
        setError("");
      } else {
        setError("Veuillez sélectionner un fichier PDF.");
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("bill", file);

    try {
      const res = await fetch("/api/analyze-bill", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
      } else {
        setResult(data.data);
      }
    } catch {
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualKwh) {
      setError("Veuillez entrer votre consommation en kWh.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/analyze-bill/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalKwh: manualKwh,
          amountAfterTax: manualAmount || undefined,
          days: parseInt(manualDays) || 30,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
      } else {
        setResult(data.data);
      }
    } catch {
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setError("");
    setManualKwh("");
    setManualAmount("");
    setManualDays("30");
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Calculez vos économies
        </h1>
        <p className="mt-3 text-gray-600">
          Téléversez votre facture Hydro-Québec ou entrez vos données
          manuellement pour découvrir combien vous pourriez économiser avec un
          accumulateur thermique Tessart.
        </p>
      </div>

      {!result ? (
        <div className="mt-10">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setTab("upload");
                setError("");
              }}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                tab === "upload"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Téléverser un PDF
            </button>
            <button
              onClick={() => {
                setTab("manual");
                setError("");
              }}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                tab === "manual"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Saisie manuelle
            </button>
          </div>

          {/* Upload tab */}
          {tab === "upload" && (
            <form onSubmit={handleUploadSubmit} className="mt-8">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
                  dragOver
                    ? "border-primary bg-green-50"
                    : file
                      ? "border-primary-light bg-green-50"
                      : "border-gray-300 bg-gray-50"
                }`}
              >
                {file ? (
                  <>
                    <svg
                      className="h-12 w-12 text-primary-light"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="mt-3 font-medium text-gray-900">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(0)} Ko
                    </p>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Retirer le fichier
                    </button>
                  </>
                ) : (
                  <>
                    <svg
                      className="h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mt-3 text-gray-700">
                      Glissez votre facture ici ou{" "}
                      <label className="cursor-pointer font-medium text-primary hover:text-primary-light">
                        parcourez vos fichiers
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      PDF uniquement, max 10 Mo
                    </p>
                  </>
                )}
              </div>

              {error && (
                <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!file || loading}
                className="mt-6 w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Analyse en cours...
                  </span>
                ) : (
                  "Analyser ma facture"
                )}
              </button>
            </form>
          )}

          {/* Manual tab */}
          {tab === "manual" && (
            <form onSubmit={handleManualSubmit} className="mt-8 space-y-6">
              <div>
                <label
                  htmlFor="kwh"
                  className="block text-sm font-medium text-gray-700"
                >
                  Consommation totale (kWh) *
                </label>
                <input
                  id="kwh"
                  type="number"
                  min="1"
                  step="1"
                  value={manualKwh}
                  onChange={(e) => setManualKwh(e.target.value)}
                  placeholder="Ex: 3500"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Trouvez cette valeur sur votre facture Hydro-Québec
                </p>
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Montant de la facture ($)
                </label>
                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  placeholder="Ex: 285.50"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="days"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre de jours de la période
                </label>
                <input
                  id="days"
                  type="number"
                  min="1"
                  max="90"
                  value={manualDays}
                  onChange={(e) => setManualDays(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Calcul en cours..." : "Calculer mes économies"}
              </button>
            </form>
          )}
        </div>
      ) : (
        /* Results */
        <SavingsResults result={result} onReset={resetForm} />
      )}
    </div>
  );
}

function SavingsResults({
  result,
  onReset,
}: {
  result: SavingsEstimate;
  onReset: () => void;
}) {
  const fmt = (n: number) =>
    n.toLocaleString("fr-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="mt-10 space-y-8">
      {/* Main savings card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-green-800 p-8 text-white text-center">
        <p className="text-green-200 text-sm font-medium uppercase tracking-wider">
          Économies annuelles estimées
        </p>
        <p className="mt-2 text-5xl font-bold">{fmt(result.annualSavings)} $</p>
        <p className="mt-2 text-green-200">
          soit {fmt(result.monthlySavings)} $ / mois ({result.savingsPercent}%
          d&apos;économie)
        </p>
      </div>

      {/* Summary grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Consommation annuelle"
          value={`${result.annualKwh.toLocaleString("fr-CA")} kWh`}
        />
        <StatCard
          label="Coût actuel estimé"
          value={`${fmt(result.currentAnnualCost)} $`}
        />
        <StatCard
          label="Coût projeté avec Tessart"
          value={`${fmt(result.projectedAnnualCost)} $`}
          highlight
        />
      </div>

      {/* Breakdown */}
      <div className="rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Détail des économies
        </h3>
        <div className="mt-4 space-y-3">
          <BreakdownRow
            label="Évitement des pointes (Flex D)"
            value={result.breakdown.peakAvoidanceSavings}
            description="Économies en déplaçant le chauffage hors des périodes de pointe hivernales"
          />
          <BreakdownRow
            label="Crédits heures creuses"
            value={result.breakdown.offPeakCreditSavings}
            description="Crédits obtenus pour la consommation pendant les heures creuses"
          />
          <BreakdownRow
            label="Optimisation tarifaire"
            value={result.breakdown.rateOptimizationSavings}
            description="Économies en maintenant plus de consommation dans le premier palier"
          />
        </div>
      </div>

      {/* Heating & payback info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Chauffage estimé
          </h3>
          <p className="mt-2 text-3xl font-bold text-primary">
            {result.heatingKwh.toLocaleString("fr-CA")} kWh
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Part estimée du chauffage dans votre consommation annuelle (~60%)
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Retour sur investissement
          </h3>
          <p className="mt-2 text-3xl font-bold text-accent">
            ~{result.paybackYears} ans
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Basé sur un coût d&apos;installation typique d&apos;un accumulateur
            thermique résidentiel
          </p>
        </div>
      </div>

      {/* Bill details (if available) */}
      {(result.bill.totalKwh > 0 || result.bill.amountAfterTax > 0) && (
        <div className="rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Données de votre facture
          </h3>
          <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 text-sm">
            {result.bill.totalKwh > 0 && (
              <div>
                <dt className="text-gray-500">Consommation</dt>
                <dd className="font-medium text-gray-900">
                  {result.bill.totalKwh.toLocaleString("fr-CA")} kWh
                </dd>
              </div>
            )}
            {result.bill.amountAfterTax > 0 && (
              <div>
                <dt className="text-gray-500">Montant facturé</dt>
                <dd className="font-medium text-gray-900">
                  {fmt(result.bill.amountAfterTax)} $
                </dd>
              </div>
            )}
            <div>
              <dt className="text-gray-500">Période</dt>
              <dd className="font-medium text-gray-900">
                {result.bill.days} jours
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Consommation moyenne</dt>
              <dd className="font-medium text-gray-900">
                {result.bill.avgDailyKwh} kWh/jour
              </dd>
            </div>
            {result.bill.rateType !== "unknown" && (
              <div>
                <dt className="text-gray-500">Tarif détecté</dt>
                <dd className="font-medium text-gray-900">
                  {result.bill.rateType}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        <strong>Note :</strong> Ces résultats sont des estimations basées sur
        les données extraites de votre facture et les tarifs courants
        d&apos;Hydro-Québec. Les économies réelles peuvent varier selon votre
        profil de consommation, la taille de votre résidence et le modèle
        d&apos;accumulateur choisi. Contactez-nous pour une évaluation
        personnalisée.
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <button
          onClick={onReset}
          className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Analyser une autre facture
        </button>
        <a
          href="mailto:info@tessart.ca?subject=Demande d'information - Accumulateur thermique"
          className="flex-1 rounded-lg bg-primary px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-primary-light"
        >
          Nous contacter
        </a>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${highlight ? "border-primary bg-green-50" : "border-gray-200"}`}
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${highlight ? "text-primary" : "text-gray-900"}`}
      >
        {value}
      </p>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg bg-gray-50 p-3">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <p className="whitespace-nowrap font-semibold text-primary">
        {value.toLocaleString("fr-CA", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}{" "}
        $
      </p>
    </div>
  );
}

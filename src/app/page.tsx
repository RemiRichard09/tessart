import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-green-800 py-24 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Réduisez votre facture d&apos;électricité avec les accumulateurs
              thermiques
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-green-100">
              Les accumulateurs thermiques Tessart emmagasinent la chaleur
              pendant les heures creuses et la restituent quand vous en avez
              besoin. Résultat : un confort optimal et des économies
              substantielles sur votre facture Hydro-Québec.
            </p>
            <Link
              href="/economie"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-orange-600"
            >
              Téléverser ma facture
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Comment ça fonctionne
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Téléversez votre facture",
                description:
                  "Téléversez votre facture Hydro-Québec en format PDF. Nous en extrayons automatiquement vos données de consommation.",
              },
              {
                step: "2",
                title: "Analyse automatique",
                description:
                  "Notre outil calcule votre profil de consommation et simule l'impact d'un accumulateur thermique sur votre facture.",
              },
              {
                step: "3",
                title: "Voyez vos économies",
                description:
                  "Recevez une estimation détaillée des économies annuelles que vous pourriez réaliser avec Tessart.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-gray-200 p-6 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Pourquoi choisir un accumulateur thermique?
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {[
              {
                title: "Économies sur le tarif Flex D",
                description:
                  "Profitez des tarifs réduits pendant les heures creuses pour chauffer votre accumulateur et réduisez votre consommation aux heures de pointe.",
              },
              {
                title: "Confort constant",
                description:
                  "Chaleur douce et uniforme restituée tout au long de la journée, même pendant les périodes de pointe.",
              },
              {
                title: "Écologique",
                description:
                  "Optimisez l'utilisation de l'hydroélectricité propre du Québec en déplaçant votre consommation hors pointe.",
              },
              {
                title: "Retour sur investissement rapide",
                description:
                  "Les économies réalisées permettent de rentabiliser votre accumulateur thermique en quelques années seulement.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl bg-white p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Prêt à découvrir vos économies?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-gray-600">
            Téléversez votre facture Hydro-Québec et obtenez une estimation
            personnalisée en quelques secondes.
          </p>
          <Link
            href="/economie"
            className="mt-8 inline-flex rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-light"
          >
            Commencer maintenant
          </Link>
        </div>
      </section>
    </div>
  );
}

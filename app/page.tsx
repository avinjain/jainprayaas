import { getPublicSiteDisplay } from "@/lib/public-site";
import { SubmitBiodataForm } from "@/components/SubmitBiodataForm";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: "🔒",
    title: "Secure & Private",
    desc: "Your biodata is seen only by our trusted community coordinators.",
  },
  {
    icon: "⚡",
    title: "Quick Setup",
    desc: "Fill one simple form and upload your biodata in under 5 minutes.",
  },
  {
    icon: "🤝",
    title: "Community Verified",
    desc: "Every profile is reviewed and payment-verified before listing.",
  },
];

export default async function HomePage() {
  const cfg = await getPublicSiteDisplay();

  return (
    <div className="min-h-full">
      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-amber-900 pb-32 pt-12 text-white sm:pt-16">
        {/* subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 lg:grid-cols-2">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-700/40 bg-red-800/40 px-4 py-1.5 text-sm font-medium text-red-200 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Jain Community Matrimony
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Find Your{" "}
              <span className="relative">
                <span className="relative z-10 text-amber-300">Life Partner</span>
                <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-amber-500/50" />
              </span>
              <br className="hidden sm:block" /> within the Community
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-red-200 sm:text-lg lg:mx-0">
              {cfg.communityName} is a trusted matrimony platform for the Jain
              community. Submit your biodata and let us help you find a compatible
              match.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="#apply"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-amber-400 active:scale-95"
              >
                Register Now
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Link>
              <span className="text-sm text-red-300">
                Registration fee ₹{Number.isFinite(cfg.feeInr) ? cfg.feeInr : 501}
              </span>
            </div>
          </div>

          {/* Right: bride + groom illustrations */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative grid grid-cols-2 gap-3 sm:gap-5">
              <div className="relative">
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-amber-300/40 via-amber-200/20 to-transparent blur-xl" />
                <div className="relative overflow-hidden rounded-3xl border-2 border-amber-300/30 bg-white/10 p-2 shadow-2xl backdrop-blur-sm">
                  <Image
                    src="/illustration-groom.svg"
                    alt="Illustration of a Jain groom in traditional safa"
                    width={240}
                    height={280}
                    className="h-auto w-full"
                    priority
                  />
                  <p className="pb-1 text-center text-xs font-semibold tracking-wide text-amber-100">
                    For Grooms
                  </p>
                </div>
              </div>
              <div className="relative mt-8">
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-red-300/40 via-red-200/20 to-transparent blur-xl" />
                <div className="relative overflow-hidden rounded-3xl border-2 border-red-300/30 bg-white/10 p-2 shadow-2xl backdrop-blur-sm">
                  <Image
                    src="/illustration-bride.svg"
                    alt="Illustration of a Jain bride in traditional saree"
                    width={240}
                    height={280}
                    className="h-auto w-full"
                    priority
                  />
                  <p className="pb-1 text-center text-xs font-semibold tracking-wide text-red-100">
                    For Brides
                  </p>
                </div>
              </div>
              {/* connecting heart between cards */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-red-500 shadow-lg ring-4 ring-red-950/50">
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* wave bottom */}
        <div className="absolute -bottom-px left-0 right-0">
          <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 32C240 64 480 0 720 32C960 64 1200 0 1440 32V64H0V32Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────── */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-4xl px-5">
          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex flex-col items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-5"
              >
                <span className="text-3xl">{f.icon}</span>
                <div>
                  <p className="font-semibold text-slate-900">{f.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── REGISTRATION FORM ───────────────────────────────── */}
      <section className="bg-slate-50 py-8 pb-20">
        <div className="mx-auto max-w-2xl px-4">
          <div className="mb-8 text-center">
            <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-800">
              Apply Now
            </span>
            <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
              Submit Your Biodata
            </h2>
            <p className="mt-2 text-slate-500">
              Complete the form below to register your profile with{" "}
              {cfg.communityName}.
            </p>
          </div>
          <SubmitBiodataForm {...cfg} />
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-white py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-5 text-center">
          <Image
            src="/prayaas-logo.png"
            alt="Prayaas"
            width={160}
            height={64}
            className="h-16 w-auto object-contain"
          />
          <p className="text-xs text-slate-400">
            A community matrimony initiative for the Jain community.
          </p>
        </div>
      </footer>
    </div>
  );
}

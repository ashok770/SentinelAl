import CTAButtons from "./CTAButtons";

function HeroContent() {
  return (
    <div className="flex w-1/2 flex-col justify-center text-white">
      {/* Badge */}
      <div className="mb-6 inline-flex w-fit items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
        🛡 AI-Powered User Behavior Intelligence
      </div>

      {/* Heading */}
      <h1 className="max-w-xl text-6xl font-bold leading-tight">
        Know Who Needs
        <br />
        Your Attention
        <br />
        Before Damage Happens.
      </h1>

      {/* Description */}
      <p className="mt-8 max-w-xl text-lg leading-8 text-slate-400">
        Monitor user activity, detect unusual behavior, explain security risks,
        and help your team investigate threats before they become incidents.
      </p>

      {/* Buttons */}
      <div className="mt-10">
        <CTAButtons />
      </div>

      {/* Trust */}
      <p className="mt-12 text-sm text-slate-500">
        Built for Colleges • SMEs • Security Teams
      </p>
    </div>
  );
}

export default HeroContent;

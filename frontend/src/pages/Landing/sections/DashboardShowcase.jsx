import React from "react";

const DashboardShowcase = () => {
  return (
    <section className="relative bg-[#050816] py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}

        <div className="text-center mb-20">
          <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
            Live AI Dashboard
          </span>

          <h2 className="mt-6 text-5xl font-bold text-white">
            See SentinelAI In Action
          </h2>

          <p className="mt-6 max-w-2xl mx-auto text-gray-400 text-lg">
            Every login, every device, every behavioural change is analysed in
            real time using AI.
          </p>
        </div>

        {/* Dashboard Container */}

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_0_80px_rgba(0,255,255,0.08)]">
          Dashboard goes here
        </div>
      </div>
    </section>
  );
};

export default DashboardShowcase;

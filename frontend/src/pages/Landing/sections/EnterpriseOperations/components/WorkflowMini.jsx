function WorkflowMini({ steps }) {
  return (
    <div className="mt-6">
      <div className="flex flex-col items-center">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center w-full">
            {/* Step */}
            <div className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-center">
              <p className="text-sm font-medium text-slate-200">{step}</p>
            </div>

            {/* Connector */}
            {index !== steps.length - 1 && (
              <div className="my-2 h-5 w-px bg-slate-700" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkflowMini;

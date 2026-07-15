import { useState } from "react";
import { ChevronDown } from "lucide-react";

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-800 py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <h3 className="text-lg font-medium text-white">{question}</h3>

        <ChevronDown
          size={20}
          className={`text-slate-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-40 mt-4" : "max-h-0"
        }`}
      >
        <p className="leading-7 text-slate-400">{answer}</p>
      </div>
    </div>
  );
}

export default FAQItem;

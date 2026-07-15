import FAQHeader from "./components/FAQHeader";
import FAQItem from "./components/FAQItem";

import { faqData } from "./data/faqData";

function FAQ() {
  return (
    <section className="relative bg-[#050816] py-32">
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <FAQHeader />

        {/* Questions */}
        <div className="mt-20 rounded-3xl border border-slate-800 bg-[#0A1022] px-8 py-4">
          {faqData.map((item, index) => (
            <FAQItem
              key={index}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;

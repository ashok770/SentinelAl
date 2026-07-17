import OperationsHeader from "./components/OperationsHeader";
import OperationsCard from "./components/OperationsCard";

import { operationsCards } from "./data/operationsData";

function EnterpriseOperations() {
  return (
    <section id="enterprise" className="relative bg-[#050816] py-32">
      <div className="mx-auto max-w-7xl px-6">
        <OperationsHeader />

        <div className="mt-20 grid gap-8 lg:grid-cols-3">
          {operationsCards.map((card, index) => (
            <OperationsCard
              key={index}
              title={card.title}
              description={card.description}
              type={card.type}
              workflow={card.workflow}
              items={card.items}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default EnterpriseOperations;

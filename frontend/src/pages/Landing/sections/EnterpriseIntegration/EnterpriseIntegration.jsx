import IntegrationHeader from "./components/IntegrationHeader";
import CategoryCard from "./components/CategoryCard";

import { integrationCategories } from "./data/integrationData";

function EnterpriseIntegration() {
  return (
    <section className="relative bg-[#050816] py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <IntegrationHeader />

        {/* Categories */}
        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {integrationCategories.map((category, index) => (
            <CategoryCard
              key={index}
              title={category.title}
              description={category.description}
              tools={category.tools}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default EnterpriseIntegration;

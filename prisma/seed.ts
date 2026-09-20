import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const technologies = [
  ["GPS", "gps", "Satellite positioning for movement and workload monitoring."],
  ["Wearables", "wearables", "Body-worn sensors for physiological and performance data."],
  ["Force Plates", "force-plates", "Force measurement for strength, power and asymmetry assessment."],
  ["Computer Vision", "computer-vision", "Vision-based capture and performance analysis."],
  ["AI", "ai", "Machine-learning systems that support sports performance decisions."],
  ["Biomechanics", "biomechanics", "Measurement and analysis of human movement."],
];
const useCases = [
  ["Athlete Monitoring", "athlete-monitoring"], ["Training Load", "training-load"], ["Strength Assessment", "strength-assessment"], ["Biomechanics", "biomechanics"], ["Recovery", "recovery"], ["Injury Prevention", "injury-prevention"], ["Performance Analysis", "performance-analysis"], ["Technique Analysis", "technique-analysis"], ["AI Coaching", "ai-coaching"], ["Return to Play", "return-to-play"],
];
const sports = [["Football", "football"], ["Basketball", "basketball"], ["Rugby", "rugby"], ["Running", "running"], ["General Performance", "general-performance"]];

const companies = [
  { name: "Catapult Sports", slug: "catapult-sports", shortDescription: "Performance technology for professional teams and athletes.", website: "https://www.catapult.com/", country: "Australia", foundedYear: 2006, products: [{ name: "Catapult Vector", slug: "catapult-vector", shortDescription: "Athlete monitoring platform for team-sport performance workflows.", website: "https://www.catapult.com/vector/", technologies: ["gps", "wearables"], useCases: ["athlete-monitoring", "training-load"], sports: ["football", "basketball", "rugby"] }] },
  { name: "STATSports", slug: "statsports", shortDescription: "GPS performance monitoring technology for teams and athletes.", website: "https://statsports.com/", country: "Ireland", foundedYear: 2008, products: [{ name: "STATSports Apex", slug: "statsports-apex", shortDescription: "GPS athlete monitoring system for team sports.", website: "https://statsports.com/apex/", technologies: ["gps", "wearables"], useCases: ["athlete-monitoring", "training-load"], sports: ["football", "rugby"] }] },
  { name: "VALD", slug: "vald", shortDescription: "Objective measurement technology for human performance and rehabilitation.", website: "https://vald.com/", country: "Australia", products: [{ name: "ForceDecks", slug: "vald-forcedecks", shortDescription: "Force plate system for objective strength and power assessment.", website: "https://vald.com/forcedecks/", technologies: ["force-plates", "biomechanics"], useCases: ["strength-assessment", "injury-prevention", "return-to-play"], sports: ["general-performance"] }] },
  { name: "Hawkin Dynamics", slug: "hawkin-dynamics", shortDescription: "Force plate technology for performance, rehabilitation and research.", website: "https://www.hawkindynamics.com/", country: "United States", products: [{ name: "Hawkin Dynamics Force Plates", slug: "hawkin-dynamics-force-plates", shortDescription: "Portable force plates for strength and movement assessment.", website: "https://www.hawkindynamics.com/", technologies: ["force-plates", "biomechanics"], useCases: ["strength-assessment", "return-to-play"], sports: ["general-performance"] }] },
  { name: "Output Sports", slug: "output-sports", shortDescription: "Portable measurement tools for strength and athletic performance.", website: "https://outputsports.com/", country: "Ireland", products: [{ name: "Output Sports", slug: "output-sports-system", shortDescription: "Portable performance testing system for teams and practitioners.", website: "https://outputsports.com/", technologies: ["wearables", "biomechanics"], useCases: ["strength-assessment", "athlete-monitoring"], sports: ["general-performance", "football"] }] },
];

async function main() {
  // Keep initialization deliberately low-concurrency: Supabase's pooled
  // connection can reject a burst of first-run upserts even for a small seed.
  for (const [name, slug, description] of technologies) {
    await prisma.technology.upsert({ where: { slug }, create: { name, slug, description }, update: { name, description } });
  }
  for (const [name, slug] of useCases) {
    await prisma.useCase.upsert({ where: { slug }, create: { name, slug }, update: { name } });
  }
  for (const [name, slug] of sports) {
    await prisma.sport.upsert({ where: { slug }, create: { name, slug }, update: { name } });
  }
  for (const item of companies) {
    const company = await prisma.company.upsert({ where: { slug: item.slug }, create: { ...item, products: undefined, isFeatured: true, isVerified: true }, update: { name: item.name, shortDescription: item.shortDescription, website: item.website, country: item.country, foundedYear: item.foundedYear, isFeatured: true, isVerified: true } });
    for (const itemProduct of item.products) {
      const product = await prisma.product.upsert({ where: { slug: itemProduct.slug }, create: { name: itemProduct.name, slug: itemProduct.slug, shortDescription: itemProduct.shortDescription, website: itemProduct.website, companyId: company.id, isFeatured: true }, update: { name: itemProduct.name, shortDescription: itemProduct.shortDescription, website: itemProduct.website, companyId: company.id, isFeatured: true } });
      const technologyRecords = await prisma.technology.findMany({ where: { slug: { in: itemProduct.technologies } } });
      const useCaseRecords = await prisma.useCase.findMany({ where: { slug: { in: itemProduct.useCases } } });
      const sportRecords = await prisma.sport.findMany({ where: { slug: { in: itemProduct.sports } } });
      await prisma.$transaction([
        prisma.productTechnology.deleteMany({ where: { productId: product.id } }), prisma.productUseCase.deleteMany({ where: { productId: product.id } }), prisma.productSport.deleteMany({ where: { productId: product.id } }),
        prisma.productTechnology.createMany({ data: technologyRecords.map((technology) => ({ productId: product.id, technologyId: technology.id })) }), prisma.productUseCase.createMany({ data: useCaseRecords.map((useCase) => ({ productId: product.id, useCaseId: useCase.id })) }), prisma.productSport.createMany({ data: sportRecords.map((sport) => ({ productId: product.id, sportId: sport.id })) }),
      ]);
    }
  }
}

main()
  .then(() => console.log("Intelligence seed completed."))
  .finally(() => prisma.$disconnect());

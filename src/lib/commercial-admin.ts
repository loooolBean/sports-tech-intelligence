import { prisma } from "./prisma";

export async function getCommercialFormOptions() {
  const [products, companies, technologies, useCases, sports, research] = await Promise.all([
    prisma.product.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" }, take: 500 }),
    prisma.company.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" }, take: 500 }),
    prisma.technology.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" }, take: 500 }),
    prisma.useCase.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" }, take: 500 }),
    prisma.sport.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" }, take: 500 }),
    prisma.research.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" }, take: 500 }),
  ]);
  return { products, companies, technologies, useCases, sports, research: research.map((item) => ({ id: item.id, name: item.title })) };
}

export async function getAdminResearch(id: string) {
  return prisma.research.findUnique({ where: { id }, include: { products: true, companies: true, technologies: true, useCases: true, sports: true } });
}

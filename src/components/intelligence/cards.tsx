import Link from "next/link";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  company: { name: string; slug: string };
  technologies: Array<{ technology: { id: string; name: string } }>;
  useCases: Array<{ useCase: { id: string; name: string } }>;
};

type CompanyProductCardData = Omit<ProductCardData, "company">;

export type CompanyCardData = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  country: string | null;
  products: CompanyProductCardData[];
};

export function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-border bg-bg-elevated px-2.5 py-1 text-[0.7rem] font-medium text-text-secondary">{children}</span>;
}

export function CompanyCard({ company }: { company: CompanyCardData }) {
  const technologies = [...new Set(company.products.flatMap((product) => product.technologies.map(({ technology }) => technology.name)))].slice(0, 3);
  const useCases = [...new Set(company.products.flatMap((product) => product.useCases.map(({ useCase }) => useCase.name)))].slice(0, 2);
  return (
    <Link href={`/companies/${company.slug}`} className="group card-surface flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3"><h3 className="text-h3 text-text-primary group-hover:text-accent">{company.name}</h3>{company.country && <span className="text-caption text-text-tertiary">{company.country}</span>}</div>
      <p className="mt-3 line-clamp-3 text-body text-text-secondary">{company.shortDescription ?? company.description ?? "Sports technology company profile."}</p>
      <div className="mt-5 flex flex-wrap gap-2">{technologies.map((name) => <Badge key={name}>{name}</Badge>)}{useCases.map((name) => <Badge key={name}>{name}</Badge>)}</div>
      <span className="mt-auto pt-6 text-caption font-semibold text-accent">View company →</span>
    </Link>
  );
}

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link href={`/products/${product.slug}`} className="group card-surface flex h-full flex-col p-5">
      <p className="text-caption font-medium text-accent">{product.company.name}</p>
      <h3 className="mt-1 text-h3 text-text-primary group-hover:text-accent">{product.name}</h3>
      <p className="mt-3 line-clamp-3 text-body text-text-secondary">{product.shortDescription ?? product.description ?? "Sports technology product profile."}</p>
      <div className="mt-5 flex flex-wrap gap-2">{product.technologies.slice(0, 3).map(({ technology }) => <Badge key={technology.id}>{technology.name}</Badge>)}{product.useCases.slice(0, 2).map(({ useCase }) => <Badge key={useCase.id}>{useCase.name}</Badge>)}</div>
      <span className="mt-auto pt-6 text-caption font-semibold text-accent">View product →</span>
    </Link>
  );
}

export function SectionHeader({ eyebrow, title, href, action }: { eyebrow?: string; title: string; href?: string; action?: string }) {
  return <div className="flex items-end justify-between gap-4"><div>{eyebrow && <p className="overline">{eyebrow}</p>}<h2 className="mt-2 text-h2 text-text-primary">{title}</h2></div>{href && <Link href={href} className="text-caption font-semibold text-accent hover:text-accent-hover">{action ?? "View all"} →</Link>}</div>;
}

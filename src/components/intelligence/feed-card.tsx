import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { FeedArticle } from "@/src/lib/feed";
import { getIntelligenceCategory } from "@/src/lib/intelligence-feed";
import { getEditorialImageUrl } from "@/src/utils/images";
import { StoryImage } from "./story-image";

export function LeadStory({ article }: { article: FeedArticle }) {
  const summary = getSummary(article);
  const imageUrl = getEditorialImageUrl(article.imageUrl);

  return (
    <article className={imageUrl ? "grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.9fr)] md:items-center md:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.95fr)]" : "max-w-4xl"}>
      <div>
        <CategoryLink article={article} />
        <h2 className="mt-3 font-display text-[2.25rem] font-semibold leading-[1.02] tracking-[-0.035em] text-text-primary sm:text-[2.75rem] lg:text-[3.2rem]">
          <Link href={`/article/${article.slug}`} className="decoration-1 underline-offset-4 hover:underline">
            {article.title}
          </Link>
        </h2>
        <p className="mt-4 line-clamp-3 max-w-2xl text-[1rem] leading-7 text-text-secondary sm:text-body-lg sm:leading-relaxed">{summary}</p>
        <ArticleMeta article={article} />
      </div>
      {imageUrl && (
        <Link href={`/article/${article.slug}`} className="relative order-first block aspect-[16/10] overflow-hidden border border-border bg-bg-elevated md:order-last">
          <StoryImage src={imageUrl} priority sizes="(max-width: 1024px) 100vw, 520px" />
        </Link>
      )}
    </article>
  );
}

export function SecondaryStory({ article }: { article: FeedArticle }) {
  const imageUrl = getEditorialImageUrl(article.imageUrl);

  return (
    <article className="grid grid-cols-[minmax(0,1fr)_7rem] gap-4 border-t border-border pt-5 sm:grid-cols-[minmax(0,1fr)_8rem]">
      <div className="min-w-0">
        <CategoryLink article={article} />
        <h3 className="mt-2 font-display text-[1.42rem] font-semibold leading-[1.14] tracking-[-0.015em] text-text-primary">
          <Link href={`/article/${article.slug}`} className="decoration-1 underline-offset-4 hover:underline">
            {article.title}
          </Link>
        </h3>
        <ArticleMeta article={article} compact />
      </div>
      {imageUrl ? (
        <Link href={`/article/${article.slug}`} className="relative block aspect-[4/3] overflow-hidden border border-border bg-bg-elevated">
          <StoryImage src={imageUrl} sizes="120px" />
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </article>
  );
}

export function FeedStory({
  article,
  showThumbnail = true,
}: {
  article: FeedArticle;
  showThumbnail?: boolean;
}) {
  const imageUrl = showThumbnail ? getEditorialImageUrl(article.imageUrl) : null;
  const hasImage = Boolean(imageUrl);

  return (
    <article className="group border-t border-border py-5 first:border-t-0 first:pt-0 sm:py-6">
      <div className={hasImage ? "grid grid-cols-[minmax(0,1fr)_6.75rem] gap-4 sm:grid-cols-[minmax(0,1fr)_8.5rem] sm:gap-6" : undefined}>
        <div className="min-w-0">
          <CategoryLink article={article} />
          <h3 className="mt-1.5 font-display text-[1.28rem] font-semibold leading-[1.18] tracking-[-0.01em] text-text-primary sm:text-[1.45rem]">
            <Link href={`/article/${article.slug}`} className="decoration-1 underline-offset-4 hover:underline">
              {article.title}
            </Link>
          </h3>
          <p className="mt-2 hidden max-w-3xl text-[0.95rem] leading-6 text-text-secondary sm:line-clamp-2">{getSummary(article)}</p>
          <ArticleMeta article={article} compact />
        </div>
        {imageUrl && (
          <Link href={`/article/${article.slug}`} className="relative block aspect-[4/3] overflow-hidden border border-border bg-bg-elevated">
            <StoryImage src={imageUrl} sizes="120px" />
          </Link>
        )}
      </div>
    </article>
  );
}

export const LatestIntelligenceCard = FeedStory;

function CategoryLink({ article }: { article: FeedArticle }) {
  const topic = getIntelligenceCategory(article.category.slug);
  const href = topic ? `/topics/${article.category.slug}` : `/category/${article.category.slug}`;

  return (
    <Link href={href} className="inline-flex min-h-6 items-center text-[0.68rem] font-bold uppercase tracking-[0.11em] text-accent hover:text-accent-hover">
      {article.category.name}
    </Link>
  );
}

function ArticleMeta({ article, compact = false }: { article: FeedArticle; compact?: boolean }) {
  return (
    <p className={`${compact ? "mt-2" : "mt-5"} text-caption text-text-tertiary`}>
      <span className="text-text-secondary">{article.source.name}</span>
      {" · "}
      <time dateTime={article.publishedAt.toISOString()}>
        {formatDistanceToNow(article.publishedAt, { addSuffix: true })}
      </time>
    </p>
  );
}

function getSummary(article: FeedArticle): string {
  const summary = article.aiSummary?.summary ?? article.excerpt ?? "Read the full report for details.";
  return summary.length > 280 ? `${summary.slice(0, 277).trimEnd()}…` : summary;
}

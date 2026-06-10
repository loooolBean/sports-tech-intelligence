import { getAdminNewsletterSubscribers, subscribeToNewsletter } from "../../../src/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const subscribers = await getAdminNewsletterSubscribers();

  return (
    <div>
      <h1 className="text-h1 text-text-primary">Newsletter</h1>
      <form action={subscribeToNewsletter} className="mt-6 flex max-w-xl gap-3 rounded-lg border border-border p-5">
        <input className="min-w-0 flex-1 rounded-md border border-border bg-bg-card px-3 py-2" name="email" placeholder="subscriber@example.com" type="email" required />
        <button className="rounded-md bg-accent hover:bg-accent-hover px-4 py-2 text-caption font-medium text-white" type="submit">
          Add
        </button>
      </form>
      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        {subscribers.map((subscriber) => (
          <div key={subscriber.id} className="flex items-center justify-between border-b border-border p-4 last:border-b-0">
            <div>
              <p className="font-medium text-text-primary">{subscriber.email}</p>
              <p className="text-body text-text-secondary">
                {subscriber.isActive ? "Active" : "Inactive"} · subscribed {subscriber.subscribedAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

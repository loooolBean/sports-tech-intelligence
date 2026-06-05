import { getAdminNewsletterSubscribers, subscribeToNewsletter } from "../../../src/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const subscribers = await getAdminNewsletterSubscribers();

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-950">Newsletter</h1>
      <form action={subscribeToNewsletter} className="mt-6 flex max-w-xl gap-3 rounded-lg border border-slate-200 p-5">
        <input className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2" name="email" placeholder="subscriber@example.com" type="email" required />
        <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white" type="submit">
          Add
        </button>
      </form>
      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
        {subscribers.map((subscriber) => (
          <div key={subscriber.id} className="flex items-center justify-between border-b border-slate-200 p-4 last:border-b-0">
            <div>
              <p className="font-medium text-slate-950">{subscriber.email}</p>
              <p className="text-sm text-slate-600">
                {subscriber.isActive ? "Active" : "Inactive"} · subscribed {subscriber.subscribedAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

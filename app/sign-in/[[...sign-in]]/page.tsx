import { SignIn } from "@clerk/nextjs";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ redirect_url?: string }> }) {
  const requested = (await searchParams).redirect_url ?? "/dashboard";
  const redirectUrl = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-5 py-10">
      <SignIn fallbackRedirectUrl={redirectUrl} signUpUrl="/sign-up" />
    </main>
  );
}

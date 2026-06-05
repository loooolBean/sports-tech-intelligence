import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-5 py-10">
      <SignIn fallbackRedirectUrl="/dashboard" signUpUrl="/sign-up" />
    </main>
  );
}

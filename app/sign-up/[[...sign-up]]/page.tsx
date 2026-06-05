import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-5 py-10">
      <SignUp fallbackRedirectUrl="/dashboard" signInUrl="/sign-in" />
    </main>
  );
}

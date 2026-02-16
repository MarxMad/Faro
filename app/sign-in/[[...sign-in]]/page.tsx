import { SignInGate } from "@/components/auth/sign-in-gate"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <SignInGate />
    </div>
  )
}

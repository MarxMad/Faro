import { SignUpGate } from "@/components/auth/sign-up-gate"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <SignUpGate />
    </div>
  )
}

"use client"

import Link from "next/link"
import {
  SignInButton as ClerkSignInButton,
  SignUpButton as ClerkSignUpButton,
  UserButton as ClerkUserButton,
} from "@clerk/nextjs"
import { useAuthConfig } from "@/components/providers/auth-provider"

type SignInButtonProps = React.ComponentProps<typeof ClerkSignInButton>
type SignUpButtonProps = React.ComponentProps<typeof ClerkSignUpButton>
type UserButtonProps = React.ComponentProps<typeof ClerkUserButton>

/**
 * Si Clerk no está configurado, renderiza el hijo como enlace a /sign-in.
 */
export function AuthSignInButton({ children, ...props }: SignInButtonProps) {
  const { clerkEnabled } = useAuthConfig()
  if (!clerkEnabled) {
    return <Link href="/sign-in">{children}</Link>
  }
  return <ClerkSignInButton {...props}>{children}</ClerkSignInButton>
}

/**
 * Si Clerk no está configurado, renderiza el hijo como enlace a /sign-up.
 */
export function AuthSignUpButton({ children, ...props }: SignUpButtonProps) {
  const { clerkEnabled } = useAuthConfig()
  if (!clerkEnabled) {
    return <Link href="/sign-up">{children}</Link>
  }
  return <ClerkSignUpButton {...props}>{children}</ClerkSignUpButton>
}

/**
 * Si Clerk no está configurado, no renderiza nada.
 */
export function AuthUserButton(props: UserButtonProps) {
  const { clerkEnabled } = useAuthConfig()
  if (!clerkEnabled) return null
  return <ClerkUserButton {...props} />
}

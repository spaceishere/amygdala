import Link from "next/link"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"

export default async function Navbar() {
  const session = await auth()

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-slate-900">
          LMS Platform
        </Link>
        
        <nav className="flex items-center gap-4">
          {session?.user ? (
             <>
                {session.user.role === "ADMIN" && (
                    <Link href="/admin">
                        <Button variant="ghost">Admin Dashboard</Button>
                    </Link>
                )}
                <span className="text-sm font-medium text-slate-600">
                    {session.user.name || session.user.email}
                </span>
                <Link href="/api/auth/signout">
                    <Button variant="outline" size="sm">Sign Out</Button>
                </Link>
             </>
          ) : (
             <>
                <Link href="/auth/login">
                    <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/auth/register">
                    <Button>Register</Button>
                </Link>
             </>
          )}
        </nav>
      </div>
    </header>
  )
}

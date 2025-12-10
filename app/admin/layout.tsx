import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Ensure Button is installed (shadcn)
import { LayoutDashboard, BookOpen, Users, LogOut } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">LMS Admin</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/admin">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-slate-800 hover:text-white"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/courses">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-slate-800 hover:text-white"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Courses
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-slate-800 hover:text-white"
            >
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
          </Link>
          <Link href="/admin/enrollments">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-slate-800 hover:text-white"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Enrollments
            </Button>
          </Link>
        </nav>
        <div className="p-4">
          <form
            action={async () => {
              "use server";
              // re-import signOut? or just redirect to api/auth/signout
              // actually easier to use a client component for signout or just a link
            }}
          >
            {/* For now just a link or form if using auth.ts signOut */}
          </form>
          <Link href="/api/auth/signout">
            <Button variant="destructive" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 p-8">{children}</main>
    </div>
  );
}

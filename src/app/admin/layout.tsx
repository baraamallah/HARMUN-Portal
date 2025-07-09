import { SidebarProvider, Sidebar, SidebarHeader, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarInset, SidebarContent } from "@/components/ui/sidebar";
import { Globe, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { AppHeader } from "@/components/header";
import { AppFooter } from "@/components/footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <div className="flex-grow">
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2 font-bold text-xl text-sidebar-primary font-headline p-2">
                    <Globe className="h-7 w-7" />
                    <span>HARMUN Admin</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton href="/admin" asChild>
                            <Link href="/admin">
                                <LayoutDashboard />
                                Dashboard
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <main className="p-4 sm:p-6 lg:p-8">
                {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
      <AppFooter />
    </div>
  );
}

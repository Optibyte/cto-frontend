'use client';

import { Sidebar, SidebarProvider } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Providers } from './providers';
import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { RouteGuard } from '@/components/auth/route-guard';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <RouteGuard>
            <SidebarProvider>
              <div className="flex h-screen">
                {!isAuthPage && <Sidebar />}
                <div className={cn(
                  "flex flex-1 flex-col overflow-x-hidden",
                  !isAuthPage && "md:pl-64"
                )}>
                  {!isAuthPage && <Header />}
                  <main className={cn(
                    "flex-1 overflow-y-auto bg-background",
                    !isAuthPage ? "p-4 md:p-6" : "p-0"
                  )}>
                    {children}
                  </main>
                </div>
              </div>
            </SidebarProvider>
          </RouteGuard>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { RoleProvider } from '@/contexts/role-context';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/redux/store';

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <ReduxProvider store={store}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
                    <RoleProvider>
                        {children}
                    </RoleProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ReduxProvider>
    );
}


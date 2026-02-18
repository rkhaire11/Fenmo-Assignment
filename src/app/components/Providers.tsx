'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                retry: 3, // Retry failed requests 3 times
                staleTime: 1000 * 60, // Data is fresh for 1 minute
            },
            mutations: {
                retry: 3, // Retry failed mutations (important for unreliable networks)
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

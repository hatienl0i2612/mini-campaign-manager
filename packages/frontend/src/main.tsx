import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store/index';
import { Toaster } from 'sonner';
import { App } from './App';
import './styles/index.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <App />
                    <Toaster position="top-right" richColors theme="dark" />
                </BrowserRouter>
            </QueryClientProvider>
        </Provider>
    </StrictMode>,
);

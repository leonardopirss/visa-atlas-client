import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles.css';
import { App } from './app/app';
import { AppStateProvider } from './app/app-state';
import { ShortlistProvider } from './features/shortlist/shortlist-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const root = document.getElementById('root');
if (root === null) throw new Error('Elemento raiz não encontrado.');

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ShortlistProvider>
        <AppStateProvider>
          <App />
        </AppStateProvider>
      </ShortlistProvider>
    </QueryClientProvider>
  </StrictMode>,
);

import { BrowserRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainLayout } from "./components/layout/MainLayout.js";
import { TimelinePage } from "./pages/TimelinePage.js";
import { FeedListPage } from "./pages/FeedListPage.js";
import { FeedDetailPage } from "./pages/FeedDetailPage.js";
import { FavoritesPage } from "./pages/FavoritesPage.js";
import { ReadLaterPage } from "./pages/ReadLaterPage.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<TimelinePage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="read-later" element={<ReadLaterPage />} />
            <Route path="feeds" element={<FeedListPage />} />
            <Route path="feeds/:id" element={<FeedDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import BrowsePage from '../pages/BrowsePage';
import NotFoundPage from '../pages/NotFoundPage';

// Secondary pages are code-split; Browse is the landing page so it stays in the main bundle.
const ExplorePage = lazy(() => import('../pages/ExplorePage'));
const MovieDetailPage = lazy(() => import('../pages/MovieDetailPage'));
const WishlistPage = lazy(() => import('../pages/WishlistPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<BrowsePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="movie/:id" element={<MovieDetailPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

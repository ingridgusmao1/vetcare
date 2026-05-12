import { Outlet } from 'react-router-dom';
import { Header } from '../components/organisms/Header';

// Layout for the public marketing site (landing page).
// <Outlet /> is the placeholder where react-router renders the matched child.
export function PublicLayout() {
  return (
    <>
      <a href="#main-content" className="skip-link">Aller au contenu principal</a>
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
    </>
  );
}
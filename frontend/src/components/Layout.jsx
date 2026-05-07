import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // On every route change, scrub any leftover Bootstrap modal artifacts so a
  // stale backdrop or body-lock can never freeze the page (e.g. after a
  // refresh that interrupted a modal-close animation).
  useEffect(() => {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
  }, [location.pathname]);

  return (
    <div className="ax-app">
      <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
      <div className="ax-content-wrapper">
        <Sidebar
          show={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="ax-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;

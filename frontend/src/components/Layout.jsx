import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

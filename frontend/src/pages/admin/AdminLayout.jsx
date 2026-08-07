import { useRef } from 'react';
import { NavLink, Link, Outlet } from 'react-router'; 
import {
  Menu, 
  LayoutDashboard, 
  List, 
  Users, 
  LogOut 
} from 'lucide-react'; // icon imports

const AdminLayout = () => {
  const drawerCheckboxRef = useRef(null);

  const closeMobileMenu = () => {
    if (drawerCheckboxRef.current && window.innerWidth < 1024) {
      drawerCheckboxRef.current.checked = false;
    }
  };

  const navLinkStyle = ({ isActive }) => `
    flex items-center gap-3 px-4 py-3 rounded-lg  font-medium
    ${isActive 
      ? 'bg-primary/10 text-primary border border-primary/20' 
      : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'
    }
  `;

  return (
    <div className="drawer lg:drawer-open bg-base-300 font-sans text-base-content">
      
      <input 
        id="admin-drawer" 
        type="checkbox" 
        className="drawer-toggle" 
        ref={drawerCheckboxRef} 
      />
      
      <div className="drawer-content flex flex-col h-screen overflow-hidden">
        
        {/* Mobile Navbar */}
        <div className="w-full navbar bg-base-200 border-b border-base-content/10 lg:hidden sticky top-0 z-20">
          <div className="flex-none">
            <label htmlFor="admin-drawer" aria-label="open sidebar" className="btn btn-square btn-ghost text-base-content/60 hover:text-base-content">
              <Menu className="w-6 h-6" /> {/* Lucide Icon */}
            </label>
          </div>
          <div className="flex-1 px-2 mx-2">
            <span className="text-xl font-bold text-base-content tracking-wide">
              On<span className="text-primary">code</span>
            </span>
          </div>
          <div className="flex-none">
            <Link to="/" className="text-sm text-primary hover:text-primary/80 font-medium px-2">Exit</Link>
          </div>
        </div>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto w-full relative">
          <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>

      {/* SIDEBAR AREA */}
      <div className="drawer-side z-50">
        <label htmlFor="admin-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        
        <aside className="w-72 min-h-full bg-base-200 border-r border-base-content/10 flex flex-col justify-between p-4">
          
          <div>
            {/* Desktop Header */}
            <div className="h-12 hidden lg:flex items-center px-4 mb-6 mt-2">
              <Link to="/" className="text-2xl font-bold text-base-content tracking-wide">
                On<span className="text-primary">code</span>
                <span className="ml-3 text-[10px] uppercase tracking-widest text-primary border border-primary/30 px-2 py-0.5 rounded bg-primary/10">
                  Admin
                </span>
              </Link>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              <NavLink end to="/admin" className={navLinkStyle} onClick={closeMobileMenu}>
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </NavLink>

              <NavLink to="/admin/problems" className={navLinkStyle} onClick={closeMobileMenu}>
                <List className="w-5 h-5" />
                Manage Problems
              </NavLink>

              <NavLink to="/admin/users" className={navLinkStyle} onClick={closeMobileMenu}>
                <Users className="w-5 h-5" />
                User Management
              </NavLink>
            </nav>
          </div>

          {/* Footer Exit Link */}
          <div className="border-t border-base-content/10 pt-4 mt-8">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 text-base-content/50 hover:text-error hover:bg-error/10 rounded-lg transition-colors font-medium">
              <LogOut className="w-5 h-5" />
              Exit Admin Panel
            </Link>
          </div>

        </aside>
      </div>
    </div>
  );
};

export default AdminLayout;
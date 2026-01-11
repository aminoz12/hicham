import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Settings, 
  LogOut,
  Tag
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function AdminSidebar() {
  const { signOut } = useAuth();

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/admin/products', icon: ShoppingBag, label: 'Produits' },
    { to: '/admin/orders', icon: Package, label: 'Commandes' },
    { to: '/admin/categories', icon: Tag, label: 'Catégories' },
    { to: '/admin/users', icon: Users, label: 'Utilisateurs' },
    { to: '/admin/settings', icon: Settings, label: 'Paramètres' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800">Hijabi Inoor Admin</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => signOut()}
          className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}


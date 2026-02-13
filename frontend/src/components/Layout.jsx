import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Truck, Users, Buildings, ClipboardText, SignOut, ChartBar, CalendarBlank } from 'phosphor-react';

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('google_token');
        navigate('/login');
    };

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: ChartBar },
        { name: 'Operações', path: '/operations', icon: ClipboardText },
        { name: 'Calendário', path: '/calendar', icon: CalendarBlank },
        { name: 'Veículos', path: '/vehicles', icon: Truck },
        { name: 'Funcionários', path: '/employees', icon: Users },
        { name: 'Empresas', path: '/companies', icon: Buildings },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-blue-600">Frelog</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 p-3 rounded-md transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon size={24} weight={isActive ? 'fill' : 'regular'} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 p-3 w-full text-left text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                        <SignOut size={24} />
                        <span className="font-medium">Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;

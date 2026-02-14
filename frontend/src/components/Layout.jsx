import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Truck, Users, Buildings, ClipboardText, SignOut, ChartBar, CalendarBlank, CaretLeft, CaretRight } from 'phosphor-react';

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();



    const [collapsed, setCollapsed] = React.useState(false);

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
            <aside
                className={`bg-white shadow-xl flex flex-col transition-all duration-300 ease-in-out relative z-10 ${collapsed ? 'w-20' : 'w-64'
                    }`}
            >
                <div className="p-4 border-b border-gray-200 flex items-center justify-between h-16">
                    {!collapsed && (
                        <h1 className="text-xl font-bold text-blue-600 animate-in fade-in duration-200 truncate">
                            Fretelog
                        </h1>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors ${collapsed ? 'mx-auto' : ''
                            }`}
                        title={collapsed ? "Expandir menu" : "Recolher menu"}
                    >
                        {collapsed ? <CaretRight size={20} /> : <CaretLeft size={20} />}
                    </button>
                </div>

                <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center p-3 rounded-lg transition-all duration-200 group relative ${isActive
                                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    } ${collapsed ? 'justify-center' : 'gap-3'}`}
                                title={collapsed ? item.name : ''}
                            >
                                <Icon
                                    size={24}
                                    weight={isActive ? 'fill' : 'regular'}
                                />

                                <span className={`font-medium whitespace-nowrap transition-all duration-300 origin-left ${collapsed
                                    ? 'w-0 opacity-0 overflow-hidden'
                                    : 'w-auto opacity-100'
                                    }`}>
                                    {item.name}
                                </span>

                                {/* Tooltip for collapsed state */}
                                {collapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-200 shadow-lg">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center p-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group relative ${collapsed ? 'justify-center' : 'gap-3 text-left'
                            }`}
                        title={collapsed ? "Sair" : ''}
                    >
                        <SignOut size={24} className="group-hover:scale-110 transition-transform duration-200" />
                        <span className={`font-medium whitespace-nowrap transition-all duration-300 origin-left ${collapsed
                            ? 'w-0 opacity-0 overflow-hidden'
                            : 'w-auto opacity-100'
                            }`}>
                            Sair
                        </span>

                        {collapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-200 shadow-lg">
                                Sair
                            </div>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 overflow-auto transition-all duration-300 ${location.pathname === '/calendar' ? '' : 'p-8'
                }`}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;

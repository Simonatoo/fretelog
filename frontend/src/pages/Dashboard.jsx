import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ChartBar, CurrencyDollar, TrendUp, TrendDown } from 'phosphor-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [employees, setEmployees] = useState([]);

    // Filter State
    const [dateFilter, setDateFilter] = useState('month'); // default to month
    const [selectedDriver, setSelectedDriver] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [dateFilter, selectedDriver]);

    const fetchInitialData = async () => {
        try {
            const empRes = await api.get('/employees');
            setEmployees(empRes.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Calculate dates based on filter
            const endDate = new Date();
            let startDate = new Date();

            if (dateFilter === 'fortnight') {
                startDate.setDate(endDate.getDate() - 15);
            } else if (dateFilter === 'month') {
                startDate.setMonth(endDate.getMonth() - 1);
            } else if (dateFilter === 'year') {
                startDate.setFullYear(endDate.getFullYear() - 1);
            }

            const params = {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                driverId: selectedDriver || undefined
            };

            const response = await api.get('/dashboard', { params });
            setData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full">Carregando...</div>;
    }

    if (!data) {
        return <div className="text-center text-red-500">Erro ao carregar dados.</div>;
    }

    const { stats, charts, recentOperations } = data;

    const StatCard = ({ title, value, color, subtext }) => (
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: color }}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
                    {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
                </div>
            </div>
        </div>
    );

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

                {/* Filters */}
                <div className="flex gap-4">
                    <select
                        className="border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    >
                        <option value="fortnight">Última Quinzena</option>
                        <option value="month">Último Mês</option>
                        <option value="year">Último Ano</option>
                    </select>

                    <select
                        className="border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        value={selectedDriver}
                        onChange={(e) => setSelectedDriver(e.target.value)}
                    >
                        <option value="">Todos os Motoristas</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total de Operações"
                    value={stats.totalOperations}
                    icon={ChartBar}
                    color="#3B82F6"
                />
                <StatCard
                    title="Receita Total"
                    value={formatCurrency(stats.totalRevenue)}
                    icon={TrendUp}
                    color="#10B981"
                />
                <StatCard
                    title="Custo Total"
                    value={formatCurrency(stats.totalCost)}
                    icon={TrendDown}
                    color="#EF4444"
                />
                <StatCard
                    title="Lucro Líquido"
                    value={formatCurrency(stats.netProfit)}
                    icon={CurrencyDollar}
                    color={stats.netProfit >= 0 ? "#10B981" : "#EF4444"}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Operações por Empresa</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={charts.opsByCompany}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" name="Operações" fill="#3B82F6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Operations */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Operações Recentes</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-500 border-b">
                                    <th className="pb-3 font-medium">Empresa</th>
                                    <th className="pb-3 font-medium">Data</th>
                                    <th className="pb-3 font-medium text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {recentOperations.map((op) => (
                                    <tr key={op.id}>
                                        <td className="py-3 text-gray-800">{op.company_name}</td>
                                        <td className="py-3 text-gray-600">
                                            {op.operation_date ? new Date(op.operation_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}
                                        </td>
                                        <td className="py-3 text-right font-medium text-gray-800">
                                            {formatCurrency(op.operation_value)}
                                        </td>
                                    </tr>
                                ))}
                                {recentOperations.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="text-center py-4 text-gray-500">Nenhuma operação recente.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

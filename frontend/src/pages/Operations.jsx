import React, { useState, useEffect } from 'react';
import api from '../services/api';
import EditableTable from '../components/EditableTable';
import Modal from '../components/Modal';
import { Plus, Funnel, X } from 'phosphor-react';

const Operations = () => {
    const [operations, setOperations] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        companyId: '',
        VehicleId: '',
        driverId: '',
        supportId: '',
        operation_value: '',
        operation_date: '',
        driver_value: '',
        support_value: '',
        estimated_time: '',
        status: 'Pending'
    });
    const [editingId, setEditingId] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    // Filter State
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        company_id: '',
        vehicle_id: '',
        driver_id: '',
        date_start: '',
        date_end: '',
        status: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [opsRes, compRes, vehRes, empRes] = await Promise.all([
                api.get('/operations'),
                api.get('/companies'),
                api.get('/vehicles'),
                api.get('/employees')
            ]);
            setOperations(opsRes.data);
            setCompanies(compRes.data);
            setVehicles(vehRes.data);
            setEmployees(empRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleOpenModal = (op = null) => {
        if (op) {
            setFormData({
                companyId: op.company_id,
                VehicleId: op.vehicle_id,
                driverId: op.driver_id,
                supportId: op.support_id || '',
                operation_value: op.operation_value,
                operation_date: op.operation_date ? new Date(op.operation_date).toISOString().slice(0, 16) : '', // Format for datetime-local
                driver_value: op.driver_value,
                support_value: op.support_value || '',
                estimated_time: op.estimated_time || '',
                status: op.status || 'Pending',
                toll: op.toll || ''
            });
            setEditingId(op.id);
        } else {
            setFormData({
                companyId: '',
                VehicleId: '',
                driverId: '',
                supportId: '',
                operation_value: '',
                operation_date: '',
                driver_value: '',
                support_value: '',
                estimated_time: '',
                status: 'Pending',
                toll: ''
            });
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                supportId: formData.supportId || null,
                support_value: formData.support_value || 0,
                toll: formData.toll || 0,
            };

            if (editingId) {
                await api.put(`/operations/${editingId}`, payload);
            } else {
                await api.post('/operations', payload);
            }
            fetchData(); // Refresh all data incase
            handleCloseModal();
        } catch (error) {
            console.error('Error saving operation:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir?')) {
            try {
                await api.delete(`/operations/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting operation:', error);
            }
        }
    };

    // Enhance operations with related names
    const enhancedOperations = operations.map(op => ({
        ...op,
        company_name: companies.find(c => String(c.id) === String(op.company_id))?.name || 'N/A',
        vehicle_plate: vehicles.find(v => String(v.id) === String(op.vehicle_id))?.plate || 'N/A',
        driver_name: employees.find(e => String(e.id) === String(op.driver_id))?.name || 'N/A',
        formatted_date: op.operation_date ? new Date(op.operation_date).toLocaleString('pt-BR', { timeZone: 'UTC' }) : 'N/A'
    }));

    const handleUpdateRow = async (id, key, value) => {
        try {

            const res = await api.put(`/operations/${id}`, { [key]: value });


            // Use server response to update local state (Source of Truth)
            setOperations(prev => prev.map(op => op.id === id ? res.data : op));

        } catch (error) {
            console.error('Error updating row:', error);
            alert('Erro ao atualizar registro. Verifique o console.');
        }
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            company_id: '',
            vehicle_id: '',
            driver_id: '',
            date_start: '',
            date_end: '',
            status: ''
        });
    };

    const filteredItems = React.useMemo(() => {
        return enhancedOperations.filter(op => {
            if (filters.company_id && String(op.company_id) !== String(filters.company_id)) return false;
            if (filters.vehicle_id && String(op.vehicle_id) !== String(filters.vehicle_id)) return false;
            if (filters.driver_id && String(op.driver_id) !== String(filters.driver_id)) return false;
            if (filters.status && op.status !== filters.status) return false;

            if (filters.date_start) {
                const opDate = new Date(op.operation_date);
                const startDate = new Date(filters.date_start);
                // Reset time for comparison
                startDate.setHours(0, 0, 0, 0);
                if (opDate < startDate) return false;
            }

            if (filters.date_end) {
                const opDate = new Date(op.operation_date);
                const endDate = new Date(filters.date_end);
                // Set to end of day
                endDate.setHours(23, 59, 59, 999);
                if (opDate > endDate) return false;
            }

            return true;
        });
    }, [enhancedOperations, filters]);

    const sortedOperations = React.useMemo(() => {
        let sortableItems = [...filteredItems];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle special sort keys that map to names instead of IDs
                if (sortConfig.key === 'company_id') {
                    aValue = a.company_name;
                    bValue = b.company_name;
                } else if (sortConfig.key === 'vehicle_id') {
                    aValue = a.vehicle_plate;
                    bValue = b.vehicle_plate;
                } else if (sortConfig.key === 'driver_id') {
                    aValue = a.driver_name;
                    bValue = b.driver_name;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredItems, sortConfig]);

    const columns = [
        {
            key: 'company_id',
            label: 'Empresa',
            type: 'select',
            options: companies.map(c => ({ value: c.id, label: c.name })),
            sortable: true
        },
        {
            key: 'vehicle_id',
            label: 'Veículo',
            type: 'select',
            options: vehicles.map(v => ({ value: v.id, label: v.plate })),
            sortable: true
        },
        {
            key: 'driver_id',
            label: 'Motorista',
            type: 'select',
            options: employees.map(e => ({ value: e.id, label: e.name })),
            sortable: true
        },
        { key: 'support_id', label: 'Ajudante', type: 'select', options: employees.map(e => ({ value: e.id, label: e.name })), nullable: true },
        { key: 'operation_value', label: 'Valor Frete', type: 'number', sortable: true },
        { key: 'driver_value', label: 'Valor Motorista', type: 'number' },
        { key: 'support_value', label: 'Valor Ajudante', type: 'number' },
        { key: 'toll', label: 'Pedágio', type: 'number' },
        { key: 'operation_date', label: 'Data/Hora', type: 'datetime' },
        { key: 'estimated_time', label: 'Tempo Estimado', type: 'text' },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'Pending', label: 'Pendente' },
                { value: 'Completed', label: 'Concluído' },
                { value: 'Canceled', label: 'Cancelado' }
            ],
            sortable: true
        }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Operações</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors border ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                        <Funnel size={20} weight={showFilters ? "fill" : "regular"} />
                        Filtros
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Nova Operação
                    </button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Filtros Avançados</h2>
                        <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline">
                            Limpar Filtros
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Empresa</label>
                            <select
                                name="company_id"
                                value={filters.company_id}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="">Todas</option>
                                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Veículo</label>
                            <select
                                name="vehicle_id"
                                value={filters.vehicle_id}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="">Todos</option>
                                {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Motorista</label>
                            <select
                                name="driver_id"
                                value={filters.driver_id}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="">Todos</option>
                                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="">Todos</option>
                                <option value="Pending">Pendente</option>
                                <option value="Completed">Concluído</option>
                                <option value="Canceled">Cancelado</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Data Início</label>
                            <input
                                type="date"
                                name="date_start"
                                value={filters.date_start}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Data Fim</label>
                            <input
                                type="date"
                                name="date_end"
                                value={filters.date_end}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            />
                        </div>
                    </div>
                </div>
            )}

            <EditableTable
                columns={columns}
                data={sortedOperations}
                onUpdate={handleUpdateRow}
                onDelete={handleDelete}
                onSort={handleSort}
                sortConfig={sortConfig}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingId ? 'Editar Operação' : 'Nova Operação'}
            >
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Empresa</label>
                        <select
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.companyId}
                            onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                        >
                            <option value="">Selecione...</option>
                            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Veículo</label>
                        <select
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.VehicleId}
                            onChange={(e) => setFormData({ ...formData, VehicleId: e.target.value })}
                        >
                            <option value="">Selecione...</option>
                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Motorista</label>
                        <select
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.driverId}
                            onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                        >
                            <option value="">Selecione...</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ajudante (Opcional)</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.supportId}
                            onChange={(e) => setFormData({ ...formData, supportId: e.target.value })}
                        >
                            <option value="">Nenhum/Selecione...</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data e Hora da Operação</label>
                        <input
                            type="datetime-local"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.operation_date}
                            onChange={(e) => setFormData({ ...formData, operation_date: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Valor Operação</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.operation_value}
                            onChange={(e) => setFormData({ ...formData, operation_value: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Valor Motorista</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.driver_value}
                            onChange={(e) => setFormData({ ...formData, driver_value: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Valor Ajudante</label>
                        <input
                            type="number"
                            step="0.01"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.support_value}
                            onChange={(e) => setFormData({ ...formData, support_value: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="Pending">Pendente</option>
                            <option value="Completed">Concluído</option>
                            <option value="Canceled">Cancelado</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Valor Pedágio (Opcional)</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.toll}
                            onChange={(e) => setFormData({ ...formData, toll: e.target.value })}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Tempo Estimado</label>
                        <input
                            type="text"
                            placeholder="Ex: 2 horas"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.estimated_time}
                            onChange={(e) => setFormData({ ...formData, estimated_time: e.target.value })}
                        />
                    </div>

                    <div className="md:col-span-2 flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="mr-3 px-4 py-2 text-gray-700 hover:text-gray-900"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                        >
                            Salvar
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Operations;

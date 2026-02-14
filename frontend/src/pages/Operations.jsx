import React, { useState, useEffect } from 'react';
import api from '../services/api';
import EditableTable from '../components/EditableTable';
import Modal from '../components/Modal';
import { Plus } from 'phosphor-react';

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
            console.log(`Sending update for ID ${id}: ${key} = ${value}`);
            const res = await api.put(`/operations/${id}`, { [key]: value });
            console.log('Update response:', res.data);

            // Use server response to update local state (Source of Truth)
            setOperations(prev => prev.map(op => op.id === id ? res.data : op));

        } catch (error) {
            console.error('Error updating row:', error);
            alert('Erro ao atualizar registro. Verifique o console.');
        }
    };

    const columns = [
        {
            key: 'company_id',
            label: 'Empresa',
            type: 'select',
            options: companies.map(c => ({ value: c.id, label: c.name }))
        },
        {
            key: 'vehicle_id',
            label: 'Veículo',
            type: 'select',
            options: vehicles.map(v => ({ value: v.id, label: v.plate }))
        },
        {
            key: 'driver_id',
            label: 'Motorista',
            type: 'select',
            options: employees.map(e => ({ value: e.id, label: e.name }))
        },
        { key: 'support_id', label: 'Ajudante', type: 'select', options: employees.map(e => ({ value: e.id, label: e.name })) },
        { key: 'operation_value', label: 'Valor Frete', type: 'number' },
        { key: 'driver_value', label: 'Valor Motorista', type: 'number' },
        { key: 'support_value', label: 'Valor Ajudante', type: 'number' },
        { key: 'toll', label: 'Pedágio', type: 'number' },
        { key: 'operation_date', label: 'Data/Hora', type: 'datetime' },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'Pending', label: 'Pendente' },
                { value: 'Completed', label: 'Concluído' },
                { value: 'Canceled', label: 'Cancelado' }
            ]
        }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Operações</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Nova Operação
                </button>
            </div>

            <EditableTable
                columns={columns}
                data={enhancedOperations}
                onUpdate={handleUpdateRow}
                onDelete={handleDelete}
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

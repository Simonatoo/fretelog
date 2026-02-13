import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Plus } from 'phosphor-react';

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ plate: '', km: '', vehicle_type_id: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchVehicles();
        fetchVehicleTypes();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/vehicles');
            setVehicles(response.data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        }
    };

    const fetchVehicleTypes = async () => {
        try {
            const response = await api.get('/vehicles-types');
            setVehicleTypes(response.data);
        } catch (error) {
            console.error('Error fetching vehicle types:', error);
        }
    };

    const handleOpenModal = (vehicle = null) => {
        if (vehicle) {
            setFormData({
                plate: vehicle.plate,
                km: vehicle.km,
                vehicle_type_id: vehicle.vehicle_type_id
            });
            setEditingId(vehicle.id);
        } else {
            setFormData({ plate: '', km: '', vehicle_type_id: '' });
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ plate: '', km: '', vehicle_type_id: '' });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/vehicles/${editingId}`, formData);
            } else {
                await api.post('/vehicles', formData);
            }
            fetchVehicles();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving vehicle:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir?')) {
            try {
                await api.delete(`/vehicles/${id}`);
                fetchVehicles();
            } catch (error) {
                console.error('Error deleting vehicle:', error);
            }
        }
    };

    // Enhance vehicle data with type name for display
    const enhancedVehicles = vehicles.map(v => ({
        ...v,
        type_name: vehicleTypes.find(t => t.id === v.vehicle_type_id)?.name || 'N/A'
    }));

    const columns = [
        { key: 'plate', label: 'Placa' },
        { key: 'km', label: 'KM' },
        { key: 'type_name', label: 'Tipo' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Veículos</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Novo Veículo
                </button>
            </div>

            <Table
                columns={columns}
                data={enhancedVehicles}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingId ? 'Editar Veículo' : 'Novo Veículo'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Placa</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.plate}
                            onChange={(e) => {
                                let v = e.target.value.toUpperCase();
                                v = v.replace(/[^A-Z0-9]/g, ""); // Keep only Alphanumeric

                                if (v.length > 7) v = v.substr(0, 7); // Limit 7 chars

                                // Mask AAA-9999 or AAA-9A99
                                if (v.length > 3) {
                                    v = v.replace(/^([A-Z0-9]{3})([A-Z0-9]+)/, "$1-$2");
                                }

                                setFormData({ ...formData, plate: v });
                            }}
                            maxLength={8}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">KM</label>
                        <input
                            type="number"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.km}
                            onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Veículo</label>
                        <select
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.vehicle_type_id}
                            onChange={(e) => setFormData({ ...formData, vehicle_type_id: e.target.value })}
                        >
                            <option value="">Selecione um tipo</option>
                            {vehicleTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end pt-4">
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

export default Vehicles;

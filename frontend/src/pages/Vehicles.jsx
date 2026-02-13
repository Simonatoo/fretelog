import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Plus, Trash, PencilSimple } from 'phosphor-react';
import truckImg from '../assets/truck.png';
import carImg from '../assets/car.png';
import motorImg from '../assets/motor.png';

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ plate: '', km: '', vehicle_type_id: '', status: 'Active' });
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
                vehicle_type_id: vehicle.vehicle_type_id,
                status: vehicle.status || 'Active'
            });
            setEditingId(vehicle.id);
        } else {
            setFormData({ plate: '', km: '', vehicle_type_id: '', status: 'Active' });
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ plate: '', km: '', vehicle_type_id: '', status: 'Active' });
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

    // Enhance vehicle data with type name
    const enhancedVehicles = vehicles.map(v => ({
        ...v,
        type_name: vehicleTypes.find(t => t.id === v.vehicle_type_id)?.name || 'N/A'
    }));

    // Helper to get image filename based on type
    const getVehicleImage = (typeName) => {
        // Normalize string to check
        const type = (typeName || '').toLowerCase();

        if (type.includes('caminhão') || type.includes('truck')) {
            return truckImg;
        } else if (type.includes('moto')) {
            return motorImg;
        } else {
            // Default to Car
            return carImg;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'Active': return 'Disponível';
            case 'Driving': return 'Na rua';
            case 'Maintenance': return 'Manutenção';
            default: return status;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-700'; // Disponível
            case 'Driving': return 'bg-blue-100 text-blue-700'; // Na rua
            case 'Maintenance': return 'bg-yellow-100 text-yellow-700'; // Manutenção
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-2xl font-bold text-gray-800">Veículos</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Novo Veículo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                {enhancedVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="bg-white rounded-xl shadow-lg p-6 relative flex flex-col justify-between hover:shadow-xl transition-shadow border border-gray-100 group">

                        {/* Status Badge */}
                        <div className={`absolute top-4 left-4 px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(vehicle.status || 'Active')}`}>
                            {getStatusLabel(vehicle.status || 'Active')}
                        </div>

                        {/* Pop-out Image Effect */}
                        <div className="absolute -top-12 right-4 w-24 h-24 transition-transform group-hover:scale-110 duration-300">
                            {/*
                                Placeholder for user images.
                                Assumes images are in /public folder.
                                Styling: Drop shadow to make it pop.
                             */}
                            <img
                                src={getVehicleImage(vehicle.type_name)}
                                alt={vehicle.type_name}
                                className="w-full h-full object-contain drop-shadow-2xl"
                                onError={(e) => {
                                    e.target.style.display = 'none'; // Hide if image missing
                                    // wrapper could show a fallback icon if we wanted, but user asked for space for images
                                }}
                            />
                        </div>

                        <div className="mt-8">
                            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{vehicle.type_name}</h3>
                            <h2 className="text-3xl font-black text-gray-800 tracking-tight">{vehicle.plate}</h2>

                            <div className="mt-6 flex items-center gap-2 text-gray-600 bg-gray-50 p-3 rounded-lg w-fit">
                                <span className="text-xs font-semibold uppercase text-gray-400">Quilometragem</span>
                                <span className="font-mono text-lg font-bold text-gray-700">{vehicle.km} km</span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4">
                            <button
                                onClick={() => handleOpenModal(vehicle)}
                                className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                                title="Editar"
                            >
                                <PencilSimple size={20} />
                            </button>
                            <button
                                onClick={() => handleDelete(vehicle.id)}
                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                                title="Excluir"
                            >
                                <Trash size={20} />
                            </button>
                        </div>
                    </div>
                ))}

                {enhancedVehicles.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-10">
                        Nenhum veículo cadastrado.
                    </div>
                )}
            </div>

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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-lg font-mono uppercase"
                            value={formData.plate}
                            onChange={(e) => {
                                let v = e.target.value.toUpperCase();
                                v = v.replace(/[^A-Z0-9]/g, "");
                                if (v.length > 7) v = v.substr(0, 7);
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="Active">Disponível</option>
                            <option value="Driving">Na rua</option>
                            <option value="Maintenance">Manutenção</option>
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

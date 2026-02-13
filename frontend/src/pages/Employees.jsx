import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Plus } from 'phosphor-react';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', cpf: '', cnpj: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const handleOpenModal = (employee = null) => {
        if (employee) {
            setFormData({ name: employee.name, phone: employee.phone, cpf: employee.cpf, cnpj: employee.cnpj || '' });
            setEditingId(employee.id);
        } else {
            setFormData({ name: '', phone: '', cpf: '', cnpj: '' });
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ name: '', phone: '', cpf: '', cnpj: '' });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/employees/${editingId}`, formData);
            } else {
                await api.post('/employees', formData);
            }
            fetchEmployees();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving employee:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir?')) {
            try {
                await api.delete(`/employees/${id}`);
                fetchEmployees();
            } catch (error) {
                console.error('Error deleting employee:', error);
            }
        }
    };

    const columns = [
        { key: 'name', label: 'Nome' },
        { key: 'phone', label: 'Telefone' },
        { key: 'cpf', label: 'CPF' },
        { key: 'cnpj', label: 'CNPJ' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Funcionários</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Novo Funcionário
                </button>
            </div>

            <Table
                columns={columns}
                data={employees}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingId ? 'Editar Funcionário' : 'Novo Funcionário'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Telefone</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.phone}
                            onChange={(e) => {
                                let v = e.target.value;
                                v = v.replace(/\D/g, ""); // Remove non-digits

                                // Limit to 13 chars max (55 + 2 area + 9 phone)
                                if (v.length > 13) v = v.substr(0, 13);

                                // Apply formatting: +55 11 96766-5711
                                if (v.length > 0) {
                                    // Formatting logic
                                    v = v.replace(/^(\d{2})(\d)/, "+$1 $2"); // +55 
                                    v = v.replace(/(\d{2})(\d)/, "$1 $2"); // +55 11
                                    v = v.replace(/(\d{5})(\d)/, "$1-$2"); // +55 11 96766-5711
                                }

                                setFormData({ ...formData, phone: v });
                            }}
                            maxLength={19}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">CPF</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.cpf}
                            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">CNPJ (Opcional)</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.cnpj}
                            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                        />
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

export default Employees;

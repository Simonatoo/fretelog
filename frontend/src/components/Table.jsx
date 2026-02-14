import React, { useState } from 'react';
import { PencilSimple, Trash, CaretLeft, CaretRight } from 'phosphor-react';

const Table = ({ columns, data, onEdit, onDelete }) => {
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    return (
        <div className="bg-white rounded-lg shadow border border-gray-200 flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} className="px-4 py-3 border-b border-r border-gray-300 last:border-r-0">
                                    {col.label}
                                </th>
                            ))}
                            <th className="px-4 py-3 border-b border-gray-300 text-center w-24">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.length > 0 ? (
                            data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    {columns.map((col) => (
                                        <td key={`${item.id}-${col.key}`} className="p-0 border-b border-r border-gray-200 last:border-r-0 relative">
                                            <div className="w-full h-full min-h-[1.5rem] px-2 py-1">
                                                {item[col.key]}
                                            </div>
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 border-b border-gray-200 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => onEdit(item)}
                                                className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                                                title="Editar"
                                            >
                                                <PencilSimple size={18} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(item.id)}
                                                className="text-red-600 hover:text-red-800 transition-colors p-1"
                                                title="Excluir"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-gray-500">
                                    Nenhum registro encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Mostrar</span>
                    <select
                        value={rowsPerPage}
                        onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="p-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                        {[5, 10, 25, 50, 100].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize}
                            </option>
                        ))}
                    </select>
                    <span>por página</span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                        {Math.min((currentPage - 1) * rowsPerPage + 1, data.length)} - {Math.min(currentPage * rowsPerPage, data.length)} de {data.length}
                    </span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`p-1.5 border rounded-md transition-colors ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-blue-600 border-gray-300'}`}
                            title="Anterior"
                        >
                            <CaretLeft size={16} weight="bold" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(data.length / rowsPerPage)))}
                            disabled={currentPage >= Math.ceil(data.length / rowsPerPage)}
                            className={`p-1.5 border rounded-md transition-colors ${currentPage >= Math.ceil(data.length / rowsPerPage) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-blue-600 border-gray-300'}`}
                            title="Próxima"
                        >
                            <CaretRight size={16} weight="bold" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Table;

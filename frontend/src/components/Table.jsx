import React from 'react';
import { PencilSimple, Trash } from 'phosphor-react';

const Table = ({ columns, data, onEdit, onDelete }) => {
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className="px-6 py-4 border-b border-gray-200">
                                {col.label}
                            </th>
                        ))}
                        <th className="px-6 py-4 border-b border-gray-200 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.length > 0 ? (
                        data.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                {columns.map((col) => (
                                    <td key={`${item.id}-${col.key}`} className="px-6 py-4 text-gray-700 text-sm">
                                        {item[col.key]}
                                    </td>
                                ))}
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(item)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        title="Editar"
                                    >
                                        <PencilSimple size={20} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash size={20} />
                                    </button>
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
    );
};

export default Table;

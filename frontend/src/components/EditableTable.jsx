import React, { useState, useEffect, useRef } from 'react';
import { Trash } from 'phosphor-react';

const EditableTable = ({ columns, data, onUpdate, onDelete }) => {
    const [editingCell, setEditingCell] = useState({ rowId: null, colKey: null });
    const [tempValue, setTempValue] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (editingCell.rowId !== null && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingCell]);

    const handleCellClick = (row, col) => {
        if (col.editable !== false) {
            setEditingCell({ rowId: row.id, colKey: col.key });
            setTempValue(row[col.key]);
        }
    };

    const handleInputChange = (e) => {
        setTempValue(e.target.value);
    };

    const handleKeyDown = (e, row, col) => {
        if (e.key === 'Enter') {
            saveEdit(row, col);
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    };

    const saveEdit = (row, col) => {
        if (tempValue !== row[col.key]) {
            onUpdate(row.id, col.key, tempValue);
        }
        setEditingCell({ rowId: null, colKey: null });
    };

    const cancelEdit = () => {
        setEditingCell({ rowId: null, colKey: null });
        setTempValue('');
    };

    const renderCellContent = (row, col) => {
        const isEditing = editingCell.rowId === row.id && editingCell.colKey === col.key;

        if (isEditing) {
            if (col.type === 'select') {
                return (
                    <select
                        ref={inputRef}
                        value={tempValue}
                        onChange={handleInputChange}
                        onBlur={() => saveEdit(row, col)}
                        onKeyDown={(e) => handleKeyDown(e, row, col)}
                        className="w-full p-1 border-2 border-blue-500 rounded focus:outline-none"
                    >
                        {col.options.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );
            } else if (col.type === 'date') {
                return (
                    <input
                        ref={inputRef}
                        type="date"
                        value={tempValue ? tempValue.split('T')[0] : ''}
                        onChange={handleInputChange}
                        onBlur={() => saveEdit(row, col)}
                        onKeyDown={(e) => handleKeyDown(e, row, col)}
                        className="w-full p-1 border-2 border-blue-500 rounded focus:outline-none"
                    />
                );
            }
            else {
                return (
                    <input
                        ref={inputRef}
                        type={col.type === 'number' ? 'number' : 'text'}
                        value={tempValue}
                        onChange={handleInputChange}
                        onBlur={() => saveEdit(row, col)}
                        onKeyDown={(e) => handleKeyDown(e, row, col)}
                        className="w-full p-1 border-2 border-blue-500 rounded focus:outline-none"
                        step={col.type === 'number' ? "0.01" : undefined}
                    />
                );
            }
        }

        // Display value
        let displayValue = row[col.key];

        // Handle select display (show label instead of value if possible, or use a formatter)
        if (col.type === 'select') {
            const option = col.options.find(opt => String(opt.value) === String(displayValue));
            if (option) displayValue = option.label;
            // If not found in options (maybe it's a raw value or unrelated key), fall back to row's display key if provided
            else if (col.displayKey) displayValue = row[col.displayKey];
        }

        // Handle date display
        if (col.type === 'date' && displayValue) {
            displayValue = new Date(displayValue).toLocaleDateString();
        }

        // Handle currency/number display
        if (col.type === 'number' && displayValue !== '' && !isNaN(displayValue)) {
            displayValue = `R$ ${parseFloat(displayValue).toFixed(2)}`;
        }

        return (
            <div
                className={`w-full h-full min-h-[1.5rem] px-2 py-1 cursor-pointer hover:bg-gray-100 ${col.editable === false ? '' : 'border border-transparent hover:border-gray-300'}`}
                onClick={() => handleCellClick(row, col)}
            >
                {displayValue}
            </div>
        );
    };

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className="px-4 py-3 border-b border-r border-gray-300 last:border-r-0">
                                {col.label}
                            </th>
                        ))}
                        <th className="px-4 py-3 border-b border-gray-300 text-center w-16">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {data.length > 0 ? (
                        data.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                {columns.map((col) => (
                                    <td key={`${item.id}-${col.key}`} className="p-0 border-b border-r border-gray-200 last:border-r-0 relative">
                                        {renderCellContent(item, col)}
                                    </td>
                                ))}
                                <td className="px-2 py-2 border-b border-gray-200 text-center">
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        className="text-red-600 hover:text-red-800 transition-colors p-1"
                                        title="Excluir"
                                    >
                                        <Trash size={18} />
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

export default EditableTable;

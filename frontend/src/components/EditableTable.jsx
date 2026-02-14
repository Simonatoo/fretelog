import React, { useState, useEffect, useRef } from 'react';
import { Trash, CalendarBlank, CaretUp, CaretDown, ArrowsDownUp, CaretLeft, CaretRight } from 'phosphor-react';

const EditableTable = ({ columns, data, onUpdate, onDelete, onSort, sortConfig }) => {
    const [editingCell, setEditingCell] = useState({ rowId: null, colKey: null });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    // ... (skip unchanged lines)

    const [tempValue, setTempValue] = useState('');
    const inputRef = useRef(null);
    const dateInputRef = useRef(null); // Ref for hidden date picker

    useEffect(() => {
        if (editingCell.rowId !== null && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingCell]);

    // Helper to format Date -> dd/mm/yyyy
    const formatDateToBr = (isoString) => {
        if (!isoString) return '';
        const datePart = new Date(isoString).toISOString().split('T')[0];
        const [year, month, day] = datePart.split('-');
        return `${day}/${month}/${year}`;
    };

    // Helper to format Date -> dd/mm/yyyy HH:mm
    const formatDateTimeToBr = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        // Adjust for timezone if needed, but keeping it simple for now or using UTC
        const day = String(d.getUTCDate()).padStart(2, '0');
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const year = d.getUTCFullYear();
        const hours = String(d.getUTCHours()).padStart(2, '0');
        const minutes = String(d.getUTCMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    // Helper to format yyyy-mm-dd -> dd/mm/yyyy
    const formatYmdToBr = (ymdString) => {
        if (!ymdString) return '';
        const [year, month, day] = ymdString.split('-');
        return `${day}/${month}/${year}`;
    };

    const handleCellClick = (row, col) => {
        if (col.editable !== false) {
            setEditingCell({ rowId: row.id, colKey: col.key });

            let initialValue = row[col.key] !== null && row[col.key] !== undefined ? row[col.key] : '';

            // If date or datetime, convert ISO to respective format for text editing
            if (col.type === 'date' && initialValue) {
                initialValue = formatDateToBr(initialValue);
            } else if (col.type === 'datetime' && initialValue) {
                initialValue = formatDateTimeToBr(initialValue);
            }

            setTempValue(initialValue);
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
        let finalValue = tempValue;

        // Sanitize number inputs: replace comma with dot
        if (col.type === 'number' && finalValue) {
            finalValue = finalValue.toString().replace(',', '.');
        }

        // Handle Date Saving: Convert dd/mm/yyyy back to yyyy-mm-dd for API
        if (col.type === 'date' && finalValue) {
            // Check if matches dd/mm/yyyy
            const brDatePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
            const match = finalValue.match(brDatePattern);
            if (match) {
                const day = match[1];
                const month = match[2];
                const year = match[3];
                finalValue = `${year}-${month}-${day}`; // ISO format for API
            }
        }


        // Handle DateTime Saving: Convert dd/mm/yyyy HH:mm back to ISO
        if (col.type === 'datetime' && finalValue) {
            // Pattern: dd/mm/yyyy HH:mm
            const brDateTimePattern = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/;
            const match = finalValue.match(brDateTimePattern);
            if (match) {
                const day = match[1];
                const month = match[2];
                const year = match[3];
                const hours = match[4];
                const minutes = match[5];
                finalValue = `${year}-${month}-${day}T${hours}:${minutes}:00.000Z`; // ISO format
            }
        }

        if (finalValue !== row[col.key]) {
            onUpdate(row.id, col.key, finalValue);
        }
        setEditingCell({ rowId: null, colKey: null });
    };

    const cancelEdit = () => {
        setEditingCell({ rowId: null, colKey: null });
        setTempValue('');
    };

    const handleDateIconClick = (e) => {
        e.stopPropagation(); // Prevent bubbling causing blur issues
        if (dateInputRef.current) {
            // Try showPicker (modern browsers)
            if (dateInputRef.current.showPicker) {
                dateInputRef.current.showPicker();
            } else {
                // Fallback for older browsers (focus might trigger it on mobile)
                dateInputRef.current.focus();
            }
        }
    };

    const handleHiddenDateChange = (e) => {
        // e.target.value is yyyy-mm-dd
        const newValue = e.target.value;
        if (newValue) {
            if (editingCell.colKey && columns.find(c => c.key === editingCell.colKey)?.type === 'datetime') {
                // For datetime-local, value is yyyy-mm-ddThh:mm
                const dateObj = new Date(newValue);
                // Format manually to dd/mm/yyyy HH:mm
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const year = dateObj.getFullYear();
                const hours = String(dateObj.getHours()).padStart(2, '0');
                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                setTempValue(`${day}/${month}/${year} ${hours}:${minutes}`);
            } else {
                // Date only
                setTempValue(formatYmdToBr(newValue));
            }
            // Keep focus on the text input
            if (inputRef.current) inputRef.current.focus();
        }
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
            } else if (col.type === 'date' || col.type === 'datetime') {
                const isDateTime = col.type === 'datetime';
                const maskLength = isDateTime ? 16 : 10;
                return (
                    <div className="relative w-full flex items-center">
                        <input
                            ref={inputRef}
                            type="text"
                            value={tempValue}
                            placeholder={isDateTime ? "dd/mm/aaaa hh:mm" : "dd/mm/aaaa"}
                            onChange={(e) => {
                                let v = e.target.value;
                                v = v.replace(/\D/g, "");
                                // Apply mask
                                if (isDateTime) {
                                    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/, "$1/$2");
                                    if (v.length > 5) v = v.replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
                                    if (v.length > 10) v = v.replace(/^(\d{2})\/(\d{2})\/(\d{4})(\d)/, "$1/$2/$3 $4");
                                    if (v.length > 13) v = v.replace(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2})(\d)/, "$1/$2/$3 $4:$5");
                                    if (v.length > 16) v = v.substr(0, 16);
                                } else {
                                    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/, "$1/$2");
                                    if (v.length > 5) v = v.replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
                                    if (v.length > 10) v = v.substr(0, 10);
                                }
                                setTempValue(v);
                            }}
                            onBlur={() => saveEdit(row, col)}
                            onKeyDown={(e) => handleKeyDown(e, row, col)}
                            className="w-full p-1 pr-8 border-2 border-blue-500 rounded focus:outline-none"
                            maxLength={maskLength}
                        />
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleDateIconClick}
                            className="absolute right-2 text-gray-500 hover:text-blue-600 focus:outline-none"
                            tabIndex="-1"
                        >
                            <CalendarBlank size={18} />
                        </button>
                        {/* Hidden date input for picker */}
                        <input
                            ref={dateInputRef}
                            type={isDateTime ? "datetime-local" : "date"}
                            className="absolute top-0 left-0 w-0 h-0 opacity-0 pointer-events-none"
                            onChange={handleHiddenDateChange}
                            tabIndex="-1"
                        />
                    </div>
                );
            }
            else {
                return (
                    <input
                        ref={inputRef}
                        type="text" // Use text for everything to allow free typing (commas etc)
                        value={tempValue}
                        onChange={handleInputChange}
                        onBlur={() => saveEdit(row, col)}
                        onKeyDown={(e) => handleKeyDown(e, row, col)}
                        className="w-full p-1 border-2 border-blue-500 rounded focus:outline-none"
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
            displayValue = new Date(displayValue).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } else if (col.type === 'datetime' && displayValue) {
            displayValue = new Date(displayValue).toLocaleString('pt-BR', { timeZone: 'UTC' });
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
        <div className="bg-white rounded-lg shadow border border-gray-200 flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`px-4 py-3 border-b border-r border-gray-300 last:border-r-0 ${col.sortable ? 'cursor-pointer hover:bg-gray-200' : ''}`}
                                    onClick={() => col.sortable && onSort && onSort(col.key)}
                                >
                                    <div className="flex items-center justify-between gap-1">
                                        {col.label}
                                        {col.sortable && sortConfig && (
                                            <span className="text-gray-500">
                                                {sortConfig.key === col.key ? (
                                                    sortConfig.direction === 'ascending' ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />
                                                ) : (
                                                    <ArrowsDownUp size={14} weight="bold" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th className="px-4 py-3 border-b border-gray-300 text-center w-16">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.length > 0 ? (
                            data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((item) => (
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
        </div >
    );
};

export default EditableTable;

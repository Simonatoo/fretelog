import React, { useState, useRef, useEffect } from 'react';
import { CaretDown, CheckSquare, Square } from 'phosphor-react';

const MultiSelect = ({ label, options, selectedIds, onChange, onToggleAll }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const allSelected = options.length > 0 && selectedIds.size === options.length;

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                type="button"
            >
                <span className="text-sm font-medium text-gray-700">
                    {label} {selectedIds.size > 0 && `(${selectedIds.size})`}
                </span>
                <CaretDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-gray-100 bg-gray-50">
                        <div
                            className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-md transition-colors"
                            onClick={onToggleAll}
                        >
                            {allSelected ? (
                                <CheckSquare size={20} className="text-blue-600" weight="fill" />
                            ) : (
                                <Square size={20} className="text-gray-400" />
                            )}
                            <span className="text-sm font-medium text-gray-700">Selecionar Todos</span>
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto p-1">
                        {options.map((option) => {
                            const isSelected = selectedIds.has(option.id);
                            return (
                                <div
                                    key={option.id}
                                    className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-md transition-colors"
                                    onClick={() => onChange(option.id)}
                                >
                                    {isSelected ? (
                                        <CheckSquare size={20} className="text-blue-600" weight="fill" />
                                    ) : (
                                        <Square size={20} className="text-gray-400" />
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-700">{option.label}</span>
                                        {option.subLabel && (
                                            <span className="text-xs text-gray-500">{option.subLabel}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiSelect;

import React, { useState, useEffect } from 'react';
import { CaretLeft, CaretRight, CheckSquare, Square } from 'phosphor-react';
import api from '../services/api';

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [operations, setOperations] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedVehicleIds, setSelectedVehicleIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [selectedOperation, setSelectedOperation] = useState(null);
    const [editFormData, setEditFormData] = useState({
        company_id: '',
        driver_id: '',
        support_id: '',
        vehicle_id: '',
        date: '',
        time: '',
        status: '',
        operation_value: '',
        driver_value: '',
        support_value: ''
    });
    const [resizeState, setResizeState] = useState(null); // { opId, startY, startHeight, startTop, currentHeight, currentTop, direction }

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [opsResponse, vehiclesResponse, companiesResponse, employeesResponse] = await Promise.all([
                api.get('/operations'),
                api.get('/vehicles'),
                api.get('/companies'),
                api.get('/employees')
            ]);

            setOperations(opsResponse.data);
            setVehicles(vehiclesResponse.data);
            setCompanies(companiesResponse.data);
            setEmployees(employeesResponse.data);

            // Initially select all vehicles
            const allVehicleIds = new Set(vehiclesResponse.data.map(v => v.id));
            setSelectedVehicleIds(allVehicleIds);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const toggleVehicle = (id) => {
        const newSelected = new Set(selectedVehicleIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedVehicleIds(newSelected);
    };

    const toggleAllVehicles = () => {
        if (selectedVehicleIds.size === vehicles.length) {
            setSelectedVehicleIds(new Set());
        } else {
            setSelectedVehicleIds(new Set(vehicles.map(v => v.id)));
        }
    };

    // Helper: Get start of the week (Sunday)
    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    };

    // Helper: Add days to a date
    const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    // Helper: Format hour
    const formatTimeLabel = (hour) => {
        if (hour === 0) return '';
        if (hour === 12) return '12 PM';
        return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
    };

    const startOfWeek = getStartOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const handlePrevWeek = () => setCurrentDate(addDays(currentDate, -7));
    const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));
    const handleToday = () => setCurrentDate(new Date());

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    // Filter operations
    const getFilteredOperations = () => {
        const start = startOfWeek;
        const end = addDays(start, 7);

        return operations.filter(op => {
            const opDate = new Date(op.operation_date);
            // Check date range
            if (opDate < start || opDate >= end) return false;
            // Check vehicle filter
            // Assuming operation has vehicle_id or vehicle object with id
            // If op.vehicle_id is not present, showing it might depend on requirements. 
            // For now, if it has a vehicle, we filter. If no vehicle assigned, maybe show it?
            // Let's assume strict filtering: must have vehicle_id and be in set.
            if (op.vehicle_id && !selectedVehicleIds.has(op.vehicle_id)) return false;

            return true;
        });
    };

    const getOperationStyle = (operation) => {
        const opDate = new Date(operation.operation_date);
        const dayIndex = opDate.getUTCDay();
        const startHour = opDate.getUTCHours();
        const startMin = opDate.getUTCMinutes();

        const hourHeight = 80; // matches h-20 class
        const top = (startHour * hourHeight) + ((startMin / 60) * hourHeight);

        const durationHours = parseFloat(operation.estimated_time) || 1;
        const height = durationHours * hourHeight;

        // Width calculation needs to account for the grid
        // Container width is 100% of the grid area
        // Column width is approx 1/8th (12.5%) but first col is w-16 fixed
        // Simplification: We use absolute positioning relative to the grid container
        // Left = TimeColWidth + (DayIndex * DayColWidth)
        // TimeCol is w-16 (4rem = 64px)
        // Remaining width is (100% - 64px)
        // Day width is (100% - 64px) / 7

        const leftOffset = `calc(4rem + ((100% - 4rem) / 7 * ${dayIndex}))`;
        const width = `calc((100% - 4rem) / 7 - 4px)`; // -4px for gap

        // Override height/top if resizing
        const displayHeight = (resizeState && resizeState.opId === operation.id)
            ? resizeState.currentHeight
            : height;

        const displayTop = (resizeState && resizeState.opId === operation.id && resizeState.currentTop !== undefined)
            ? resizeState.currentTop
            : top;

        return {
            top: `${displayTop}px`,
            left: leftOffset,
            height: `${displayHeight}px`,
            width: width,
            position: 'absolute',
            zIndex: (resizeState && resizeState.opId === operation.id) ? 50 : 10
        };
    };

    // Resize Logic
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!resizeState) return;
            const deltaY = e.clientY - resizeState.startY;

            if (resizeState.direction === 'bottom') {
                let newHeight = resizeState.startHeight + deltaY;
                if (newHeight < 20) newHeight = 20;
                setResizeState(prev => ({ ...prev, currentHeight: newHeight }));
            }
            else if (resizeState.direction === 'top') {
                let newTop = resizeState.startTop + deltaY;
                let newHeight = resizeState.startHeight - deltaY;

                // Min height check
                if (newHeight < 20) {
                    // Don't allow moving top further down if height is min
                    newHeight = 20;
                    newTop = resizeState.startTop + (resizeState.startHeight - 20);
                }

                setResizeState(prev => ({ ...prev, currentHeight: newHeight, currentTop: newTop }));
            }
        };

        const handleMouseUp = async (e) => {
            if (!resizeState) return;

            const hourHeight = 80;
            let updatedOp = { ...operations.find(o => o.id === resizeState.opId) };
            const payload = {};

            // Calculate new duration
            const newDuration = resizeState.currentHeight / hourHeight;
            const formattedDuration = newDuration.toFixed(2);
            updatedOp.estimated_time = formattedDuration;
            payload.estimated_time = formattedDuration;

            // If top resize, calculate new start time
            if (resizeState.direction === 'top') {
                const totalHours = resizeState.currentTop / hourHeight;
                const newStartHour = Math.floor(totalHours);
                const newStartMin = Math.round((totalHours - newStartHour) * 60);

                const originalDate = new Date(updatedOp.operation_date);
                // Set UTC time because that's how we parse it for display
                originalDate.setUTCHours(newStartHour, newStartMin, 0, 0);

                updatedOp.operation_date = originalDate.toISOString();
                payload.operation_date = originalDate.toISOString();
            }

            setResizeState(null);

            try {
                // Optimistic update
                setOperations(prev => prev.map(op => op.id === resizeState.opId ? updatedOp : op));
                await api.put(`/operations/${resizeState.opId}`, payload);
            } catch (error) {
                console.error('Error resizing operation:', error);
                alert('Erro ao redimensionar operação');
                fetchData(); // Revert
            }
        };

        if (resizeState) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizeState, operations]);

    const handleResizeStart = (e, op, direction) => {
        e.stopPropagation(); // Don't open edit modal
        e.preventDefault();

        const element = e.target.parentElement;
        const rect = element.getBoundingClientRect();
        // We need the relative top (offsetTop) for calculations, not client rect top
        // But element.offsetTop is relative to parent.
        const startTop = element.offsetTop;

        setResizeState({
            opId: op.id,
            direction,
            startY: e.clientY,
            startHeight: rect.height,
            startTop: startTop,
            currentHeight: rect.height,
            currentTop: startTop
        });
    };

    const getCompanyName = (id) => {
        const company = companies.find(c => c.id === id);
        return company ? company.name : 'Empresa não encontrada';
    };

    const getVehicleColor = (vehicleId) => {
        const colors = [
            { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-900', subtext: 'text-red-800' },
            { bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-900', subtext: 'text-orange-800' },
            { bg: 'bg-amber-100', border: 'border-amber-500', text: 'text-amber-900', subtext: 'text-amber-800' },
            { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-900', subtext: 'text-green-800' },
            { bg: 'bg-emerald-100', border: 'border-emerald-500', text: 'text-emerald-900', subtext: 'text-emerald-800' },
            { bg: 'bg-teal-100', border: 'border-teal-500', text: 'text-teal-900', subtext: 'text-teal-800' },
            { bg: 'bg-cyan-100', border: 'border-cyan-500', text: 'text-cyan-900', subtext: 'text-cyan-800' },
            { bg: 'bg-sky-100', border: 'border-sky-500', text: 'text-sky-900', subtext: 'text-sky-800' },
            { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-900', subtext: 'text-blue-800' },
            { bg: 'bg-indigo-100', border: 'border-indigo-500', text: 'text-indigo-900', subtext: 'text-indigo-800' },
            { bg: 'bg-violet-100', border: 'border-violet-500', text: 'text-violet-900', subtext: 'text-violet-800' },
            { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-900', subtext: 'text-purple-800' },
            { bg: 'bg-fuchsia-100', border: 'border-fuchsia-500', text: 'text-fuchsia-900', subtext: 'text-fuchsia-800' },
            { bg: 'bg-pink-100', border: 'border-pink-500', text: 'text-pink-900', subtext: 'text-pink-800' },
            { bg: 'bg-rose-100', border: 'border-rose-500', text: 'text-rose-900', subtext: 'text-rose-800' },
        ];

        if (!vehicleId) return colors[8]; // Default to blue
        const index = vehicleId % colors.length;
        return colors[index];
    };

    const handleOperationClick = (e, op) => {
        e.stopPropagation(); // Prevent bubbling if needed
        setSelectedOperation(op);

        // Parse date for inputs
        const opDate = new Date(op.operation_date);
        // We use local time for the inputs to match what the user sees on the calendar (which uses UTC methods but displays as if it was local time... wait)
        // The calendar uses getUTCHours() to position.
        // So we should extract UTC parts to populate the inputs as "local" values.
        const year = opDate.getUTCFullYear();
        const month = String(opDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(opDate.getUTCDate()).padStart(2, '0');
        const hour = String(opDate.getUTCHours()).padStart(2, '0');
        const minute = String(opDate.getUTCMinutes()).padStart(2, '0');

        setEditFormData({
            company_id: op.company_id || '',
            driver_id: op.driver_id || '',
            support_id: op.support_id || '',
            vehicle_id: op.vehicle_id || '',
            date: `${year}-${month}-${day}`,
            time: `${hour}:${minute}`,
            status: op.status || '',
            operation_value: op.operation_value || '',
            driver_value: op.driver_value || '',
            support_value: op.support_value || ''
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveOperation = async () => {
        if (!selectedOperation) return;

        try {
            // Construct ISO date from date and time inputs
            // We treat the input date/time as UTC to maintain consistency with how we read it
            const [year, month, day] = editFormData.date.split('-').map(Number);
            const [hours, minutes] = editFormData.time.split(':').map(Number);

            // Create date using UTC
            const newDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));

            const updatedOp = {
                ...selectedOperation,
                company_id: editFormData.company_id,
                driver_id: editFormData.driver_id,
                support_id: editFormData.support_id,
                vehicle_id: editFormData.vehicle_id,
                operation_date: newDate.toISOString(),
                status: editFormData.status,
                operation_value: editFormData.operation_value,
                driver_value: editFormData.driver_value,
                support_value: editFormData.support_value
            };

            await api.put(`/operations/${selectedOperation.id}`, updatedOp);

            // Update local state to reflect changes immediately (optimistic or re-fetch)
            setOperations(prev => prev.map(op => op.id === selectedOperation.id ? updatedOp : op));

            // Also fetch to be sure
            fetchData();

            setSelectedOperation(null);
        } catch (error) {
            console.error('Error saving operation:', error);
            alert('Erro ao salvar operação.');
        }
    };

    const filteredOperations = getFilteredOperations();

    return (
        <div className="flex h-[calc(100vh-100px)] gap-4">
            {/* Sidebar Filters */}
            <div className="w-64 bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Veículos</h2>

                <div
                    className="flex items-center gap-2 mb-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                    onClick={toggleAllVehicles}
                >
                    {selectedVehicleIds.size === vehicles.length ? (
                        <CheckSquare size={20} className="text-blue-600" weight="fill" />
                    ) : (
                        <Square size={20} className="text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-700">Selecionar Todos</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1">
                    {vehicles.map(vehicle => (
                        <div
                            key={vehicle.id}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                            onClick={() => toggleVehicle(vehicle.id)}
                        >
                            {selectedVehicleIds.has(vehicle.id) ? (
                                <CheckSquare size={20} className="text-blue-600" weight="fill" />
                            ) : (
                                <Square size={20} className="text-gray-400" />
                            )}
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-700 font-medium">{vehicle.plate}</span>
                                <span className="text-xs text-gray-500 capitalize">{vehicle.type}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Calendar Area */}
            <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {startOfWeek.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </h1>
                        <div className="flex items-center gap-2">
                            <button onClick={handlePrevWeek} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <CaretLeft size={20} />
                            </button>
                            <button onClick={handleToday} className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                                Hoje
                            </button>
                            <button onClick={handleNextWeek} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <CaretRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex flex-1 overflow-auto">
                    <div className="min-w-[800px] w-full relative">
                        {/* Week Header */}
                        <div className="grid grid-cols-[4rem_repeat(7,1fr)] border-b border-gray-200 sticky top-0 bg-white z-20">
                            <div className="border-r border-gray-100"></div>
                            {weekDays.map((day) => {
                                const today = isToday(day);
                                return (
                                    <div key={day.toString()} className={`text-center py-3 border-r border-gray-100 ${today ? 'bg-blue-50' : ''}`}>
                                        <div className={`text-xs font-semibold uppercase ${today ? 'text-blue-600' : 'text-gray-500'}`}>
                                            {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                                        </div>
                                        <div className={`text-xl font-bold mt-1 ${today ? 'text-blue-600' : 'text-gray-800'}`}>
                                            {day.getDate()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Time Slots & Operations */}
                        <div className="relative">
                            {hours.map((hour) => (
                                <div key={hour} className="grid grid-cols-[4rem_repeat(7,1fr)] h-20 group">
                                    <div className="border-r border-gray-100 text-right pr-2 text-xs text-gray-400 font-medium -mt-2.5 relative">
                                        {formatTimeLabel(hour)}
                                    </div>
                                    {weekDays.map((day) => (
                                        <div key={`${day.toISOString()}-${hour}`} className="border-r border-b border-gray-100 relative hover:bg-gray-50 transition-colors"></div>
                                    ))}
                                </div>
                            ))}

                            {/* Operations Overlay */}
                            {filteredOperations.map((op) => {
                                const color = getVehicleColor(op.vehicle_id);
                                return (
                                    <div
                                        key={op.id}
                                        onClick={(e) => handleOperationClick(e, op)}
                                        style={getOperationStyle(op)}
                                        className={`${color.bg} ${color.border} border-l-4 rounded-r-sm p-1 shadow-sm cursor-pointer hover:shadow-md transition-shadow z-10 overflow-hidden text-xs absolute`}
                                        title={`${op.name || 'Operação'} - ${op.client}`}
                                    >
                                        <div className={`font-bold ${color.text} truncate`}>{getCompanyName(op.company_id)}</div>

                                        {/* Top Resize Handle */}
                                        <div
                                            className="absolute top-0 left-0 w-full h-2 cursor-ns-resize hover:bg-black/10 z-20"
                                            onMouseDown={(e) => handleResizeStart(e, op, 'top')}
                                        ></div>

                                        <p className={`${color.text} truncate`}>R$ {op.operation_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                        <div className="mt-1">
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${op.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                op.status === 'Pending' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {op.status === 'Pending' ? 'Na rua' : op.status === 'Completed' ? 'Concluído' : 'Cancelado'}
                                            </span>
                                        </div>
                                        <div className={`${color.subtext} truncate`}>{op.client}</div>

                                        {/* Bottom Resize Handle */}
                                        <div
                                            className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-black/10 z-20"
                                            onMouseDown={(e) => handleResizeStart(e, op, 'bottom')}
                                        ></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Operations editable */}
            {selectedOperation && (
                <div className='flex flex-col gap-3 p-4 rounded-lg bg-white shadow-md border border-gray-200 w-80 shrink-0 h-fit'>
                    <div className="flex justify-between items-center mb-2">
                        <h1 className='text-lg font-bold text-gray-800'>Editar Operação</h1>
                        <button onClick={() => setSelectedOperation(null)} className="text-gray-400 hover:text-gray-600">
                            X
                        </button>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600">Operação</label>
                        <select
                            name="company_id"
                            value={editFormData.company_id}
                            onChange={handleEditChange}
                            className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white'
                        >
                            <option value="">Selecione a empresa</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600">Motorista</label>
                        <select
                            name="driver_id"
                            value={editFormData.driver_id}
                            onChange={handleEditChange}
                            className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white'
                        >
                            <option value="">Selecione o motorista</option>
                            {employees.map(e => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600">Ajudante</label>
                        <select
                            name="support_id"
                            value={editFormData.support_id}
                            onChange={handleEditChange}
                            className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white'
                        >
                            <option value="">Selecione o ajudante (opcional)</option>
                            {employees.map(e => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600">Veículo</label>
                        <select
                            name="vehicle_id"
                            value={editFormData.vehicle_id}
                            onChange={handleEditChange}
                            className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white'
                        >
                            <option value="">Selecione um veículo</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.plate} - {v.type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600">Valor Frete</label>
                        <input
                            name="operation_value"
                            value={editFormData.operation_value}
                            onChange={handleEditChange}
                            type='number'
                            step="0.01"
                            placeholder='0.00'
                            className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
                        />
                    </div>

                    <div className="flex gap-2">
                        <div className="flex flex-col gap-1 flex-1">
                            <label className="text-xs font-semibold text-gray-600">Valor Motorista</label>
                            <input
                                name="driver_value"
                                value={editFormData.driver_value}
                                onChange={handleEditChange}
                                type='number'
                                step="0.01"
                                placeholder='0.00'
                                className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
                            />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            <label className="text-xs font-semibold text-gray-600">Valor Ajudante</label>
                            <input
                                name="support_value"
                                value={editFormData.support_value}
                                onChange={handleEditChange}
                                type='number'
                                step="0.01"
                                placeholder='0.00'
                                className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="flex flex-col gap-1 flex-1">
                            <label className="text-xs font-semibold text-gray-600">Data</label>
                            <input
                                name="date"
                                value={editFormData.date}
                                onChange={handleEditChange}
                                type='date'
                                className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
                            />
                        </div>
                        <div className="flex flex-col gap-1 w-24">
                            <label className="text-xs font-semibold text-gray-600">Hora</label>
                            <input
                                name="time"
                                value={editFormData.time}
                                onChange={handleEditChange}
                                type='time'
                                className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600">Status</label>
                        <select
                            name="status"
                            value={editFormData.status}
                            onChange={handleEditChange}
                            className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white'
                        >
                            <option value="Pending">Pendente</option>
                            <option value="Completed">Concluído</option>
                            <option value="Canceled">Cancelado</option>
                        </select>
                    </div>

                    <button
                        onClick={handleSaveOperation}
                        className='w-full p-2 mt-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 font-medium transition-colors shadow-sm'
                    >
                        Salvar Alterações
                    </button>
                </div>
            )}
        </div>
    );
};

export default Calendar;
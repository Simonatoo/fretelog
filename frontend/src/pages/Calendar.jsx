import React, { useState, useEffect } from 'react';
import { CaretLeft, CaretRight, CheckSquare, Square } from 'phosphor-react';
import api from '../services/api';

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [operations, setOperations] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [selectedVehicleIds, setSelectedVehicleIds] = useState(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [opsResponse, vehiclesResponse, companiesResponse] = await Promise.all([
                api.get('/operations'),
                api.get('/vehicles'),
                api.get('/companies')
            ]);

            setOperations(opsResponse.data);
            setVehicles(vehiclesResponse.data);
            setCompanies(companiesResponse.data);

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
            const opDate = new Date(op.date);
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
        const dayIndex = opDate.getDay();
        const startHour = opDate.getHours();
        const startMin = opDate.getMinutes();

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

        const leftOffset = `calc(4rem + ((100% - 3rem) / 7 * ${dayIndex}))`;
        const width = `calc((100% - 4rem) / 7 - 4px)`; // -4px for gap

        return {
            top: `${top}px`,
            left: leftOffset,
            height: `${height}px`,
            width: width,
            position: 'absolute'
        };
    };

    const getCompanyName = (id) => {
        const company = companies.find(c => c.id === id);
        return company ? company.name : 'Empresa não encontrada';
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
                        <div className="grid grid-cols-8 border-b border-gray-200 sticky top-0 bg-white z-20">
                            <div className="w-16 border-r border-gray-100"></div>
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
                                <div key={hour} className="grid grid-cols-8 h-20 group">
                                    <div className="w-16 border-r border-gray-100 text-right pr-2 text-xs text-gray-400 font-medium -mt-2.5 relative">
                                        {formatTimeLabel(hour)}
                                    </div>
                                    {weekDays.map((day) => (
                                        <div key={`${day.toISOString()}-${hour}`} className="border-r border-b border-gray-100 relative hover:bg-gray-50 transition-colors"></div>
                                    ))}
                                </div>
                            ))}

                            {/* Operations Overlay */}
                            {filteredOperations.map((op) => (
                                console.log(op),
                                <div
                                    key={op.id}
                                    style={getOperationStyle(op)}
                                    className="bg-blue-100 border-l-4 border-blue-500 rounded-r-sm p-1 shadow-sm cursor-pointer hover:shadow-md transition-shadow z-10 overflow-hidden text-xs absolute"
                                    title={`${op.name || 'Operação'} - ${op.client}`}
                                >
                                    <div className="font-bold text-blue-900 truncate">{getCompanyName(op.company_id)}</div>
                                    <div className="text-blue-800 truncate">{op.client}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
import React, { useState } from 'react';
import { CaretLeft, CaretRight } from 'phosphor-react';

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

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

    // Helper: Format date (DD/MM)
    const formatDate = (date) => {
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    // Helper: Format hours (HH:00)
    const formatHour = (hour) => {
        return `${hour.toString().padStart(2, '0')}:00`;
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

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {startOfWeek.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevWeek}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <CaretLeft size={20} />
                        </button>
                        <button
                            onClick={handleToday}
                            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Hoje
                        </button>
                        <button
                            onClick={handleNextWeek}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <CaretRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex flex-1 overflow-auto">
                <div className="min-w-[800px] w-full">
                    {/* Week Header */}
                    <div className="grid grid-cols-8 border-b border-gray-200 sticky top-0 bg-white z-10">
                        {/* Time Column Header (Empty) */}
                        <div className="w-16 border-r border-gray-100"></div>

                        {/* Days Headers */}
                        {weekDays.map((day) => (
                            <div
                                key={day.toString()}
                                className={`text-center py-3 border-r border-gray-100 ${isToday(day) ? 'bg-blue-50' : ''}`}
                            >
                                <div className={`text-xs font-semibold uppercase ${isToday(day) ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                                </div>
                                <div className={`text-xl font-bold mt-1 ${isToday(day) ? 'text-blue-600' : 'text-gray-800'}`}>
                                    {day.getDate()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Time Slots */}
                    <div className="relative">
                        {hours.map((hour) => (
                            <div key={hour} className="grid grid-cols-8 h-20 group">
                                {/* Time Label */}
                                <div className="w-16 border-r border-gray-100 text-right pr-2 text-xs text-gray-400 font-medium -mt-2.5 relative">
                                    {hour !== 0 && formatHour(hour)}
                                </div>

                                {/* Day Cells */}
                                {weekDays.map((day) => (
                                    <div
                                        key={`${day.toISOString()}-${hour}`}
                                        className="border-r border-b border-gray-100 relative hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => console.log(`Clicked ${day.toLocaleDateString()} at ${hour}:00`)}
                                    >
                                        {/* Future: Droppable area for operations */}
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Current Time Indicator logic could go here */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
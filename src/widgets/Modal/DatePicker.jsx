"use client";

import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Spanish } from "flatpickr/dist/l10n/es";

export function DatePicker({ 
    value, 
    onChange, 
    placeholder, 
    minDate,  // Nueva prop para fecha mínima
    maxDate,  // Nueva prop para fecha máxima
    ...props 
}) {
    const inputRef = useRef(null);
    const fpRef = useRef(null);

    useEffect(() => {
        if (!inputRef.current) return;
        
        const options = {
            locale: Spanish,
            dateFormat: "Y-m-d",
            defaultDate: value,
            static: true,
            appendTo: document.body,
            onChange: (selectedDates, dateStr) => {
                onChange(dateStr);
            },
        };
        
        // Agregar restricciones de fecha si existen
        if (minDate) options.minDate = minDate;
        if (maxDate) options.maxDate = maxDate;
        
        fpRef.current = flatpickr(inputRef.current, options);

        return () => {
            fpRef.current?.destroy();
            fpRef.current = null;
        };
    }, [minDate, maxDate]); // Dependencias para actualizar cuando cambian las restricciones

    // Actualizar fecha cuando cambia el valor
    useEffect(() => {
        if (fpRef.current && value) {
            fpRef.current.setDate(value);
        }
    }, [value]);

    return (
        <div className="relative w-full">
            <input
                ref={inputRef}
                type="text"
                className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder={placeholder}
                data-input
                {...props}
            />
        </div>
    );
}
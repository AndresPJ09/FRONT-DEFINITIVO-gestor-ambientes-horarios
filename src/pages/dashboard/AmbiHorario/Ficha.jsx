"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTableComponent from "@/widgets/datatable/data-table";
import { Service } from "@/data/api";
import { CheckIcon, PlusIcon, TrashIcon } from "lucide-react";
import { DynamicModal } from "@/widgets/Modal/DynamicModal";
import Swal from "sweetalert2";

export function TableFicha() {
    const [data, setData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const [dataPrograma, setDataPrograma] = useState([]);
    const [dataProyecto, setDataProyecto] = useState([]);
    const [formData, setFormData] = useState({});

    // Agregar este useEffect para inicializar formData
    useEffect(() => {
        if (isModalOpen) {
            setFormData(selectedRow || {});
        }
    }, [isModalOpen, selectedRow]);

    // Función mejorada para manejar cambios
    const handleInputChange = (name, value) => {
        const newFormData = { ...formData, [name]: value };

        // Validación cruzada de fechas
        if (name === 'fecha_inicio' || name === 'fecha_fin' || name === 'fin_lectiva') {
            const fechaInicio = newFormData.fecha_inicio ? new Date(newFormData.fecha_inicio) : null;
            const fechaFin = newFormData.fecha_fin ? new Date(newFormData.fecha_fin) : null;
            const finLectiva = newFormData.fin_lectiva ? new Date(newFormData.fin_lectiva) : null;

            // Validar que fecha fin no sea anterior a inicio
            if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
                showNotification('red', 'La fecha fin no puede ser anterior a la fecha inicio');
                return;
            }

            // Validar que fin lectiva no sea anterior a fecha fin
            if (fechaFin && finLectiva && finLectiva < fechaFin) {
                showNotification('red', 'El fin lectiva no puede ser anterior a la fecha fin');
                return;
            }

            // Calcular semanas si ambas fechas son válidas
            if (fechaInicio && fechaFin && fechaFin >= fechaInicio) {
                const diffTime = Math.abs(fechaFin - fechaInicio);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                newFormData.numero_semanas = Math.ceil(diffDays / 7);
            }
        }

        setFormData(newFormData);
    };

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await Service.get("/ficha/");
            setData(response || []);
        } catch (error) {
            console.error("Error al obtener las fichas:", error);
            setError("Error al cargar los datos. Intente de nuevo más tarde.");
            setData([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchPrograma = async () => {
        try {
            const response = await Service.get("/programa/")

            setDataPrograma(response.map((item) => ({
                value: item.id,
                label: item.nombre,
            }))
            )
        } catch (error) {
            console.error("Error al obtener los programas:", error)
            setDataPrograma([])
        }
    }

    const fetchProyecto = async () => {
        try {
            const response = await Service.get("/proyecto/")

            setDataProyecto(response.map((item) => ({
                value: item.id,
                label: item.nombre,
            }))
            )
        } catch (error) {
            console.error("Error al obtener los proyectos:", error)
            setDataProyecto([])
        }
    }

    useEffect(() => {
        fetchData();
        fetchPrograma()
        fetchProyecto()
    }, []);

    const handleAction = (row) => {
        setSelectedRow(row);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRow(null);
        setFormData((prevFormData) => ({
            ...prevFormData,
            fecha_inicio: "",
            fecha_fin: "",
            fin_lectiva: "",
        }));
    };

    document.addEventListener("DOMContentLoaded", function () {
        function calcularSemanas() {
            const startDateInput = document.querySelector("[name='fecha_inicio']");
            const endDateInput = document.querySelector("[name='fecha_fin']");
            const weeksInput = document.querySelector("[name='numero_semanas']");

            if (startDateInput && endDateInput && weeksInput) {
                const startDate = new Date(startDateInput.value);
                const endDate = new Date(endDateInput.value);

                if (!isNaN(startDate) && !isNaN(endDate) && endDate >= startDate) {
                    const differenceInTime = endDate - startDate;
                    const differenceInWeeks = Math.floor(differenceInTime / (1000 * 60 * 60 * 24 * 7));
                    weeksInput.value = differenceInWeeks;
                } else {
                    weeksInput.value = "";
                }
            }
        }

        document.body.addEventListener("change", function (event) {
            if (event.target.name === "fecha_inicio" || event.target.name === "fecha_fin") {
                calcularSemanas();
            }
        });
    });



    const showNotification = (type, message) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 5000)
    }

    const handleSubmit = async (formData) => {
        const fechaInicio = new Date(formData.fecha_inicio);
        const fechaFin = new Date(formData.fecha_fin);

        if (fechaFin < fechaInicio) {
            showNotification('red', 'La fecha fin no puede ser anterior a la fecha inicio');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            if (selectedRow) {
                await Service.put(`/ficha/${selectedRow.id}/`, formData);
                Swal.fire({
                    title: "Ficha actualizado",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                });
            } else {
                await Service.post("/ficha/", { ...formData, estado: true });
                Swal.fire({
                    title: "Ficha creado",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                });
            }

            await fetchData();
            handleCloseModal();
        } catch (error) {
            Swal.fire({
                title: "Error al guardar el ficha",
                text: error,
                icon: "error",
                showConfirmButton: false,
                timer: 1500,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (row) => {
        Swal.fire({
            title: "¿Estás seguro de eliminar esta ficha?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await Service.delete(`/ficha/${row.id}/`);
                    Swal.fire({
                        title: "Ficha eliminada",
                        icon: "success",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                    setData((prevData) => prevData.filter((item) => item.id !== row.id));
                } catch (error) {
                    console.error("Error al eliminar el ficha:", error);
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo eliminar el ficha. Por favor, inténtalo de nuevo más tarde.",
                        icon: "error",
                        position: "bottom-right",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                }
            }
        });
    };

    const modalFields = [
        { name: "codigo", label: "Código", type: "text" },
        { name: "programa_id", label: "ID del programa", type: "select", options: dataPrograma },
        { name: "proyecto_id", label: "ID del proyecto", type: "select", options: dataProyecto, colSpan: 2 },
        { name: "fecha_inicio", label: "Fecha inicio", type: "date" },
        { name: "fecha_fin", label: "Fecha fin", type: "date" },
        {
            name: "numero_semanas",
            label: "Número de semanas",
            type: "number",
            readOnly: true, // Campo de solo lectura
            className: "bg-gray-100" // Estilo visual para indicar que está bloqueado
        },
        { name: "fin_lectiva", label: "Fin lectiva", type: "date" },
        { name: "cupo", label: "Cupo", type: "number" },
        selectedRow
            ? {
                name: "estado",
                label: "Estado",
                type: "select",
                options: [
                    { value: true, label: "Activo" },
                    { value: false, label: "Inactivo" },
                ],
            }
            : null,
    ].filter(Boolean);

    const columns = [
        { name: "Código", selector: (row) => row.codigo, sortable: true },
        {
            name: "Programa",
            selector: (row) => dataPrograma.find((item) => item.value === row.programa_id)?.label,
            sortable: true,
        },
        {
            name: "Proyecto",
            selector: (row) => dataProyecto.find((item) => item.value === row.proyecto_id)?.label,
            sortable: true,
        },
        { name: "Fecha inicio", selector: (row) => row.fecha_inicio, sortable: true },
        { name: "Fecha fin", selector: (row) => row.fecha_fin, sortable: true },
        { name: "Fin lectiva", selector: (row) => row.fin_lectiva, sortable: true },
        { name: "Número de semanas", selector: (row) => row.numero_semanas, sortable: true },
        { name: "Cupo", selector: (row) => row.cupo, sortable: true },
        {
            name: "Estado",
            selector: (row) => (row.estado ? "Activo" : "Inactivo"),
            sortable: true,
        },
        {
            name: "Acciones",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center bg-green-500 text-white hover:bg-green-500 hover:bg-opacity-80 gap-2"
                        onClick={() => handleAction(row)}
                    >
                        <CheckIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center bg-red-500 text-white hover:bg-red-500 hover:bg-opacity-80 gap-2"
                        onClick={() => handleDelete(row)}
                    >
                        <TrashIcon className="h-4 w-4" />
                    </Button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "150px",
        },
    ];

    return (
        <div className="mt-6 mb-8 space-y-6 bg-gradient-to-br from-blue-gray-50 mt-12 rounded-xl min-h-screen via-white to-white">
            <Card className="bg-gradient-to-br from-blue-gray-50 rounded-xl min-h-screen via-white to-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-bold">Gestión de Fichas</CardTitle>
                    <Button
                        variant="default"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <PlusIcon className="h-4 w-4" />
                        Agregar Nuevo
                    </Button>
                </CardHeader>
                <CardContent>
                    {error ? (
                        <div className="text-red-500">{error}</div>
                    ) : (
                        <DataTableComponent columns={columns} data={data} title="" loading={isLoading} />
                    )}
                </CardContent>
            </Card>
            <DynamicModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                title={selectedRow ? "Editar ficha" : "Crear Nuevo ficha"}
                fields={modalFields}
                initialData={formData} // Cambiar a formData
                onInputChange={handleInputChange} // Pasar la función de manejo
                minDateForEnd={formData.fecha_inicio} // Para bloquear fechas anteriores
                maxDateForStart={formData.fecha_fin} // Para bloquear fechas posteriores
                minDateForLectiva={formData.fecha_fin}
            />
            {notification && (
                <div
                    className={`fixed top-10 right-4 p-4 rounded-lg text-white ${notification.type === "green" ? "bg-green-500" : "bg-red-500"
                        } transition-opacity duration-500 ${notification ? "opacity-100" : "opacity-0"}`}
                >
                    {notification.message}
                </div>
            )}
        </div>
    );
}

export default TableFicha;

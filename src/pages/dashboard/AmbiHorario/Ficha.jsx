"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Button,
} from "@material-tailwind/react"
import DataTableComponent from "@/widgets/datatable/data-table"
import { Service } from "@/data/api"
import { CheckIcon } from "@heroicons/react/24/solid"
import { DynamicModal } from "@/widgets/Modal/DynamicModal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, TrashIcon } from "lucide-react"
import Swal2 from "sweetalert2"

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

    const showSwal = (type, title, message = "", timer = 1500) => {
        Swal2.fire({
            icon: type,
            title: title,
            text: message,
            showConfirmButton: false,
            timer: timer,
            timerProgressBar: true,
            position: "top-end",
            toast: true,
        })
    }


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

    const handleSubmit = async (formData) => {
        const fechaInicio = new Date(formData.fecha_inicio);
        const fechaFin = new Date(formData.fecha_fin);

        if (fechaFin < fechaInicio) {
            showNotification('red', 'La fecha fin no puede ser anterior a la fecha inicio');
            return;
        }
        try {
            if (!selectedRow) {
                formData.estado = true;
            }
            if (selectedRow) {
                await Service.put(`/ficha/${selectedRow.id}/`, formData)
            } else {
                await Service.post("/ficha/", formData)
            }
            fetchData()
            setIsModalOpen(false)
            setSelectedRow(null)
            showSwal("success", "Ficha guardado exitosamente")
        } catch (error) {
            console.error("Error al guardar la ficha:", error)

            // Verifica si viene una respuesta con errores del backend
            const backendError = error?.response?.data

            // Extrae los mensajes y los convierte a texto plano
            let errorMessage = "Por favor, inténtalo de nuevo más tarde."
            if (backendError) {
                if (typeof backendError === "string") {
                    errorMessage = backendError
                } else if (Array.isArray(backendError.detail)) {
                    errorMessage = backendError.detail.map((e) => e.msg || e).join("\n")
                } else if (backendError.detail) {
                    errorMessage = backendError.detail
                } else {
                    // Si es un objeto de campos
                    errorMessage = Object.entries(backendError)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
                        .join("\n")
                }
            }
            showSwal("error", "Error al guardar la ficha", errorMessage)
        }
    }

    const handleDelete = async (row) => {
        Swal2.fire({
            title: "¿Estás seguro de eliminar este ficha?",
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
                    await Service.delete(`/ficha/${row.id}/`)
                    showSwal("success", "Ficha eliminado correctamente")
                    fetchData()
                } catch (error) {
                    console.error("Error al eliminar la ficha:", error)
                    showSwal("error", "Error al eliminar la ficha", "Inténtalo de nuevo más tarde.")
                }
            }
        })
    }

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

    const showNotification = (type, message) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 5000)
    }


    const modalFields = [
        {
            label: "Código",
            name: "codigo",
            type: "text",
            required: true,
            value: selectedRow?.codigo || "",
        },
        {
            label: "Programa",
            name: "programa_id",
            type: "select",
            required: true,
            value: selectedRow?.programa_id || "",
            options: dataPrograma
        },
        {
            label: "Proyecto",
            name: "proyecto_id",
            type: "select",
            required: true,
            value: selectedRow?.proyecto_id || "",
            options: dataProyecto, colSpan: 2
        },
        {
            label: "Fecha inicio",
            name: "fecha_inicio",
            type: "date",
            required: true,
            value: selectedRow?.fecha_inicio || "",
        },
        {
            label: "Fecha fin",
            name: "fecha_fin",
            type: "date",
            required: true,
            value: selectedRow?.fecha_fin || "",
        },
        {
            label: "Número de semanas",
            name: "numero_semanas",
            type: "number",
            readOnly: true,
            className: "bg-gray-100"
        },
        {
            label: "Fin lectiva",
            name: "fin_lectiva",
            type: "date",
            required: true,
            value: selectedRow?.fin_lectiva || "",
        },
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
                    <Button color="green" size="sm" className="flex items-center gap-2" onClick={() => handleAction(row)}>
                        <CheckIcon className="h-4 w-4" />
                    </Button>
                    <Button color="red" size="sm" className="flex items-center gap-2" onClick={() => handleDelete(row)}>
                        <TrashIcon className="h-4 w-4" />
                    </Button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "150px",
        },
    ]

    return (
        <div className="mt-6 mb-8 space-y-6 bg-gradient-to-br from-blue-gray-50 mt-12 rounded-xl min-h-screen via-white to-white">
            <Card className="bg-gradient-to-br from-blue-gray-50 rounded-xl min-h-screen via-white to-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-bold">Gestión de Fichas</CardTitle>
                    <Button
                        variant="default"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => {
                            setSelectedRow(null)
                            setIsModalOpen(true)
                        }}
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
        </div>
    );
}

export default TableFicha;

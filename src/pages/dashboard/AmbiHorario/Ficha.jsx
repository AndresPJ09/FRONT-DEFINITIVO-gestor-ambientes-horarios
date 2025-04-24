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
    const [selectedRow, setSelectedRow] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const [dataPrograma, setDataPrograma] = useState([]);
    const [dataProyecto, setDataProyecto] = useState([]);
    const [tempDates, setTempDates] = useState({
        fecha_inicio: null,
        fecha_fin: null,
        fin_lectiva: null,
    });

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
    }, [fetchData]);

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

    const handleSubmit = async (formData) => {
        // Validación de fechas
        const fechaInicio = formData.fecha_inicio ? new Date(formData.fecha_inicio) : null;
        const fechaFin = formData.fecha_fin ? new Date(formData.fecha_fin) : null;
        const finLectiva = formData.fin_lectiva ? new Date(formData.fin_lectiva) : null;

        if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
            showSwal("error", "Error en las fechas", "La fecha fin no puede ser anterior a la fecha inicio");
            return;
        }
        if (fechaFin && finLectiva && finLectiva < fechaFin) {
            showSwal("error", "Error en las fechas", "El fin lectiva no puede ser anterior a la fecha fin");
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
        setTempDates({
            fecha_inicio: row.fecha_inicio,
            fecha_fin: row.fecha_fin,
            fin_lectiva: row.fin_lectiva
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRow(null);
        setTempDates({ fecha_inicio: null, fecha_fin: null, fin_lectiva: null });
    };

    const showNotification = (type, message) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 5000)
    }

    const calculateWeeks = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;
        const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.ceil(diffDays / 7);
    };

    const handleInputChange = (name, value) => {
          // Actualizar fechas temporales para validación
    if (name === 'fecha_inicio' || name === 'fecha_fin') {
        setTempDates(prev => ({
          ...prev,
          [name]: value
        }));
        // Cálculo automático de semanas
        if (name === 'fecha_inicio' || name === 'fecha_fin') {
            updatedRow.numero_semanas = calculateWeeks(
                name === 'fecha_inicio' ? value : updatedRow.fecha_inicio,
                name === 'fecha_fin' ? value : updatedRow.fecha_fin
            );
        }
        }

        setSelectedRow(updatedRow);
    };

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
            value: selectedRow?.fecha_fin || ""
        },
        {
            label: "Fin lectiva",
            name: "fin_lectiva",
            type: "date",
            required: true,
            value: selectedRow?.fin_lectiva || ""
        },
        {
            label: "Número de semanas",
            name: "numero_semanas",
            type: "number",
            readOnly: true,
            className: "bg-gray-100",
            value: selectedRow?.numero_semanas || ""
        },
        {
            name: "cupo",
            label: "Cupo",
            type: "number",
            required: true,
            value: selectedRow?.cupo || ""
        },
        selectedRow
            ? {
                label: "Estado",
                name: "estado",
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
                <div className="flex items-center gap-2"
                    style={{ overflow: 'visible' }}
                    onClick={e => e.stopPropagation()}>
                    <Button color="green" size="sm" className="flex items-center gap-2" onClick={() => handleAction(row)}>
                        <CheckIcon className="h-4 w-4" />
                    </Button>
                    <Button color="red" size="sm" className="flex items-center gap-2" onClick={() => handleDelete(row)}>
                        <TrashIcon className="h-4 w-4" />
                    </Button>
                </div>
            ),
            //ignoreRowClick: true,
            //allowOverflow: true,
            //button: true,
            //width: "150px",
        },
    ]

    return (
        <div className="mt-6 mb-8 space-y-6 bg-gradient-to-br from-blue-gray-50 mt-12 rounded-xl min-h-screen via-white to-white">
            <Card className="bg-gradient-to-br from-blue-gray-50 rounded-xl min-h-screen via-white to-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-bold">Gestión de Fichas</CardTitle>
                    <Button
                        variant="filled"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => {
                            setSelectedRow(null)
                            setTempDates({ fecha_inicio: null, fecha_fin: null, fin_lectiva: null });
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
                initialData={selectedRow ? { ...selectedRow } : null}
                onInputChange={handleInputChange}
                minDateForEnd={selectedRow?.fecha_inicio || tempDates.fecha_inicio}
                maxDateForStart={selectedRow?.fecha_fin || tempDates.fecha_fin}
                minDateForLectiva={selectedRow?.fecha_fin || tempDates.fecha_fin}
            />
        </div>
    );
}

export default TableFicha;

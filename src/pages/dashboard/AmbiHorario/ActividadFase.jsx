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

export function TableActividadFase() {
    const [data, setData] = useState([]);
    const [dataActividad, setDataActividad] = useState([]);
    const [dataFase, setDataFase] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (isModalOpen) {
            setFormData(selectedRow || {});
        }
    }, [isModalOpen, selectedRow]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await Service.get("/actividadfase/");
            console.log("Datos recibidos del backend:", response);
            setData(response || []);
        } catch (error) {
            console.error("Error al obtener actividades de fases:", error);
            setError("Error al cargar los datos. Intente de nuevo más tarde.");
            setData([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchActividad = async () => {
        try {
            const response = await Service.get("/actividad/")
            setDataActividad(response.map((item) => ({
                value: item.id,
                label: item.nombre,
            }))
            )
        } catch (error) {
            console.error("Error al obtener las actividades:", error)
            setDataActividad([])
        }
    }

    const fetchFase = async () => {
        try {
            const response = await Service.get("/fase/")
            setDataFase(response.map((item) => ({
                value: item.id,
                label: item.nombre,
            }))
            )
        } catch (error) {
            console.error("Error al obtener las fases:", error)
            setDataFase([])
        }
    }

    useEffect(() => {
        fetchData();
        fetchActividad();
        fetchFase();
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

    const handleInputChange = (name, value) => {
        const newFormData = { ...formData, [name]: value };

        // Validación cruzada de fechas
        if (name === 'fecha_inicio_actividad' || name === 'fecha_fin_actividad') {
            const fechaInicio = newFormData.fecha_inicio_actividad ? new Date(newFormData.fecha_inicio_actividad) : null;
            const fechaFin = newFormData.fecha_fin_actividad ? new Date(newFormData.fecha_fin_actividad) : null;

            if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
                showNotification('red', 'La fecha fin no puede ser anterior a la fecha inicio');

                // Revertir el cambio inválido
                if (name === 'fecha_fin_actividad') {
                    newFormData.fecha_fin_actividad = formData.fecha_fin_actividad;
                } else {
                    newFormData.fecha_inicio_actividad = formData.fecha_inicio_actividad;
                }
            }
        }
        setFormData(newFormData);
    };
    
    const handleSubmit = async (formData) => {
        // Validación final de fechas
        const fechaInicio = new Date(formData.fecha_inicio_actividad);
        const fechaFin = new Date(formData.fecha_fin_actividad);

        if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
            alert("La fecha de fechaFin no puede ser anterior a la fecha de inicio.");
            return;
        }
        console.log('Datos enviados al submit:', formData);
        try {
            setIsLoading(true);
            setError(null);

            if (selectedRow) {
                await Service.put(`/actividadfase/${selectedRow.id}/`, formData);
            } else {
                await Service.post("/actividadfase/", formData);
            }
            fetchData()
            setIsModalOpen(false)
            setSelectedRow(null)
            showSwal("success", "Actividad fase guardado exitosamente")
        } catch (error) {
            console.error("Error al guardar la actvidad fase:", error)

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
            showSwal("error", "Error al guardar la actividad fase", errorMessage)
        }
    }

    const handleDelete = async (row) => {
        Swal2.fire({
            title: "¿Estás seguro de eliminar este actividad fase?",
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
                    await Service.delete(`/actividadfase/${row.id}/`)
                    showSwal("success", "Actividad fase eliminado correctamente")
                    fetchData()
                } catch (error) {
                    console.error("Error al eliminar LA actividad fase:", error)
                    showSwal("error", "Error al eliminar la actividad fase", "Inténtalo de nuevo más tarde.")
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
        setFormData({});
    };

    const modalFields = [
        {
            label: "Fecha inicio de actividad",
            name: "fecha_inicio_actividad",
            type: "date",
            required: true,
            value: selectedRow?.fecha_inicio_actividad || "",
            maxDate: formData.fecha_inicio_actividad,
        },
        {
            label: "Fecha fin de actividad",
            name: "fecha_fin_actividad",
            type: "date",
            required: true,
            value: selectedRow?.fecha_fin_actividad || "",
            minDate: formData.fecha_fin_actividad,
        },
        {
            label: "Actividad",
            name: "actividad_id",
            type: "select",
            required: true,
            value: selectedRow?.actividad_id || "",
            options: dataActividad
        },
        {
            label: "Fase",
            name: "fase_id",
            type: "select",
            required: true,
            value: selectedRow?.fase_id || "",
            options: dataFase
        },
    ];

    const columns = [
        { name: "Fecha de inicio de activfidad", selector: (row) => row.fecha_inicio_actividad, sortable: true },
        { name: "Fecha de fin de actividad", selector: (row) => row.fecha_fin_actividad, sortable: true },
        {
            name: "Actividad",
            selector: (row) => dataActividad.find((item) => item.value === row.actividad_id)?.label,
            sortable: true,
        },
        {
            name: "Fase",
            selector: (row) => dataFase.find((item) => item.value === row.fase_id)?.label,
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
                    <CardTitle className="text-2xl font-bold">Gestión de Actividad fase</CardTitle>
                    <Button
                        variant="filled"
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
                title={selectedRow ? "Editar actividad fase" : "Crear Nuevo actividad fase"}
                fields={modalFields}
                initialData={formData}
                onInputChange={handleInputChange}
                minDateForEnd={formData.fecha_inicio_actividad}
                maxDateForStart={formData.fecha_fin_actividad}
            />

        </div>
    );
}

export default TableActividadFase;

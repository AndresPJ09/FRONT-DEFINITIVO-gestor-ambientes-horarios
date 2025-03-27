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
    };

    const showNotification = (type, message) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 5000)
      }

    const handleSubmit = async (formData) => {
        try {
            setIsLoading(true);
            setError(null);
            if (selectedRow) {
                await Service.put(`/ficha/${selectedRow.id}/`, formData);
                Swal.fire("Ficha actualizada", "", "success");
            } else {
                await Service.post("/ficha/", { ...formData, estado: true });
                Swal.fire("Ficha creada", "", "success");
            }
            await fetchData();
            handleCloseModal();
        } catch (error) {
            Swal.fire("Error al guardar", error.message, "error");
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
                    // Actualiza el estado manualmente
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
        { name: "fin_lectiva", label: "Fin lectiva", type: "date" },
        { name: "numero_semanas", label: "Número de semanas", type: "number", },
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
                initialData={selectedRow ? { ...selectedRow } : null}
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

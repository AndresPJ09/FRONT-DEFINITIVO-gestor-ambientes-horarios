"use client"

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTableComponent from "@/widgets/datatable/data-table";
import { Service } from "@/data/api";
import { CheckIcon, PlusIcon, TrashIcon } from "lucide-react";
import { DynamicModal } from "@/widgets/Modal/DynamicModal";
import Swal from "sweetalert2";

export function TableConsolidadoAmbiente() {
    const [data, setData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await Service.get("/consolidadoambiente/");
            setData(response || []);
        } catch (error) {
            console.error("Error al obtener las horarios:", error);
            setError("Error al cargar los datos. Intente de nuevo más tarde.");
            setData([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns = [
        {
            name: "Ambiente",
            selector: (row) => row.ambiente_codigo || "Sin asignar",
            sortable: true
        },
        {
            name: "Ficha",
            selector: (row) => row.ficha_codigo || "Sin asignar",
            sortable: true
        },
        {
            name: "Usuario",
            selector: (row) => row.usuario_nombre_completo || "Sin asignar",
            sortable: true
        },
        {
            name: "Instructor",
            selector: (row) => row.instructor_nombre_completo || "Sin asignar",
            sortable: true
        },
        {
            name: "Programa",
            selector: (row) => row.programa_nombre || "Sin asignar",
            sortable: true
        },
        {
            name: "Nivel formación",
            selector: (row) => row.nivelformacion_nombre || "Sin asignar",
            sortable: true
        },
        {
            name: "Observaciones",
            selector: (row) => row.observaciones || "Sin asignar",
            sortable: true
        },
        {
            name: "Estado",
            selector: (row) => {
                const estado = row.estado?.toLowerCase?.();
                if (!estado) return "Sin asignar";
                return {
                    disponible: "Disponible",
                    ocupado: "Ocupado",
                    inactivo: "Inactivo"
                }[estado] || "Sin asignar";
            },
            sortable: true
        },
        {
            name: "Acciones",
            
        },
    ];    

    return (
        <div className="mt-6 mb-8 space-y-6 bg-gradient-to-br from-blue-gray-50 mt-12 rounded-xl min-h-screen via-white to-white">
            <Card className="bg-gradient-to-br from-blue-gray-50 rounded-xl min-h-screen via-white to-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-bold">Consolidado de Ambientes</CardTitle>
                </CardHeader>

                <CardContent>
                    {error ? (
                        <div className="text-red-500">{error}</div>
                    ) : (
                        <DataTableComponent
                            columns={columns}
                            data={data}
                            title=""
                            loading={isLoading}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default TableConsolidadoAmbiente
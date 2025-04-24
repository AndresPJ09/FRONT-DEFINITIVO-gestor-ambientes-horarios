"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTableComponent from "@/widgets/datatable/data-table";
import { Service } from "@/data/api";
import Swal from "sweetalert2";

export function TableConsolidadoHorario() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await Service.get("/consolidadohorario/");
            setData(response || []);
        } catch (error) {
            console.error("Error al obtener los horarios:", error);
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
            name: "Usuario",
            selector: (row) => row.usuario_nombre_completo || "",
            sortable: true,
        },
        {
            name: "Programa",
            selector: (row) => row.programa_nombre || "",
            sortable: true,
        },
        {
            name: "Nivel Formación",
            selector: (row) => row.nivelformacion_nombre || "",
            sortable: true,
        },
        {
            name: "Ficha",
            selector: (row) => row.ficha_codigo || "",
            sortable: true,
        },
        {
            name: "Ambiente",
            selector: (row) => row.codigo_ambiente || "",
            sortable: true,
        },
        {
            name: "Competencia",
            selector: (row) => row.competencia_nombre || "",
            sortable: true,
        },
        {
            name: "Resultado Aprendizaje",
            selector: (row) => row.resultadoaprendizaje_descripcion || "",
            sortable: true,
        },
        {
            name: "Estado ideal del Resultado Aprendizaje",
            selector: (row) => row.resultadoaprendizaje_est_ideal_evaluacion || "",
            sortable: true,
        },
        {
            name: "Fecha Inicio",
            selector: (row) => row.actvidadfase_fecha_inicio_actividad || "",
            sortable: true,
        },
        {
            name: "Fecha Fin",
            selector: (row) => row.actvidadfase_fecha_fin_actividad || "",
            sortable: true,
        },
        {
            name: "Número de semanas",
            selector: (row) => row.actvidadfase_numero_semanas || "",
            sortable: true,
        },
        {
            name: "Instructor",
            selector: (row) => row.instructor_nombre_completo || "",
            sortable: true,
        },
        {
            name: "Jornada programada",
            selector: (row) => row.jornada_programada || "",
            sortable: true,
        },
        {
            name: "Horas",
            selector: (row) => row.horas || "",
            sortable: true,
        },
        {
            name: "Observaciones",
            selector: (row) => row.observaciones || "",
            sortable: true,
        },
        {
            name: "Estado",
            selector: (row) => row.estado ? "Activo" : "Inactivo",
            sortable: true,
        },
    ];

    return (
        <div className="mt-6 mb-8 space-y-6 bg-gradient-to-br from-blue-gray-50 mt-12 rounded-xl min-h-screen via-white to-white">
            <Card className="bg-gradient-to-br from-blue-gray-50 rounded-xl min-h-screen via-white to-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-bold">Consolidado de Horarios</CardTitle>
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

export default TableConsolidadoHorario;

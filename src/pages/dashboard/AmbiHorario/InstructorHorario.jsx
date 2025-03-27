"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTableComponent from "@/widgets/datatable/data-table";
import { Service } from "@/data/api";
import Swal from "sweetalert2";

export function InstructorHorario() {
    const [data, setData] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [filtroUsuario, setFiltroUsuario] = useState('');
    const [filtroPeriodo, setFiltroPeriodo] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await Service.get("/instructorhorario/");
            setData(response || []);
        } catch (error) {
            console.error("Error al obtener los horarios de instructores:", error);
            setError("Error al cargar los datos. Intente de nuevo más tarde.");
            setData([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchPeriodos = useCallback(async () => {
        try {
            const response = await Service.get("/periodo/");
            setPeriodos(response || []);
        } catch (error) {
            console.error("Error al obtener los periodos:", error);
        }
    }, []);

    const fetchUsuarios = useCallback(async () => {
        try {
            const response = await Service.get("/usuario/");
            setUsuarios(response || []);
        } catch (error) {
            console.error("Error al obtener los usuarios:", error);
        }
    }, []);

    useEffect(() => {
        fetchData();
        fetchPeriodos();
        fetchUsuarios();
    }, [fetchData]);

    useEffect(() => {
        if (filtroUsuario) filtrarPorUsuario();
    }, [filtroUsuario]);

    useEffect(() => {
        if (filtroPeriodo) filtrarPorPeriodo();
    }, [filtroPeriodo]);

    const filtrarPorUsuario = async () => {
        try {
          const data = await Service.get(`instructorhorario/usuario/${filtroUsuario}/`)
          if (data.length === 0) {
            Swal.fire({
              icon: 'warning',
              title: 'No hay registros',
              text: 'No se encontraron horarios para el usuario seleccionado.',
              confirmButtonText: 'Aceptar'
            });
            return;
          }
          setData(data);
        } catch (error) {
          console.error("Error al filtrar horarios por usuario:", error);
        }
      };
      
    
    const filtrarPorPeriodo = async () => {
        try {
            const data = await Service.get(`/instructorhorario/periodo/${filtroPeriodo}/`);
            if (data.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'No hay registros',
                    text: 'No se encontraron horarios para el período seleccionado.',
                    confirmButtonText: 'Aceptar'
                });
                return;
            }
            setData(data);
        } catch (error) {
            Swal.fire("Error al filtrar horarios por periodo", error.message, "error");
        }
    };

    const limpiarFiltros = () => {
        setFiltroUsuario('');
        setFiltroPeriodo('');
        fetchData();
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'N/A';
        const date = new Date(dateTime);
        return new Intl.DateTimeFormat('es-ES', {
            dateStyle: 'long',
            timeStyle: 'short',
        }).format(date);
    };

    const columns = [
        { name: "Día", selector: (row) => row.dia, sortable: true },
        { name: "Programa", selector: (row) => row.programa_nombre, sortable: true },
        { name: "Nivel de formación", selector: (row) => row.nivelformacion_nombre, sortable: true },
        { name: "Ficha", selector: (row) => row.ficha_codigo, sortable: true },
        { 
            name: "Ambiente", 
            selector: (row) => `${row.ambiente_codigo} ${row.ambiente_nombre}`,
            sortable: true 
        },
        { 
            name: "Jornada programa", 
            selector: (row) => row.instructor_jornada_programada,
            sortable: true 
        },
        { 
            name: "Instructor", 
            selector: (row) => `${row.instructor_nombres} ${row.instructor_apellidos}`,
            sortable: true 
        },
        { 
            name: "Fecha inicio y hora", 
            selector: (row) => formatDateTime(row.instructor_fecha_inicio_hora_ingreso),
            sortable: true 
        },
        { 
            name: "Fecha fin y hora", 
            selector: (row) => formatDateTime(row.instructor_fecha_fin_hora_egreso),
            sortable: true 
        },
        { name: "Horas", selector: (row) => row.instructor_horas, sortable: true },
        { name: "Observaciones", selector: (row) => row.observaciones, sortable: true },
        { 
            name: "Estado", 
            selector: (row) => row.estado ? "Activo" : "Inactivo",
            sortable: true 
        }
    ];

    return (
        <div className="mt-6 mb-8 space-y-6 bg-gradient-to-br from-blue-gray-50 mt-12 rounded-xl min-h-screen via-white to-white">
        <Card className="bg-gradient-to-br from-blue-gray-50 rounded-xl min-h-screen via-white to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-bold">Horarios de Instructores</CardTitle>
                    
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por gestor</label>
                            <select
                                value={filtroUsuario}
                                onChange={(e) => setFiltroUsuario(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="">Todos los gestores</option>
                                {usuarios.map((usuario) => (
                                    <option key={usuario.id} value={usuario.id}>
                                        {usuario.nombres} {usuario.apellidos}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por período</label>
                            <select
                                value={filtroPeriodo}
                                onChange={(e) => setFiltroPeriodo(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="">Todos los períodos</option>
                                {periodos.map((periodo) => (
                                    <option key={periodo.id} value={periodo.id}>
                                       {periodo.nombre} ({periodo.fecha_inicio} - {periodo.fecha_fin})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="w-full md:w-1/3 flex items-end">
                            <Button
                                variant="outline"
                                onClick={limpiarFiltros}
                                className="w-full"
                                disabled={isLoading || (!filtroUsuario && !filtroPeriodo)}
                            >
                                Limpiar filtros
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent>
                    {error ? (
                        <div className="text-red-500">{error}</div>
                    ) : (
                        <DataTableComponent columns={columns} data={data} title="" loading={isLoading} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default InstructorHorario;
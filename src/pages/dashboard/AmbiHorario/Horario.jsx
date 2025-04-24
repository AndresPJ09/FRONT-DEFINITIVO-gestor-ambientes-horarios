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
import Cookies from "js-cookie";

export function TableHorario() {
    const [data, setData] = useState([]); // horarios
    const [usuarios, setUsuarios] = useState([]);
    const [fichas, setFichas] = useState([]);
    const [ambientes, setAmbientes] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [instructores, setInstructores] = useState([]);
    const [programas, setProgramas] = useState([]);
    const [niveles, setNiveles] = useState([]);
    const [proyectos, setProyectos] = useState([]);
    const [fases, setFases] = useState([]);

    // Estados de modal / formulario
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [formData, setFormData] = useState({});

    // Campos calculados al elegir ficha (solo lectura)
    const [programaSeleccionado, setProgramaSeleccionado] = useState('');
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState('');
    const [nivelSeleccionado, setNivelSeleccionado] = useState('');
    const [fechaInicioSeleccionado, setFechaInicioSeleccionado] = useState('');
    const [fechaFinSeleccionado, setFechaFinSeleccionado] = useState('');
    const [finlectivaSeleccionado, setFinLectivaSeleccionado] = useState('');
    const [jornadaTecnicaSeleccionado, setJornadaTecnicaSeleccionado] = useState('');
    const [faseSeleccionada, setFaseSeleccionada] = useState("");
    const [user, setUser] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
      const [tempDates, setTempDates] = useState({
        fecha_inicio_hora_ingreso: null,
        fecha_fin_hora_egreso: null
      });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [data, usuarios, fichas, ambientes, periodos, instructores, programas, niveles, proyectos, fases] =
                await Promise.all([
                    Service.get("/horario/"),
                    Service.get("/usuario/"),
                    Service.get("/ficha/"),
                    Service.get("/ambiente/"),
                    Service.get("/periodo/"),
                    Service.get("/instructor/"),
                    Service.get("/programa/"),
                    Service.get("/nivelformacion/"),
                    Service.get("/proyecto/"),
                    Service.get("/fase/")
                ]);
            setData(data || []);
            setUsuarios(usuarios.map(u => ({ value: u.id, label: `${u.nombres} ${u.apellidos}` })));
            setFichas(fichas.map(f => ({ value: f.id, label: f.codigo })));
            setAmbientes(ambientes.map(a => ({ value: a.id, label: `${a.codigo} ${a.nombre}` })));
            setPeriodos(periodos.map(p => ({ value: p.id, label: `${p.nombre} (${p.fecha_inicio} - ${p.fecha_fin})` })));
            setInstructores(instructores.map(i => ({ value: i.id, label: i.nombres })));
            setProgramas(programas);
            setNiveles(niveles);
            setProyectos(proyectos);
            setFases(fases);
        } catch (e) {
            console.error(e);
            setError("Error al cargar datos. Intente de nuevo más tarde.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const userId = Cookies.get("user"); // o el nombre que uses para almacenar el ID
        if (userId) {
            Service.get(`/usuario/${userId}/`)
                .then((res) => {
                    setUser(res);
                    setFormData((prevData) => ({
                        ...prevData,
                        usuario_id: res.id, // preasignar al formData
                    }));
                })
                .catch(() => console.error("Error al cargar el usuario"));
        }
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

    const handleFichaChange = (e) => {
        const fichaId = e.target.value;
        setFormData({ ...formData, ficha_id: fichaId });

        const ficha = fichas.find(f => f.id === parseInt(fichaId));
        if (ficha) {
            setFechaInicioSeleccionado(ficha.fecha_inicio || '');
            setFechaFinSeleccionado(ficha.fecha_fin || '');
            setFinLectivaSeleccionado(ficha.fin_lectiva || '');

            const proyecto = proyectos.find(p => p.id === ficha.proyecto_id);
            if (proyecto) {
                setProyectoSeleccionado(proyecto.nombre);
                setJornadaTecnicaSeleccionado(proyecto.jornada_tecnica || '');

                const programa = programas.find(p => p.id === ficha.programa_id);
                if (programa) {
                    setProgramaSeleccionado(programa.nombre);
                    const nivel = niveles.find(n => n.id === programa.nivel_formacion_id);
                    setNivelSeleccionado(nivel ? nivel.nombre : '');
                } else {
                    setProgramaSeleccionado('');
                    setNivelSeleccionado('');
                }
            } else {
                setProyectoSeleccionado('');
                setJornadaTecnicaSeleccionado('');
                setProgramaSeleccionado('');
                setNivelSeleccionado('');
            }
        } else {
            setFechaInicioSeleccionado('');
            setFechaFinSeleccionado('');
            setFinLectivaSeleccionado('');
            setProyectoSeleccionado('');
            setJornadaTecnicaSeleccionado('');
            setProgramaSeleccionado('');
            setNivelSeleccionado('');
        }
    };

    const handleInputChange = (name, value) => {
        setTempDates(prev => ({
            ...prev,
            [name]: value
          }));

            // Calcular la diferencia de horas si los campos de fecha están cambiados
            if (name === 'fecha_inicio_hora_ingreso' || name === 'fecha_fin_hora_egreso') {
                const inicio = new Date(newFormData.fecha_inicio_hora_ingreso);
                const fin = new Date(newFormData.fecha_fin_hora_egreso);

                if (!isNaN(inicio.getTime()) && !isNaN(fin.getTime())) {
                    const diferenciaMilisegundos = fin - inicio;
                    const diferenciaHoras = diferenciaMilisegundos / (1000 * 60 * 60); // Convertir a horas
                    newFormData.horas = Math.max(0, Math.floor(diferenciaHoras)); // Asegurar que sea un número entero positivo
                } else {
                    newFormData.horas = 0; // Si las fechas no son válidas, establecer las horas en 0
                }
            }
    };

    const handleSubmit = async (fd) => {
        try {
            if (selectedRow) await Service.put(`/horario/${selectedRow.id}/`, fd);
            else {
                fd.estado = true;
                await Service.post("/horario/", fd);
            }
            showSwal("success", "Horario guardado exitosamente");
            fetchData();
            setIsModalOpen(false);
            setSelectedRow(null);
        } catch (e) {
            console.error("Error al guardar el horario:", e);
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
            showSwal("error", "Error al guardar la horario", errorMessage)
        }
    }

    const handleDelete = async (row) => {
        Swal2.fire({
            title: "¿Estás seguro de eliminar este horario?",
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
                    await Service.delete(`/horario/${row.id}/`)
                    showSwal("success", "Horario eliminado correctamente")
                    fetchData()
                } catch (error) {
                    console.error("Error al eliminar la horario:", error)
                    showSwal("error", "Error al eliminar la horario", "Inténtalo de nuevo más tarde.")
                }
            }
        })
    }

    const handleAction = (row) => {
        setSelectedRow(row);
        setTempDates({
            fecha_inicio_hora_ingreso: row.fecha_inicio_hora_ingreso,
            fecha_fin_hora_egreso: row.fecha_fin_hora_egreso
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRow(null);
        setTempDates({ fecha_inicio_hora_ingreso: null, fecha_fin_hora_egreso: null });
    };

    // Definición de campos del modal
    const modalFields = [
        { label: "Usuario", name: "usuario_id", type: "select", required: true, value: formData.usuario_id || "", options: usuarios },
        { label: "Programa", name: "", type: "text", readOnly: true, value: programaSeleccionado },
        { label: "Nivel formación", name: "", type: "text", readOnly: true, value: nivelSeleccionado },
        { label: "Ficha", name: "ficha_id", type: "select", required: true, value: formData.ficha_id || "", options: fichas, onChange: handleFichaChange },
        { label: "Ambiente", name: "ambiente_id", type: "select", required: true, value: formData.ambiente_id || "", options: ambientes },
        { label: "Proyecto", name: "", type: "text", readOnly: true, value: proyectoSeleccionado },
        { label: "Fecha inicio", name: "fecha_inicio", type: "date", value: fechaInicioSeleccionado, onChange: setFechaInicioSeleccionado },
        { label: "Fecha fin", name: "fecha_fin", type: "date", value: fechaFinSeleccionado, onChange: setFechaFinSeleccionado },
        { label: "Fin lectiva", name: "fin_lectiva", type: "date", value: finlectivaSeleccionado, onChange: setFinLectivaSeleccionado },
        { label: "Jornada técnica", name: "jornada_tecnica", readOnly: true, type: "text", value: jornadaTecnicaSeleccionado },
        { label: "Fase", name: "", type: "text", readOnly: true, value: faseSeleccionada },
        { label: "Periodo", name: "periodo_id", type: "select", required: true, value: formData.periodo_id || "", options: periodos },
        { label: "Día de la semana", name: "dia", type: "select", required: true, value: formData.dia || "", options: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(d => ({ value: d, label: d })) },
        { label: "Jornada programada", name: "jornada_programada", type: "select", required: true, value: formData.jornada_programada || "", options: ["Mañana", "Tarde", "Noche"].map(j => ({ value: j, label: j })) },
        { label: "Instructor", name: "instructor_id", type: "select", required: true, value: formData.instructor_id || "", options: instructores },
        { label: "Fecha ingreso", name: "fecha_inicio_hora_ingreso", type: "datetime-local", value: formData.fecha_inicio_hora_ingreso || "", onChange: handleInputChange },
        { label: "Fecha egreso", name: "fecha_fin_hora_egreso", type: "datetime-local", value: formData.fecha_fin_hora_egreso || "", onChange: handleInputChange },
        { label: "Horas", name: "horas", type: "number", readOnly: true, value: formData.horas || 0 },
        { label: "Validacion", name: "validacion", type: "text", value: formData.validacion || "", onChange: handleInputChange },
        { label: "Observaciones", name: "observaciones", type: "textarea", value: formData.observaciones || "" },
        selectedRow && { label: "Estado", name: "estado", type: "select", value: formData.estado, options: [{ value: true, label: "Activo" }, { value: false, label: "Inactivo" }] }
    ].filter(Boolean);

    const columns = [
        {
            name: "Gestor",
            selector: (row) => usuarios.find((item) => item.value === row.usuario_id)?.label,
            sortable: true,
        },
        {
            name: "Ficha",
            selector: (row) => fichas.find((item) => item.value === row.ficha_id)?.label,
            sortable: true,
        },
        {
            name: "Periodo",
            selector: (row) => periodos.find((item) => item.value === row.periodo_id)?.label,
            sNrtab: true,
        },
        { name: "Fecha de inicio y hora de ingreso", selector: (row) => row.fecha_inicio_hora_ingreso, sortable: true },
        { name: "Fecha de fin y hora de egreso", selector: (row) => row.fecha_fin_hora_egreso, sortable: true },
        { name: "Horas", selector: (row) => row.horas, sortable: true },
        { name: "Observaciones", selector: (row) => row.observaciones, sortable: true },
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
                    <CardTitle className="text-2xl font-bold">Gestión de horarios</CardTitle>
                    <Button
                        variant="filled"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => {
                            setSelectedRow(null)
                            setTempDates({ fecha_inicio_hora_ingreso: null, fecha_fin_hora_egreso: null });
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
                title={selectedRow ? "Editar horario" : "Crear nuevo horario"}
                fields={modalFields}
                initialData={formData}
                onInputChange={handleInputChange}
                minDateForEnd={formData.fecha_inicio_hora_ingreso}
                maxDateForStart={formData.fecha_fin_hora_egreso}
            />
        </div>
    );

}

export default TableHorario
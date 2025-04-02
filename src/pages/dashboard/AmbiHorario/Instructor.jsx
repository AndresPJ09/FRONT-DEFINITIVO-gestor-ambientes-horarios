import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTableComponent from "@/widgets/datatable/data-table";
import { Service } from "@/data/api";
import { CheckIcon, PlusIcon, TrashIcon } from "lucide-react";
import { DynamicModal } from "@/widgets/Modal/DynamicModal";
import Swal from "sweetalert2";

export function TableInstructor() {
    const [data, setData] = useState([]);
    const [dataTipoVinculo, setDataTipoVinculo] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null)
    const [imagenModal, setImagenModal] = useState(null);
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
            const response = await Service.get("/instructor/");
            console.log("Datos recibidos del backend:", response);
            setData(response || []);
        } catch (error) {
            console.error("Error al obtener instructores:", error);
            setError("Error al cargar los datos. Intente de nuevo más tarde.");
            setData([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchTipoVinculo = async () => {
        try {
            const response = await Service.get("/tipovinculo/")

            setDataTipoVinculo(response.map((item) => ({
                value: item.id,
                label: item.nombre,
            }))
            )
        } catch (error) {
            console.error("Error al obtener los tipo de vinculos:", error)
            setDataTipoVinculo([])
        }
    }

    useEffect(() => {
        fetchData();
        fetchTipoVinculo()
    }, [fetchData]);

    const handleAction = (row) => {
        setFormData({
            ...row,
            foto: row.foto || null,
            fotoPreview: row.foto ? `data:image/jpeg;base64,${row.foto}` : '',
        });
        setSelectedRow(row);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRow(null);
    };

    // Función para mostrar notificaciones
    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleSubmit = async (formData) => {
        // Validación final de fechas
        const fechaInicio = data.fecha_inicio ? new Date(data.fecha_inicio) : null;
        const fechaFin = data.fecha_finalizacion ? new Date(data.fecha_finalizacion) : null;

        if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
            showNotification('red', 'La fecha de finalización no puede ser anterior a la fecha de inicio');
            return;
        }
        console.log('Datos enviados al submit:', formData);
        try {
            setIsLoading(true);
            setError(null);

            if (selectedRow) {
                await Service.put(`/instructor/${selectedRow.id}/`, formData);
                Swal.fire({
                    title: "Instructor actualizado",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                });
            } else {
                await Service.post("/instructor/", { ...formData, estado: true });
                Swal.fire({
                    title: "Instructor creado",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                });
            }

            await fetchData();
            handleCloseModal();
        } catch (error) {
            console.error("Error al guardar:", error);
            Swal.fire({
                title: "Error al guardar instructor",
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
            title: "¿Estás seguro de eliminar este instructor?",
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
                    await Service.delete(`/instructor/${row.id}/`);
                    Swal.fire({
                        title: "Instructor eliminado",
                        icon: "success",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                    setData((prevData) => prevData.filter((item) => item.id !== row.id));
                } catch (error) {
                    console.error("Error al eliminar el instructor:", error);
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo eliminar el instructor. Por favor, inténtalo de nuevo.",
                        icon: "error",
                        position: "bottom-right",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                }
            }
        });
    };
    const handleInputChange = (name, value) => {
        const newFormData = { ...formData, [name]: value };
      
        // Validación para todos los casos posibles de fechas
        const fechaInicio = newFormData.fecha_inicio ? new Date(newFormData.fecha_inicio) : null;
        const fechaFin = newFormData.fecha_fin ? new Date(newFormData.fecha_fin) : null;
        const fechaFinalizacion = newFormData.fecha_finalizacion ? new Date(newFormData.fecha_finalizacion) : null;
      
        // Validar fecha_fin vs fecha_inicio
        if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
          showNotification('red', 'La fecha fin no puede ser anterior a la fecha inicio');
          return;
        }
      
        // Validar fecha_finalizacion vs fecha_inicio
        if (fechaInicio && fechaFinalizacion && fechaFinalizacion < fechaInicio) {
          showNotification('red', 'La fecha de finalización no puede ser anterior a la fecha de inicio');
          return;
        }
      
        setFormData(newFormData);
        if (onInputChange) onInputChange(name, value);
      };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        // Validar tipo de archivo
        const validTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            Swal.fire({
                title: "Formato no válido",
                text: "Solo se permiten archivos PNG, JPG y JPEG",
                icon: "error",
                confirmButtonText: "Entendido"
            });
            e.target.value = "";
            return;
        }

        // Validar tamaño (ejemplo: máximo 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            Swal.fire({
                title: "Archivo demasiado grande",
                text: "El tamaño máximo permitido es 2MB",
                icon: "error",
                confirmButtonText: "Entendido"
            });
            e.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result.split(",")[1];
            setFormData({
                ...formData,
                foto: base64String,
                fotoPreview: URL.createObjectURL(file),
            });
        };
        reader.onerror = () => {
            Swal.fire({
                title: "Error",
                text: "Ocurrió un error al leer la imagen",
                icon: "error",
                confirmButtonText: "Entendido"
            });
        };
        reader.readAsDataURL(file);
    };

    const handleEliminarImagen = () => {
        // Limpiar input file
        const fileInput = document.getElementById('foto');
        if (fileInput) fileInput.value = '';

        setFormData({
            ...formData,
            foto: null,
            fotoPreview: null,
            fotoFile: '',
            shouldDeleteImage: true,
        });

        console.log('Estado después de eliminar imagen:', {
            foto: null,
            shouldDeleteImage: true
        });

    };

    const modalFields = [
        { name: "nombres", label: "Nombres", type: "text" },
        { name: "apellidos", label: "Apellidos", type: "text" },
        { name: "identificacion", label: "Identificacion", type: "text" },
        { name: "correo", label: "Correo", type: "text" },
        {
            name: "foto",
            label: "Foto",
            type: "file",
            accept: "image/png, image/jpeg, image/jpg",
            extraContent: (
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="mt-2"
                    onClick={handleEliminarImagen}
                >
                    Eliminar imagen
                </Button>
            )
        },
        { name: "tipo_vinculacion_id", label: "ID del tipo de vinculo", type: "select", options: dataTipoVinculo },
        { name: "especialidad", label: "Especialidad", type: "text" },
        { name: "fecha_inicio", label: "FechaInicio", type: "date", minDate: formData.fecha_inicio  },
        { name: "fecha_finalizacion", label: "FechaFin", type: "date", maxDate: formData.fecha_finalizacion },
        { name: "hora_ingreso", label: "HorasIngreso", type: "time" },
        { name: "hora_egreso", label: "HorasEgreso", type: "time" },
        { name: "horas_asignadas", label: "HorasAsignadas", type: "number" },
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
        { name: "Nombres", selector: (row) => row.nombres, sortable: true },
        { name: "Apellidos", selector: (row) => row.apellidos, sortable: true },
        {
            name: "Foto",
            selector: (row) => row.foto,
            sortable: false,
            cell: (row) =>
                row.foto ? (
                    <img
                        src={`data:image/jpeg;base64,${row.foto}`}
                        alt="Foto"
                        className="w-12 h-12 object-cover cursor-pointer rounded-md"
                        onClick={() => setImagenModal(`data:image/jpeg;base64,${row.foto}`)}
                    />
                ) : (
                    "Sin imagen"
                ),
        },
        {
            name: "Tipo de vinculo",
            selector: (row) => dataTipoVinculo.find((item) => item.value === row.tipo_vinculacion_id)?.label,
            sortable: true,
        },
        { name: "Especialidad", selector: (row) => row.especialidad, sortable: true },
        { name: "Fecha de inicio", selector: (row) => row.fecha_inicio, sortable: true },
        { name: "Fecha de finalización", selector: (row) => row.fecha_finalizacion, sortable: true },
        { name: "Horas de ingreso", selector: (row) => row.hora_ingreso, sortable: true },
        { name: "Horas de egreso", selector: (row) => row.hora_egreso, sortable: true },
        { name: "Horas asignadas", selector: (row) => row.horas_asignadas, sortable: true },
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
                    <CardTitle className="text-2xl font-bold">Gestión de instructor</CardTitle>
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
                title={selectedRow ? "Editar instructor" : "Crear Nuevo instructor"}
                fields={modalFields}
                initialData={formData}
                onInputChange={handleInputChange}
                minDateForEnd={formData.fecha_inicio}
                maxDateForStart={formData.fecha_finalizacion}
            />
            {/* Modal para imagen ampliada */}
            {imagenModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 cursor-pointer"
                    onClick={() => setImagenModal(null)}
                >
                    <img
                        src={imagenModal}
                        alt="Imagen ampliada"
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                    />
                </div>
            )}

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

export default TableInstructor;
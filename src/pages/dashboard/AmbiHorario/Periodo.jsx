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

export function TablePeriodo() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({});

  // Inicializar formData cuando se abre el modal
  useEffect(() => {
    if (isModalOpen) {
      setFormData(selectedRow || {});
    }
  }, [isModalOpen, selectedRow]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await Service.get("/periodo/");
      setData(response || []);
    } catch (error) {
      console.error("Error al obtener los periodos:", error);
      setError("Error al cargar los datos. Intente de nuevo más tarde.");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
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

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleInputChange = (name, value) => {
    const newFormData = { ...formData, [name]: value };

    // Validación cruzada de fechas
    if (name === 'fecha_inicio' || name === 'fecha_fin') {
      const fechaInicio = newFormData.fecha_inicio ? new Date(newFormData.fecha_inicio) : null;
      const fechaFin = newFormData.fecha_fin ? new Date(newFormData.fecha_fin) : null;

      if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
        showNotification('red', 'La fecha fin no puede ser anterior a la fecha inicio');

        // Revertir el cambio inválido
        if (name === 'fecha_fin') {
          newFormData.fecha_fin = formData.fecha_fin;
        } else {
          newFormData.fecha_inicio = formData.fecha_inicio;
        }
      }
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (formData) => {
    // Validación de fechas
    const fechaInicio = formData.fecha_inicio ? new Date(formData.fecha_inicio) : null;
    const fechaFin = formData.fecha_fin ? new Date(formData.fecha_fin) : null;

    if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
      showSwal("error", "Error en las fechas", "La fecha fin no puede ser anterior a la fecha inicio");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (!selectedRow) {
        formData.estado = true;
      }

      if (selectedRow) {
        await Service.put(`/periodo/${selectedRow.id}/`, formData);
      } else {
        await Service.post("/periodo/", formData);
      }
      fetchData()
      setIsModalOpen(false)
      setSelectedRow(null)
      showSwal("success", "Periodo guardado exitosamente")
    } catch (error) {
      console.error("Error al guardar el periodo:", error)

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
      showSwal("error", "Error al guardar el periodo", errorMessage)
    }
  }

  const handleDelete = async (row) => {
    Swal2.fire({
      title: "¿Estás seguro de eliminar este ambiente?",
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
          await Service.delete(`/periodo/${row.id}/`)
          showSwal("success", "Periodo eliminado correctamente")
          fetchData()
        } catch (error) {
          console.error("Error al eliminar el periodo:", error)
          showSwal("error", "Error al eliminar el periodo", "Inténtalo de nuevo más tarde.")
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
      label: "Nombre",
      name: "nombre",
      type: "text",
      required: true,
      value: selectedRow?.nombre || "",
    },
    {
      label: "Fecha inicio",
      name: "fecha_inicio",
      type: "date",
      required: true,
      value: selectedRow?.fecha_inicio || "",
      minDate: null,
      maxDate: formData.fecha_fin
    },
    {
      label: "Fecha fin",
      name: "fecha_fin",
      type: "date",
      required: true,
      value: selectedRow?.fecha_fin || "",
      minDate: formData.fecha_inicio
    },
    {
      label: "Año",
      name: "ano",
      type: "number",
      required: true,
      value: selectedRow?.ano || "",
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
    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
    { name: "Fecha inicio", selector: (row) => row.fecha_inicio, sortable: true },
    { name: "Fecha fin", selector: (row) => row.fecha_fin, sortable: true },
    { name: "Año", selector: (row) => row.ano, sortable: true },
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
          <CardTitle className="text-2xl font-bold">Gestión de Periodos</CardTitle>
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
        title={selectedRow ? "Editar periodo" : "Crear Nuevo periodo"}
        fields={modalFields}
        initialData={formData}
        onInputChange={handleInputChange}
        minDateForEnd={formData.fecha_inicio}
        maxDateForStart={formData.fecha_fin}
      />
    </div>
  );
}

export default TablePeriodo;

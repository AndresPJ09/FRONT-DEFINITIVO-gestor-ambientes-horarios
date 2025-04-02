"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTableComponent from "@/widgets/datatable/data-table";
import { Service } from "@/data/api";
import { CheckIcon, PlusIcon, TrashIcon } from "lucide-react";
import { DynamicModal } from "@/widgets/Modal/DynamicModal";
import Swal from "sweetalert2";

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

  const handleAction = (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
    setFormData({});
  };

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

  const handleSubmit = async () => {
    // Validación final antes de enviar
    const fechaInicio = formData.fecha_inicio ? new Date(formData.fecha_inicio) : null;
    const fechaFin = formData.fecha_fin ? new Date(formData.fecha_fin) : null;

    if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
      showNotification('red', 'La fecha fin no puede ser anterior a la fecha inicio');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (selectedRow) {
        await Service.put(`/periodo/${selectedRow.id}/`, formData);
        Swal.fire("Periodo actualizado", "", "success");
      } else {
        await Service.post("/periodo/", { ...formData, estado: true });
        Swal.fire("Periodo creado", "", "success");
      }

      await fetchData();
      handleCloseModal();
    } catch (error) {
      Swal.fire("Error al guardar", error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Corregir campos del modal (eliminé el duplicado de fecha_inicio)
  const modalFields = [
    { name: "nombre", label: "Nombre", type: "text" },
    { 
      name: "fecha_inicio", 
      label: "Fecha inicio", 
      type: "date",
      minDate: null, // Puedes establecer una fecha mínima global si es necesario
      maxDate: formData.fecha_fin // Bloquear fechas posteriores a fecha_fin
    },
    { 
      name: "fecha_fin", 
      label: "Fecha fin", 
      type: "date",
      minDate: formData.fecha_inicio // Bloquear fechas anteriores a fecha_inicio
    },
    { name: "ano", label: "Año", type: "number" },
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
          <CardTitle className="text-2xl font-bold">Gestión de Periodos</CardTitle>
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
        title={selectedRow ? "Editar periodo" : "Crear Nuevo periodo"}
        fields={modalFields}
        initialData={formData}
        onInputChange={handleInputChange}
        minDateForEnd={formData.fecha_inicio}
        maxDateForStart={formData.fecha_fin}
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
    
    export default TablePeriodo;
    
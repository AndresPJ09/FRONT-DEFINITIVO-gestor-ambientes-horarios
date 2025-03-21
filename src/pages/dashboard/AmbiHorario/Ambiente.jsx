"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTableComponent from "@/widgets/datatable/data-table";
import { Service } from "@/data/api";
import { CheckIcon, PlusIcon, TrashIcon } from "lucide-react";
import { DynamicModal } from "@/widgets/Modal/DynamicModal";
import Swal from "sweetalert2";

export function TableAmbiente() {
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
      const response = await Service.get("/ambiente/");
      setData(response || []);
    } catch (error) {
      console.error("Error al obtener los ambientes:", error);
      setError("Error al cargar los datos. Por favor, intente de nuevo más tarde.");
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
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);
      setError(null);

      if (selectedRow) {
        await Service.put(`/ambiente/${selectedRow.id}/`, formData);
        Swal.fire({
          title: "Ambiente actualizado",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        await Service.post("/ambiente/", { ...formData, estado: true });
        Swal.fire({
          title: "Ambiente creado",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
        });
      }

      await fetchData();
      handleCloseModal();
    } catch (error) {
      Swal.fire({
        title: "Error al guardar el ambiente",
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
    try {
      Swal.fire({
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
          await Service.delete(`/ambiente/${row.id}/`);
          Swal.fire({
            title: "Ambiente eliminado",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
          // Actualiza el estado manualmente
            await fetchData()
        }
      });
    } catch (error) {
      Swal.fire({
        title: "Error al eliminar el ambiente",
        text: error.message || "Ocurrió un error inesperado",
        icon: "error",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const modalFields = [
    { name: "codigo", label: "Código", type: "text" },
    { name: "nombre", label: "Nombre", type: "text" },
    { name: "capacidad", label: "Capacidad", type: "number" },
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
    {
      name: "codigo",
      selector: (row) => row.codigo,
      sortable: true,
    },
    {
      name: "nombre",
      selector: (row) => row.nombre,
      sortable: true,
    },
    {
      name: "capacidad",
      selector: (row) => row.capacidad,
      sortable: true,
    },
    {
      name: "estado",
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
          <CardTitle className="text-2xl font-bold">Gestión de ambientes</CardTitle>
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusIcon className="h-4 w-4" />
            Agregar Nuevo Ambiente
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
        title={selectedRow ? "Editar ambiente" : "Crear Nuevo ambiente"}
        fields={modalFields}
        initialData={selectedRow ? { ...selectedRow } : null}
      />
      {notification && (
        <div
          className={`fixed top-10 right-4 p-4 rounded-lg text-white ${
            notification.type === "green" ? "bg-green-500" : "bg-red-500"
          } transition-opacity duration-500 ${notification ? "opacity-100" : "opacity-0"}`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default TableAmbiente;
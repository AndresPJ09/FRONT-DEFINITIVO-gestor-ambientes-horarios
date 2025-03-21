"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTableComponent from "@/widgets/datatable/data-table";
import { Service } from "@/data/api";
import { CheckIcon, PlusIcon, TrashIcon } from "lucide-react";
import { DynamicModal } from "@/widgets/Modal/DynamicModal";
import Swal from "sweetalert2";

export function TableTipoVinculo() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await Service.get("/tipovinculo/");
      console.log("Datos recibidos del servidor:", response);
      setData(response || []);
    } catch (error) {
      console.error("Error al obtener los tipos de vínculo:", error);
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
  };

  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);
      setError(null);
      if (selectedRow) {
        await Service.put(`/tipovinculo/${selectedRow.id}/`, formData);
        Swal.fire("Tipo de Vínculo actualizado", "", "success");
      } else {
        await Service.post("/tipovinculo/", { ...formData, estado: true });
        Swal.fire("Tipo de Vínculo creado", "", "success");
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
      title: "¿Eliminar este Tipo de Vínculo?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await Service.delete(`/tipovinculo/${row.id}/`);
        Swal.fire("Eliminado", "", "success");
        await fetchData();
      }
    });
  };

  const modalFields = [
    { name: "codigo", label: "Código", type: "text" },
    { name: "nombre", label: "Nombre", type: "text" },
    { name: "descripcion", label: "Descripción", type: "text" },
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
    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
    { name: "Descripción", selector: (row) => row.descripcion, sortable: true },
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
            className="bg-green-500 text-white hover:bg-green-600"
            onClick={() => handleAction(row)}
          >
            <CheckIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-red-500 text-white hover:bg-red-600"
            onClick={() => handleDelete(row)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  return (
    <div className="mt-6 mb-8 space-y-6 bg-gradient-to-br from-blue-gray-50 mt-12 rounded-xl min-h-screen via-white to-white">
      <Card className="bg-gradient-to-br from-blue-gray-50 rounded-xl min-h-screen via-white to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Gestión de Tipos de Vínculo</CardTitle>
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
        title={selectedRow ? "Editar Tipo de Vínculo" : "Crear Nuevo Tipo de Vínculo"}
        fields={modalFields}
        initialData={selectedRow ? { ...selectedRow } : null}
      />
    </div>
  );
}

export default TableTipoVinculo;

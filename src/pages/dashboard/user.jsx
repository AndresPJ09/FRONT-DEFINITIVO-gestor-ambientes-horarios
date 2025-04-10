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

export function TableUser() {
  const [data, setData] = useState([])
  const [DatatipoDocumento, setDatatipoDocumento] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await Service.get("/usuario/")
      setData(response || [])
    } catch (error) {
      console.error("Error al obtener los usuarios:", error)
      setError("Error al cargar los datos. Por favor, intente de nuevo más tarde.")
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchTipoDocumento = async () => {
    try {
      const response = await Service.get("/tipodocumento/")
      setDatatipoDocumento(response.map((item) => ({
        value: item.id,
        label: item.nombre,
      }))
      )
    } catch (error) {
      console.error("Error al obtener los tipos de documento:", error)
      setDatatipoDocumento([])
    }
  }

  useEffect(() => {
    fetchData()
    fetchTipoDocumento()
  }, [fetchData])

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

  const handleSubmit = async (formData) => {
    try {
      if (selectedRow) {
        await Service.put(`/usuario/${selectedRow.id}/`, formData)
      } else {
        await Service.post("/usuario/", formData)
      }
      fetchData()
      setIsModalOpen(false)
      setSelectedRow(null)
      showSwal("success", "Usuario guardado exitosamente")
    } catch (error) {
      console.error("Error al guardar el usuario:", error)

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
      showSwal("error", "Error al guardar el usuario", errorMessage)
    }
  }

  const handleDelete = async (row) => {
    Swal2.fire({
      title: "¿Estás seguro de eliminar este usuario?",
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
          await Service.delete(`/usuario/${row.id}/`)
          showSwal("success", "Usuario eliminado correctamente")
          fetchData()
        } catch (error) {
          console.error("Error al eliminar el usuario:", error)
          showSwal("error", "Error al eliminar el usuario", "Inténtalo de nuevo más tarde.")
        }
      }
    })
  }

  const handleAction = (row) => {
    setSelectedRow(row)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRow(null)
  }

  const modalFields = [
    {
      label: "Nombres",
      name: "nombres",
      type: "text",
      required: true,
      value: selectedRow?.nombre || "",
    },
    {
      label: "Apellidos",
      name: "apellidos",
      type: "text",
      required: true,
      value: selectedRow?.apellidos || "",
    },
    {
      label: "Correo electronico",
      name: "correo",
      type: "email",
      required: true,
      value: selectedRow?.correo || "",
    },
    {
      label: "Contraseña",
      name: "contrasena",
      type: "password",
      required: true,
      value: selectedRow?.contrasena || "",
    },
    {
      label: "Documento",
      name: "documento",
      type: "number",
      required: true,
      value: selectedRow?.documento || "",
    },
    {
      label: "Tipo de documento",
      name: "tipoDocumento",
      type: "select",
      required: true,
      value: selectedRow?.tipoDocumento || "",
      options: DatatipoDocumento
    },
  ]

  const columns = [
    {
      name: "id",
      selector: (row) => row.id,
      sortable: true,
      omit: true,
    },
    {
      name: "Nombres",
      selector: (row) => row.nombres,
      sortable: true,
    },
    {
      name: "Apellidos",
      selector: (row) => row.apellidos,
      sortable: true,
    },
    {
      name: "Correo electronico",
      selector: (row) => row.correo,
      sortable: true,
    },
    {
      name: "Documento",
      selector: (row) => row.documento,
      sortable: true,
    },
    {
      name: "Tipo de documento",
      selector: (row) => DatatipoDocumento.find((item) => item.value === row.tipoDocumento)?.label,
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
    <div className="mt-6 mb-8 space-y-6">
      <Card className="bg-gradient-to-br from-blue-gray-50 rounded-xl min-h-screen via-white to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Gestión de Usuarios</CardTitle>
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => {
              setSelectedRow(null)
              setIsModalOpen(true)
            }}
          >
            <PlusIcon className="h-4 w-4" />
            Agregar Nuevo Usuario
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
        title={selectedRow ? "Editar Usuario" : "Crear Nuevo Usuario"}
        fields={modalFields}
        initialData={selectedRow ? { ...selectedRow } : null}
      />
    </div>
  )
}

export default TableUser




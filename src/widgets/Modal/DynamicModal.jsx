"use client";

import { DialogFooter } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "./DatePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DynamicModal({ isOpen, onClose, onSubmit, title, fields, initialData, onInputChange, minDateForEnd,
  maxDateForStart }) {
  const [formData, setFormData] = useState({});
  const [fileInputs, setFileInputs] = useState({});

  useEffect(() => {
    setFormData(initialData || {});
    // Inicializar fileInputs para campos de tipo file
    const fileFields = fields.filter(f => f.type === 'file');
    const inputs = {};
    fileFields.forEach(field => {
      inputs[field.name] = null;
    });
    setFileInputs(inputs);
  }, [isOpen, initialData, fields]);

  const handleFileChange = async (name, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      alert("Solo se permiten archivos PNG, JPG y JPEG");
      event.target.value = "";
      return;
    }

    // Validar tamaño (ejemplo: máximo 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert("El tamaño máximo permitido es 2MB");
      event.target.value = "";
      return;
    }

    // Leer el archivo como Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      setFormData(prev => ({
        ...prev,
        [name]: base64String,
        [`${name}Preview`]: URL.createObjectURL(file)
      }));
      setFileInputs(prev => ({
        ...prev,
        [name]: file
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFieldChange = (name, value) => {
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    if (onInputChange) onInputChange(name, value);
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderField = (field) => {
    const value = formData[field.name] || "";

    switch (field.type) {
      case "textarea":
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Textarea
              id={field.name}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
            />
          </div>
        );

      case "select":
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Select
              onValueChange={(value) => handleInputChange(field.name, value)}
              value={value?.toString() || ""}
            >
              <SelectTrigger
                id={field.name}
                className="min-h-input h-auto text-wrap text-left"
              >
                <SelectValue placeholder="Seleccione una opción" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto z-[99999]">
                {field.options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                    className="whitespace-normal"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
        

      case "date":
        return (
          <div key={field.name} className="grid gap-1">
            <Label className="text-sm font-medium text-gray-700">{field.label}</Label>
            <div className="mt-1">
              <DatePicker
                value={value}
                onChange={(date) => handleFieldChange(field.name, date)}
                placeholder={field.label}
                minDate={field.name === 'fecha_fin' ? minDateForEnd : undefined}
                maxDate={field.name === 'fecha_inicio' ? maxDateForStart : undefined}
              />
            </div>
          </div>
        );

        case "file":
          return (
            <div key={field.name} className="grid gap-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                type="file"
                accept={field.accept}
                onChange={(e) => handleFileChange(field.name, e)}
              />
              {formData[`${field.name}Preview`] && (
                <div className="mt-2">
                  <img 
                    src={formData[`${field.name}Preview`]} 
                    alt="Preview" 
                    className="h-24 w-24 object-cover rounded-md"
                  />
                  {field.extraContent}
                </div>
              )}
            </div>
          );
        
      // En el switch case para el tipo "number":
      default:
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type={field.type}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              readOnly={field.readOnly} // Añade esta línea
              className={field.className} // Añade esta línea
            />
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription>
            Complete los detalles a continuación. Haga clic en enviar cuando haya terminado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            {fields.map(field => (
              <div
                key={field.name}
                className={field.colSpan === 2 ? 'col-span-2' : 'col-span-1'}
              >
                {renderField(field)}
              </div>
            ))}
          </div>
          <DialogFooter className="px-6 pb-4">
            <Button type="submit" size="lg">Enviar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
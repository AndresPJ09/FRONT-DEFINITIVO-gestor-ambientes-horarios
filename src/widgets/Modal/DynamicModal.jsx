"use client";

import { DialogFooter } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DynamicModal({ isOpen, onClose, onSubmit, title, fields, initialData }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {});
    } else {
      setFormData({});
    }
  }, [isOpen, initialData]);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
              value={value.toString()}
            >
              <SelectTrigger 
                id={field.name} 
                className="min-h-[40px] h-auto text-wrap text-left"
              >
                <SelectValue placeholder="Seleccione una opción" />
              </SelectTrigger>
              <SelectContent className="overflow-visible">
                <div className="space-y-1 p-1">
                  {field.options.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value.toString()}
                      className="whitespace-normal break-words"
                    >
                      <div className="w-full py-1">
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </div>
        );
      default:
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type={field.type}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
            />
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Complete los detalles a continuación. Haga clic en enviar cuando haya terminado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(field => (
                <div 
                  key={field.name} 
                  className={field.colSpan === 2 ? 'col-span-2' : 'col-span-1'}
                >
                  {renderField(field)}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Enviar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
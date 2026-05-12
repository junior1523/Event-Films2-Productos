import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Edit2,
  ExternalLink,
  Video,
  Image as ImageIcon,
  ListOrdered,
  X,
  Save,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

interface MaterialLink {
  name: string;
  url: string;
}

interface Material {
  id: number;
  evento_id: number;
  evento_nombre: string;
  cliente_nombre: string;
  capitulos: string[];
  fotos: string;
  links: MaterialLink[];
  created_at: string;
}

interface Evento {
  id: number;
  evento: string;
  cliente: string;
  estado: string;
}

export function MaterialAudiovisual() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [events, setEvents] = useState<Evento[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Form State
  const [selectedEventoId, setSelectedEventoId] = useState<string>("");
  const [capitulos, setCapitulos] = useState<string[]>([]);
  const [newCapitulo, setNewCapitulo] = useState("");
  const [fotos, setFotos] = useState("");
  const [links, setLinks] = useState<MaterialLink[]>([]);
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const fetchData = async () => {
    try {
      const [matRes, eveRes] = await Promise.all([
        fetch("http://localhost:3001/api/material"),
        fetch("http://localhost:3001/api/eventos"),
      ]);
      const matData = await matRes.json();
      const eveData = await eveRes.json();
      setMaterials(matData);
      setEvents(eveData);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Error al cargar datos");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddDialog = () => {
    setEditingMaterial(null);
    setSelectedEventoId("");
    setCapitulos([]);
    setFotos("");
    setLinks([]);
    fetchData();
    setIsDialogOpen(true);
  };

  const openEditDialog = (mat: Material) => {
    setEditingMaterial(mat);
    setSelectedEventoId(mat.evento_id.toString());
    setCapitulos(mat.capitulos || []);
    setFotos(mat.fotos || "");
    setLinks(mat.links || []);
    setIsDialogOpen(true);
  };

  const handleAddCapitulo = () => {
    if (newCapitulo.trim()) {
      setCapitulos([...capitulos, newCapitulo.trim()]);
      setNewCapitulo("");
    }
  };

  const handleRemoveCapitulo = (index: number) => {
    setCapitulos(capitulos.filter((_, i) => i !== index));
  };

  const handleAddLink = () => {
    if (newLinkName.trim() && newLinkUrl.trim()) {
      setLinks([...links, { name: newLinkName.trim(), url: newLinkUrl.trim() }]);
      setNewLinkName("");
      setNewLinkUrl("");
    }
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedEventoId) {
      toast.error("Seleccione un evento");
      return;
    }

    const payload = {
      evento_id: parseInt(selectedEventoId),
      capitulos,
      fotos,
      links,
    };

    try {
      const url = editingMaterial 
        ? `http://localhost:3001/api/material/${editingMaterial.id}`
        : "http://localhost:3001/api/material";
      const method = editingMaterial ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingMaterial ? "Material actualizado" : "Material agregado");
        setIsDialogOpen(false);
        fetchData();
      } else {
        toast.error("Error al guardar material");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este material?")) return;
    try {
      const res = await fetch(`http://localhost:3001/api/material/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Material eliminado");
        fetchData();
      }
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.evento_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Material Audiovisual</h1>
          <p className="text-slate-500 mt-1">Gestión de entregas, capítulos y enlaces de video</p>
        </div>
        <Button 
          type="button"
          onClick={openAddDialog}
          className="rounded-2xl bg-blue-600 hover:bg-blue-700 h-12 px-6 shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          Agregar Material
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <Input
          placeholder="Buscar por evento o cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-14 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-100 transition-all"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-bold text-slate-700">Evento</TableHead>
              <TableHead className="font-bold text-slate-700">Cliente</TableHead>
              <TableHead className="font-bold text-slate-700">Contenido</TableHead>
              <TableHead className="font-bold text-slate-700">Enlaces</TableHead>
              <TableHead className="text-right font-bold text-slate-700">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMaterials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-slate-400">
                  No se encontró material audiovisual
                </TableCell>
              </TableRow>
            ) : (
              filteredMaterials.map((m) => (
                <TableRow key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                  <TableCell className="font-medium text-slate-900">{m.evento_nombre}</TableCell>
                  <TableCell className="text-slate-600">{m.cliente_nombre}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <ListOrdered className="w-3 h-3" /> {m.capitulos?.length || 0} capítulos
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <ImageIcon className="w-3 h-3" /> {m.fotos ? "Fotos incluidas" : "Sin fotos"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {m.links?.map((link, idx) => (
                        <a 
                          key={idx} 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg text-[10px] font-bold hover:bg-blue-100 transition-colors"
                        >
                          {link.name} <ExternalLink className="w-2 h-2" />
                        </a>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEditDialog(m)}
                        className="rounded-xl hover:bg-amber-50 hover:text-amber-600 h-9 w-9"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(m.id)}
                        className="rounded-xl hover:bg-red-50 hover:text-red-600 h-9 w-9"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[32px] p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">
              {editingMaterial ? "Editar Material" : "Agregar Material Audiovisual"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto px-1">
            {/* Event Selector */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Seleccionar Edición (Solo Completados)</label>
              <select
                value={selectedEventoId}
                onChange={(e) => setSelectedEventoId(e.target.value)}
                disabled={!!editingMaterial}
                className="w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50"
              >
                <option value="">Seleccione un evento...</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.evento} - {event.cliente} ({event.estado_entrega_final || 'Sin estado'})
                  </option>
                ))}
              </select>
            </div>

            {/* Chapters */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 ml-1">Capítulos del Video</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Nombre del capítulo..." 
                  value={newCapitulo}
                  onChange={(e) => setNewCapitulo(e.target.value)}
                  className="rounded-2xl h-12 border-slate-200"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCapitulo())}
                />
                <Button 
                  type="button" 
                  onClick={(e) => { e.preventDefault(); handleAddCapitulo(); }} 
                  variant="outline" 
                  className="rounded-2xl h-12 px-4"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {capitulos.map((cap, idx) => (
                  <Badge key={idx} className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none px-3 py-1.5 rounded-xl flex items-center gap-2">
                    {cap}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveCapitulo(idx)} />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Photos */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Detalles de Fotos</label>
              <Textarea 
                placeholder="Describa el contenido de fotos..." 
                value={fotos}
                onChange={(e) => setFotos(e.target.value)}
                className="rounded-2xl border-slate-200 min-h-[100px] resize-none"
              />
            </div>

            {/* Links */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 ml-1">Links de Videos / Redirecciones</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input 
                  placeholder="Nombre (ej. Resumen HD)" 
                  value={newLinkName}
                  onChange={(e) => setNewLinkName(e.target.value)}
                  className="rounded-2xl h-12 border-slate-200"
                />
                <div className="flex gap-2">
                  <Input 
                    placeholder="URL (https://...)" 
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="rounded-2xl h-12 border-slate-200 flex-1"
                  />
                  <Button 
                    type="button" 
                    onClick={(e) => { e.preventDefault(); handleAddLink(); }} 
                    variant="outline" 
                    className="rounded-2xl h-12 px-4"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {links.map((link, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-blue-50/50 p-3 rounded-2xl border border-blue-100">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-blue-700">{link.name}</span>
                      <span className="text-xs text-blue-400 truncate max-w-[300px]">{link.url}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveLink(idx)} className="h-8 w-8 text-blue-400 hover:text-red-500 hover:bg-red-50">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8 gap-3">
            <DialogClose asChild>
              <Button variant="ghost" className="rounded-2xl h-12 px-6 font-semibold">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={handleSave}
              className="rounded-2xl h-12 px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingMaterial ? "Actualizar" : "Guardar Material"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileText, Trash2, Upload } from "lucide-react";
import type { Material, Lesson } from "./types";

export function MaterialsDialog({ lesson }: { lesson: Lesson }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("lesson_materials")
      .select("*")
      .eq("lesson_id", lesson.id)
      .order("created_at");
    setMaterials((data ?? []) as Material[]);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileType = file.type.startsWith("image/") ? "image" : "pdf";
    const path = `${lesson.id}/${Date.now()}_${file.name}`;
    const { error: uploadErr } = await supabase.storage.from("lesson-materials").upload(path, file);
    if (uploadErr) {
      toast.error(uploadErr.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("lesson-materials").getPublicUrl(path);
    const { error } = await supabase.from("lesson_materials").insert({
      lesson_id: lesson.id,
      title: file.name,
      file_type: fileType,
      file_url: urlData.publicUrl,
    });
    if (error) toast.error(error.message);
    else toast.success("Material adicionado");
    setUploading(false);
    load();
  };

  const remove = async (m: Material) => {
    const { error } = await supabase.from("lesson_materials").delete().eq("id", m.id);
    if (error) return toast.error(error.message);
    toast.success("Material removido");
    load();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) load();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <FileText className="mr-1 h-4 w-4" /> Materiais
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Materiais — {lesson.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Label
            htmlFor="file-upload"
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground hover:border-primary"
          >
            <Upload className="h-5 w-5" />
            {uploading ? "A carregar..." : "Clique para fazer upload (PDF ou imagem)"}
          </Label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          {materials.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum material ainda.</p>
          ) : (
            <ul className="space-y-2">
              {materials.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-2 rounded-lg bg-secondary p-3 text-sm"
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <a
                    href={m.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 truncate hover:underline"
                  >
                    {m.title}
                  </a>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(m)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
} from "lucide-react";

type RichTextEditorProps = {
  content: string;
  onChange: (html: string) => void;
};

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      LinkExtension.configure({
        openOnClick: true,
        HTMLAttributes: { class: "text-gold underline" },
      }),
      ImageExtension.configure({
        HTMLAttributes: { class: "max-w-full rounded-xl mx-auto" },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none min-h-[250px] focus:outline-none px-4 py-3 rounded-md border border-input bg-transparent",
      },
    },
  });

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL do link:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(async () => {
    if (!editor) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      const path = `blog/${Date.now()}_${file.name}`;
      const { error: uploadErr } = await supabase.storage.from("blog-content").upload(path, file);
      if (uploadErr) {
        toast.error("Erro ao fazer upload da imagem: " + uploadErr.message);
        setUploading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("blog-content").getPublicUrl(path);
      editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
      setUploading(false);
    };
    input.click();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <Toolbar editor={editor} onAddLink={addLink} onAddImage={addImage} uploading={uploading} />
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
}

type ToolbarProps = {
  editor: Editor;
  onAddLink: () => void;
  onAddImage: () => void;
  uploading: boolean;
};

function Toolbar({ editor, onAddLink, onAddImage, uploading }: ToolbarProps) {
  const btn = (active: boolean, onClick: () => void, icon: React.ReactNode, title: string) => (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      onClick={onClick}
      title={title}
      className="h-8 w-8 p-0"
    >
      {icon}
    </Button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-md border border-input bg-card p-1.5">
      {btn(
        editor.isActive("bold"),
        () => editor.chain().focus().toggleBold().run(),
        <Bold className="h-4 w-4" />,
        "Negrito",
      )}
      {btn(
        editor.isActive("italic"),
        () => editor.chain().focus().toggleItalic().run(),
        <Italic className="h-4 w-4" />,
        "Itálico",
      )}
      {btn(
        editor.isActive("underline"),
        () => editor.chain().focus().toggleUnderline().run(),
        <UnderlineIcon className="h-4 w-4" />,
        "Sublinhado",
      )}
      <span className="mx-1 h-6 w-px bg-border" />
      {btn(
        editor.isActive("heading", { level: 2 }),
        () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        <Heading2 className="h-4 w-4" />,
        "Título 2",
      )}
      {btn(
        editor.isActive("heading", { level: 3 }),
        () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        <Heading3 className="h-4 w-4" />,
        "Título 3",
      )}
      <span className="mx-1 h-6 w-px bg-border" />
      {btn(
        editor.isActive("bulletList"),
        () => editor.chain().focus().toggleBulletList().run(),
        <List className="h-4 w-4" />,
        "Lista",
      )}
      {btn(
        editor.isActive("orderedList"),
        () => editor.chain().focus().toggleOrderedList().run(),
        <ListOrdered className="h-4 w-4" />,
        "Lista numerada",
      )}
      {btn(
        editor.isActive("blockquote"),
        () => editor.chain().focus().toggleBlockquote().run(),
        <Quote className="h-4 w-4" />,
        "Citação",
      )}
      <span className="mx-1 h-6 w-px bg-border" />
      {btn(editor.isActive("link"), onAddLink, <Link className="h-4 w-4" />, "Link")}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onAddImage}
        disabled={uploading}
        title="Imagem"
        className="h-8 w-8 p-0"
      >
        <Image className="h-4 w-4" />
      </Button>
    </div>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/RichTextEditor";
import { RichTextRenderer } from "@/components/RichTextRenderer";
import { toast } from "sonner";
import { Plus, Edit3, Trash2, Eye, FileText } from "lucide-react";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string | null;
  author_id: string;
  published: boolean;
  members_only: boolean;
  created_at: string;
  updated_at: string;
};

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base;
  let n = 0;
  while (true) {
    const { data } = await supabase.from("blog_posts").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    if (excludeId && data.id === excludeId) return slug;
    n++;
    slug = `${base}-${n}`;
  }
}

type PostFormProps = {
  post?: BlogPost | null;
  currentUserId: string;
  onDone: () => void;
};

function PostForm({ post, currentUserId, onDone }: PostFormProps) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugAuto, setSlugAuto] = useState(true);
  const [content, setContent] = useState(post?.content ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(post?.cover_image ?? "");
  const [membersOnly, setMembersOnly] = useState(post?.members_only ?? false);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (slugAuto) setSlug(toSlug(val));
  };

  const save = async (published: boolean) => {
    if (!title.trim()) return toast.error("O título é obrigatório");
    const finalSlug = await ensureUniqueSlug(slug || toSlug(title), post?.id);
    const finalExcerpt =
      excerpt.trim() ||
      content
        .replace(/<[^>]+>/g, "")
        .slice(0, 150)
        .trim();

    const payload = {
      title: title.trim(),
      slug: finalSlug,
      content,
      excerpt: finalExcerpt,
      cover_image: coverImage || null,
      author_id: currentUserId,
      published,
      members_only: membersOnly,
    };

    setPublishing(true);
    const { error } = post
      ? await supabase.from("blog_posts").update(payload).eq("id", post.id)
      : await supabase.from("blog_posts").insert(payload);
    setPublishing(false);

    if (error) return toast.error(error.message);
    toast.success(published ? "Post publicado!" : "Rascunho salvo");
    onDone();
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `covers/${Date.now()}_${file.name}`;
    const { error: uploadErr } = await supabase.storage.from("blog-covers").upload(path, file);
    if (uploadErr) {
      toast.error("Erro ao fazer upload: " + uploadErr.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("blog-covers").getPublicUrl(path);
    setCoverImage(urlData.publicUrl);
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Título</Label>
        <Input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Título do post"
        />
      </div>
      <div className="space-y-2">
        <Label>Slug</Label>
        <div className="flex gap-2">
          <Input
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugAuto(false);
            }}
            placeholder="url-do-post"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSlug(toSlug(title));
              setSlugAuto(true);
            }}
          >
            Auto
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Excerto (opcional — se vazio, auto-gerado)</Label>
        <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} />
      </div>
      <div className="space-y-2">
        <Label>Imagem de capa</Label>
        {coverImage && (
          <div className="relative mb-2 overflow-hidden rounded-lg">
            <img src={coverImage} alt="Capa" className="max-h-48 w-full object-cover" />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="absolute right-2 top-2 bg-background/80"
              onClick={() => setCoverImage("")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        <Label
          htmlFor="cover-upload"
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground hover:border-primary"
        >
          {uploading ? "A carregar..." : "Clique para fazer upload da imagem de capa"}
        </Label>
        <input
          id="cover-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverUpload}
          disabled={uploading}
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={membersOnly} onCheckedChange={setMembersOnly} id="members-only" />
        <Label htmlFor="members-only">Apenas para alunos autenticados</Label>
      </div>
      <div className="space-y-2">
        <Label>Conteúdo</Label>
        <RichTextEditor content={content} onChange={setContent} />
      </div>
      <div className="flex gap-2">
        <Button onClick={() => save(false)} disabled={publishing} variant="outline">
          {publishing ? "A salvar..." : "Salvar rascunho"}
        </Button>
        <Button
          onClick={() => save(true)}
          disabled={publishing}
          className="bg-primary text-primary-foreground"
        >
          {publishing ? "A publicar..." : "Publicar"}
        </Button>
      </div>
    </div>
  );
}

function PreviewDialog({ post }: { post: BlogPost }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Eye className="mr-1 h-4 w-4" /> Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post.title}</DialogTitle>
        </DialogHeader>
        {post.cover_image && (
          <img src={post.cover_image} alt="" className="w-full max-h-64 object-cover rounded-lg" />
        )}
        <RichTextRenderer content={post.content} />
      </DialogContent>
    </Dialog>
  );
}

export function BlogAdminTab({ currentUserId }: { currentUserId: string }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts((data ?? []) as BlogPost[]);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (p: BlogPost) => {
    if (p.author_id !== currentUserId) return toast.error("Só o autor pode apagar este post");
    if (!confirm(`Apagar post "${p.title}"?`)) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Post apagado");
    load();
  };

  const openEdit = (p: BlogPost) => {
    if (p.author_id !== currentUserId) return toast.error("Só o autor pode editar este post");
    setEditingPost(p);
    setShowForm(true);
  };

  const handleDone = () => {
    setShowForm(false);
    setEditingPost(null);
    load();
  };

  return (
    <div className="space-y-6 pt-4">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Blog Posts ({posts.length})</h2>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground"
                onClick={() => {
                  setEditingPost(null);
                }}
              >
                <Plus className="mr-1 h-4 w-4" /> Novo post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPost ? "Editar post" : "Novo post"}</DialogTitle>
              </DialogHeader>
              <PostForm post={editingPost} currentUserId={currentUserId} onDone={handleDone} />
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {posts.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Nenhum post ainda.</p>
        </Card>
      ) : (
        <Card className="p-6">
          <ul className="divide-y divide-border">
            {posts.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString("pt-PT")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {p.published ? (
                    <Badge variant="default" className="bg-green-700">
                      Publicado
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Rascunho</Badge>
                  )}
                  {p.members_only && (
                    <Badge variant="default" className="bg-gold text-gold-foreground">
                      Exclusivo
                    </Badge>
                  )}
                  <PreviewDialog post={p} />
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(p)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

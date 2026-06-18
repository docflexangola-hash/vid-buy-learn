import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { RichTextRenderer } from "@/components/RichTextRenderer";
import { Calendar, User, Lock, ArrowLeft } from "lucide-react";

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
  author_name?: string;
};

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug.replace(/-/g, " ")} — Ondjango Capital` }],
  }),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setCheckingAuth(false);
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*, profiles!inner(full_name)")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (!data) {
        setLoading(false);
        return;
      }

      const d = data as any;
      setPost({
        id: d.id,
        title: d.title,
        slug: d.slug,
        content: d.content,
        excerpt: d.excerpt,
        cover_image: d.cover_image,
        author_id: d.author_id,
        published: d.published,
        members_only: d.members_only,
        created_at: d.created_at,
        author_name: d.profiles?.full_name ?? "Admin",
      });
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading || checkingAuth) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="p-10 text-center text-muted-foreground">A carregar...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-primary">404</h1>
          <p className="mt-2 text-muted-foreground">Post não encontrado.</p>
          <Button asChild className="mt-6">
            <Link to="/blog">Voltar ao blog</Link>
          </Button>
        </div>
      </div>
    );
  }

  const blocked = post.members_only && !user;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-4 py-12">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao blog
        </Link>

        {post.cover_image && (
          <img
            src={post.cover_image}
            alt=""
            className="mt-6 w-full max-h-80 object-cover rounded-xl"
          />
        )}

        <h1 className="mt-6 text-3xl font-bold text-primary md:text-4xl">{post.title}</h1>

        <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(post.created_at).toLocaleDateString("pt-PT")}
          </span>
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {post.author_name}
          </span>
        </div>

        <div className="mt-8">
          {blocked ? (
            <div className="rounded-xl border border-gold/30 bg-gold/5 p-8 text-center">
              <Lock className="mx-auto h-8 w-8 text-gold" />
              <h2 className="mt-3 text-lg font-semibold">Conteúdo exclusivo para alunos</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Este artigo é apenas para alunos autenticados. Faça login para ler.
              </p>
              {post.excerpt && (
                <div className="mt-4 rounded-lg bg-card p-4 text-left text-sm text-muted-foreground">
                  {post.excerpt}
                </div>
              )}
              <Button asChild className="mt-6 bg-gold text-gold-foreground hover:bg-gold/90">
                <Link to="/auth">Entrar na plataforma</Link>
              </Button>
            </div>
          ) : (
            <RichTextRenderer content={post.content} />
          )}
        </div>
      </article>
    </div>
  );
}

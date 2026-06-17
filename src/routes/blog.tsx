import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Lock } from "lucide-react";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  author_id: string;
  published: boolean;
  members_only: boolean;
  created_at: string;
  author_name?: string;
};

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Ondjango Capital" },
      {
        name: "description",
        content: "Artigos sobre corte e costura, dicas e novidades do mundo da moda.",
      },
    ],
  }),
  component: BlogList,
});

const POSTS_PER_PAGE = 10;

function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const load = async (pageNum: number) => {
    setLoading(true);
    const from = pageNum * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    const { data } = await supabase
      .from("blog_posts")
      .select(
        "id, title, slug, excerpt, cover_image, author_id, members_only, created_at, profiles!inner(full_name)",
      )
      .eq("published", true)
      .order("created_at", { ascending: false })
      .range(from, to);

    const mapped = ((data ?? []) as any[]).map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      cover_image: p.cover_image,
      author_id: p.author_id,
      members_only: p.members_only,
      published: true,
      created_at: p.created_at,
      author_name: (p.profiles as any)?.full_name ?? "Admin",
    })) as BlogPost[];

    if (pageNum === 0) setPosts(mapped);
    else setPosts((prev) => [...prev, ...mapped]);
    setHasMore(mapped.length === POSTS_PER_PAGE);
    setLoading(false);
  };

  useEffect(() => {
    load(0);
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold text-primary md:text-4xl">Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Artigos, dicas e novidades sobre corte e costura
        </p>

        <div className="mt-10 space-y-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="block group"
            >
              <Card className="flex overflow-hidden transition-shadow hover:shadow-md">
                {post.cover_image ? (
                  <div className="hidden w-48 shrink-0 sm:block">
                    <img src={post.cover_image} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="hidden w-48 shrink-0 bg-gradient-to-br from-primary/10 to-gold/10 sm:block" />
                )}
                <div className="flex flex-1 flex-col justify-center p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(post.created_at).toLocaleDateString("pt-PT")}
                    <User className="ml-2 h-3.5 w-3.5" />
                    {post.author_name}
                    {post.members_only && (
                      <Badge variant="secondary" className="ml-2 gap-1 bg-gold/15 text-gold">
                        <Lock className="h-3 w-3" /> Exclusivo alunos
                      </Badge>
                    )}
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-primary group-hover:text-gold transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {loading && <p className="mt-8 text-center text-sm text-muted-foreground">A carregar...</p>}

        {hasMore && !loading && (
          <div className="mt-8 text-center">
            <Button variant="outline" onClick={() => load(page + 1)}>
              Carregar mais
            </Button>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground">Nenhum artigo publicado ainda.</p>
        )}
      </div>
    </div>
  );
}

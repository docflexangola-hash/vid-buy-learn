import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CDPDOa_J.mjs";
import { _ as require_jsx_runtime, v as require_react } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-DRsC1qZi.mjs";
import { u as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as SiteHeader } from "./SiteHeader-Iq68lQMD.mjs";
import { t as Card } from "./card-BLWafi8D.mjs";
import { L as Calendar, g as Lock, r as User } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-Cc0IblCb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/blog-Bg1m_s_U.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var POSTS_PER_PAGE = 10;
function BlogList() {
	const [posts, setPosts] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [page, setPage] = (0, import_react.useState)(0);
	const [hasMore, setHasMore] = (0, import_react.useState)(false);
	const load = async (pageNum) => {
		setLoading(true);
		const from = pageNum * POSTS_PER_PAGE;
		const to = from + POSTS_PER_PAGE - 1;
		const { data } = await supabase.from("blog_posts").select("id, title, slug, excerpt, cover_image, author_id, members_only, created_at, profiles!inner(full_name)").eq("published", true).order("created_at", { ascending: false }).range(from, to);
		const mapped = (data ?? []).map((p) => ({
			id: p.id,
			title: p.title,
			slug: p.slug,
			excerpt: p.excerpt,
			cover_image: p.cover_image,
			author_id: p.author_id,
			members_only: p.members_only,
			published: true,
			created_at: p.created_at,
			author_name: p.profiles?.full_name ?? "Admin"
		}));
		if (pageNum === 0) setPosts(mapped);
		else setPosts((prev) => [...prev, ...mapped]);
		setHasMore(mapped.length === POSTS_PER_PAGE);
		setLoading(false);
	};
	(0, import_react.useEffect)(() => {
		load(0);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl px-4 py-12",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-bold text-primary md:text-4xl",
					children: "Blog"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted-foreground",
					children: "Artigos, dicas e novidades sobre corte e costura"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-10 space-y-6",
					children: posts.map((post) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/blog/$slug",
						params: { slug: post.slug },
						className: "block group",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "flex overflow-hidden transition-shadow hover:shadow-md",
							children: [post.cover_image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "hidden w-48 shrink-0 sm:block",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: post.cover_image,
									alt: "",
									className: "h-full w-full object-cover"
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hidden w-48 shrink-0 bg-gradient-to-br from-primary/10 to-gold/10 sm:block" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-1 flex-col justify-center p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-xs text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5" }),
											new Date(post.created_at).toLocaleDateString("pt-PT"),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "ml-2 h-3.5 w-3.5" }),
											post.author_name,
											post.members_only && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
												variant: "secondary",
												className: "ml-2 gap-1 bg-gold/15 text-gold",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3 w-3" }), " Exclusivo alunos"]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-2 text-lg font-semibold text-primary group-hover:text-gold transition-colors",
										children: post.title
									}),
									post.excerpt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted-foreground line-clamp-2",
										children: post.excerpt
									})
								]
							})]
						})
					}, post.id))
				}),
				loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-8 text-center text-sm text-muted-foreground",
					children: "A carregar..."
				}),
				hasMore && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => load(page + 1),
						children: "Carregar mais"
					})
				}),
				!loading && posts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-10 text-center text-muted-foreground",
					children: "Nenhum artigo publicado ainda."
				})
			]
		})]
	});
}
//#endregion
export { BlogList as component };

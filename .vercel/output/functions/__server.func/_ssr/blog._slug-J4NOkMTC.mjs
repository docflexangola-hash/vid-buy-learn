import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CDPDOa_J.mjs";
import { _ as require_jsx_runtime, v as require_react } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-DRsC1qZi.mjs";
import { d as useNavigate, u as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as SiteHeader } from "./SiteHeader-Iq68lQMD.mjs";
import { H as ArrowLeft, L as Calendar, g as Lock, r as User } from "../_libs/lucide-react.mjs";
import { t as RichTextRenderer } from "./RichTextRenderer-CILdd3ec.mjs";
import { t as Route } from "./blog._slug-Dl4H9Yke.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/blog._slug-J4NOkMTC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BlogPostPage() {
	const { slug } = Route.useParams();
	useNavigate();
	const [post, setPost] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [user, setUser] = (0, import_react.useState)(null);
	const [checkingAuth, setCheckingAuth] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		supabase.auth.getUser().then(({ data }) => {
			setUser(data.user);
			setCheckingAuth(false);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		const load = async () => {
			const { data } = await supabase.from("blog_posts").select("*, profiles!inner(full_name)").eq("slug", slug).eq("published", true).single();
			if (!data) {
				setLoading(false);
				return;
			}
			const d = data;
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
				author_name: d.profiles?.full_name ?? "Admin"
			});
			setLoading(false);
		};
		load();
	}, [slug]);
	if (loading || checkingAuth) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "p-10 text-center text-muted-foreground",
			children: "A carregar..."
		})]
	});
	if (!post) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-3xl px-4 py-20 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-4xl font-bold text-primary",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted-foreground",
					children: "Post não encontrado."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/blog",
						children: "Voltar ao blog"
					})
				})
			]
		})]
	});
	const blocked = post.members_only && !user;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "mx-auto max-w-3xl px-4 py-12",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/blog",
					className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gold transition-colors",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Voltar ao blog"]
				}),
				post.cover_image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: post.cover_image,
					alt: "",
					className: "mt-6 w-full max-h-80 object-cover rounded-xl"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-6 text-3xl font-bold text-primary md:text-4xl",
					children: post.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center gap-3 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4" }), new Date(post.created_at).toLocaleDateString("pt-PT")]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4" }), post.author_name]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8",
					children: blocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-gold/30 bg-gold/5 p-8 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mx-auto h-8 w-8 text-gold" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-3 text-lg font-semibold",
								children: "Conteúdo exclusivo para alunos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "Este artigo é apenas para alunos autenticados. Faça login para ler."
							}),
							post.excerpt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 rounded-lg bg-card p-4 text-left text-sm text-muted-foreground",
								children: post.excerpt
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								className: "mt-6 bg-gold text-gold-foreground hover:bg-gold/90",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/auth",
									children: "Entrar na plataforma"
								})
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichTextRenderer, { content: post.content })
				})
			]
		})]
	});
}
//#endregion
export { BlogPostPage as component };

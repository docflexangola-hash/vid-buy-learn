import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CDPDOa_J.mjs";
import { t as COURSE } from "./course-DmnKEs2C.mjs";
import { _ as require_jsx_runtime, v as require_react } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as cn, t as Button } from "./button-DRsC1qZi.mjs";
import { d as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as SiteHeader } from "./SiteHeader-Iq68lQMD.mjs";
import { t as Card } from "./card-BLWafi8D.mjs";
import { n as Label, t as Input } from "./label-CmIE8x5o.mjs";
import { A as Clock, C as Heading3, D as Eye, E as FileText, P as CircleCheckBig, R as BookOpen, S as Image, T as GraduationCap, U as ArrowDown, V as ArrowUp, W as Activity, _ as List, a as Upload, b as LayoutDashboard, c as Trash2, d as Shield, f as Quote, h as MessageSquare, i as UserCheck, j as CircleX, k as DollarSign, m as PenLine, n as Users, o as Underline, p as Plus, s as TrendingUp, v as ListOrdered, w as Heading2, x as Italic, y as Link, z as Bold } from "../_libs/lucide-react.mjs";
import { a as DialogTrigger, i as DialogTitle, n as DialogContent, o as Textarea, r as DialogHeader, t as Dialog } from "./dialog-PKvBy6tW.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BYfOmXtJ.mjs";
import { t as Badge } from "./badge-Cc0IblCb.mjs";
import { t as RichTextRenderer } from "./RichTextRenderer-CILdd3ec.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as Area, c as ResponsiveContainer, i as XAxis, l as Tooltip, n as BarChart, o as CartesianGrid, r as YAxis, s as Bar, t as AreaChart } from "../_libs/recharts+[...].mjs";
import { n as useEditor, t as EditorContent } from "../_libs/fast-equals+tiptap__react.mjs";
import { n as Thumb, t as Root } from "../_libs/radix-ui__react-switch.mjs";
import { n as index_default } from "../_libs/@tiptap/extension-link+[...].mjs";
import { n as index_default$1 } from "../_libs/tiptap__extension-underline.mjs";
import { t as index_default$2 } from "../_libs/tiptap__starter-kit.mjs";
import { t as index_default$3 } from "../_libs/tiptap__extension-image.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-CxDBH-JR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EVOGO_API_URL = "https://api.evo-go.com/message/send";
function getConfig() {
	const instanceId = process.env.EVOGO_INSTANCE_ID;
	const token = process.env.EVOGO_TOKEN;
	if (!instanceId || !token) return null;
	return {
		instanceId,
		token
	};
}
async function sendWhatsApp(phone, message) {
	const config = getConfig();
	if (!config) {
		console.warn("[WhatsApp] Evo Go not configured. Set EVOGO_INSTANCE_ID and EVOGO_TOKEN.");
		return false;
	}
	const formatted = phone.startsWith("+") ? phone.substring(1) : phone;
	try {
		const res = await fetch(`${EVOGO_API_URL}/${config.instanceId}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${config.token}`
			},
			body: JSON.stringify({
				number: formatted,
				text: message
			})
		});
		if (!res.ok) {
			console.error("[WhatsApp] Failed to send:", await res.text());
			return false;
		}
		return true;
	} catch (err) {
		console.error("[WhatsApp] Error:", err);
		return false;
	}
}
function enrollmentActivatedMessage(name) {
	return `Olá ${name}, o teu acesso ao curso *Costura do Zero ao Profissional* foi ativado! 🎉

Já podes começar a assistir às aulas em: https://ondjangocapital.com/curso

Bons estudos! 💪`;
}
function certificateApprovedMessage(name) {
	return `Olá ${name}, o teu certificado do curso *Costura do Zero ao Profissional* foi aprovado e já está disponível! 🎉

Parabéns pela conclusão! 🏆`;
}
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Root.displayName;
function RichTextEditor({ content, onChange, placeholder }) {
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const editor = useEditor({
		extensions: [
			index_default$2.configure({ heading: { levels: [2, 3] } }),
			index_default$1,
			index_default.configure({
				openOnClick: true,
				HTMLAttributes: { class: "text-gold underline" }
			}),
			index_default$3.configure({ HTMLAttributes: { class: "max-w-full rounded-xl mx-auto" } })
		],
		content,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
		editorProps: { attributes: { class: "prose prose-sm sm:prose-base max-w-none min-h-[250px] focus:outline-none px-4 py-3 rounded-md border border-input bg-transparent" } }
	});
	const addLink = (0, import_react.useCallback)(() => {
		if (!editor) return;
		const url = window.prompt("URL do link:");
		if (url) editor.chain().focus().setLink({ href: url }).run();
	}, [editor]);
	const addImage = (0, import_react.useCallback)(async () => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toolbar, {
			editor,
			onAddLink: addLink,
			onAddImage: addImage,
			uploading
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorContent, {
			editor,
			placeholder
		})]
	});
}
function Toolbar({ editor, onAddLink, onAddImage, uploading }) {
	const btn = (active, onClick, icon, title) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		size: "sm",
		variant: active ? "default" : "outline",
		onClick,
		title,
		className: "h-8 w-8 p-0",
		children: icon
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-1 rounded-md border border-input bg-card p-1.5",
		children: [
			btn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bold, { className: "h-4 w-4" }), "Negrito"),
			btn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Italic, { className: "h-4 w-4" }), "Itálico"),
			btn(editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Underline, { className: "h-4 w-4" }), "Sublinhado"),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 h-6 w-px bg-border" }),
			btn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heading2, { className: "h-4 w-4" }), "Título 2"),
			btn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heading3, { className: "h-4 w-4" }), "Título 3"),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 h-6 w-px bg-border" }),
			btn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "h-4 w-4" }), "Lista"),
			btn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListOrdered, { className: "h-4 w-4" }), "Lista numerada"),
			btn(editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quote, { className: "h-4 w-4" }), "Citação"),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 h-6 w-px bg-border" }),
			btn(editor.isActive("link"), onAddLink, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { className: "h-4 w-4" }), "Link"),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "sm",
				variant: "outline",
				onClick: onAddImage,
				disabled: uploading,
				title: "Imagem",
				className: "h-8 w-8 p-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "h-4 w-4" })
			})
		]
	});
}
function toSlug(title) {
	return title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-").trim();
}
async function ensureUniqueSlug(base, excludeId) {
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
function PostForm({ post, currentUserId, onDone }) {
	const [title, setTitle] = (0, import_react.useState)(post?.title ?? "");
	const [slug, setSlug] = (0, import_react.useState)(post?.slug ?? "");
	const [slugAuto, setSlugAuto] = (0, import_react.useState)(true);
	const [content, setContent] = (0, import_react.useState)(post?.content ?? "");
	const [excerpt, setExcerpt] = (0, import_react.useState)(post?.excerpt ?? "");
	const [coverImage, setCoverImage] = (0, import_react.useState)(post?.cover_image ?? "");
	const [membersOnly, setMembersOnly] = (0, import_react.useState)(post?.members_only ?? false);
	const [publishing, setPublishing] = (0, import_react.useState)(false);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(false);
	const handleTitleChange = (val) => {
		setTitle(val);
		if (slugAuto) setSlug(toSlug(val));
	};
	const save = async (published) => {
		if (!title.trim()) return toast.error("O título é obrigatório");
		const finalSlug = await ensureUniqueSlug(slug || toSlug(title), post?.id);
		const finalExcerpt = excerpt.trim() || content.replace(/<[^>]+>/g, "").slice(0, 150).trim();
		const payload = {
			title: title.trim(),
			slug: finalSlug,
			content,
			excerpt: finalExcerpt,
			cover_image: coverImage || null,
			author_id: currentUserId,
			published,
			members_only: membersOnly
		};
		setPublishing(true);
		const { error } = post ? await supabase.from("blog_posts").update(payload).eq("id", post.id) : await supabase.from("blog_posts").insert(payload);
		setPublishing(false);
		if (error) return toast.error(error.message);
		toast.success(published ? "Post publicado!" : "Rascunho salvo");
		onDone();
	};
	const handleCoverUpload = async (e) => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Título" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: title,
					onChange: (e) => handleTitleChange(e.target.value),
					placeholder: "Título do post"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Slug" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: slug,
						onChange: (e) => {
							setSlug(e.target.value);
							setSlugAuto(false);
						},
						placeholder: "url-do-post",
						className: "flex-1"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: () => {
							setSlug(toSlug(title));
							setSlugAuto(true);
						},
						children: "Auto"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Excerto (opcional — se vazio, auto-gerado)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: excerpt,
					onChange: (e) => setExcerpt(e.target.value),
					rows: 2
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Imagem de capa" }),
					coverImage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mb-2 overflow-hidden rounded-lg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: coverImage,
							alt: "Capa",
							className: "max-h-48 w-full object-cover"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							variant: "ghost",
							className: "absolute right-2 top-2 bg-background/80",
							onClick: () => setCoverImage(""),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "cover-upload",
						className: "flex cursor-pointer items-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground hover:border-primary",
						children: uploading ? "A carregar..." : "Clique para fazer upload da imagem de capa"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "cover-upload",
						type: "file",
						accept: "image/*",
						className: "hidden",
						onChange: handleCoverUpload,
						disabled: uploading
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					checked: membersOnly,
					onCheckedChange: setMembersOnly,
					id: "members-only"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "members-only",
					children: "Apenas para alunos autenticados"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Conteúdo" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichTextEditor, {
					content,
					onChange: setContent
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => save(false),
					disabled: publishing,
					variant: "outline",
					children: publishing ? "A salvar..." : "Salvar rascunho"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => save(true),
					disabled: publishing,
					className: "bg-primary text-primary-foreground",
					children: publishing ? "A publicar..." : "Publicar"
				})]
			})
		]
	});
}
function PreviewDialog({ post }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			size: "sm",
			variant: "outline",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "mr-1 h-4 w-4" }), " Preview"]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: "max-w-3xl max-h-[80vh] overflow-y-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: post.title }) }),
			post.cover_image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: post.cover_image,
				alt: "",
				className: "w-full max-h-64 object-cover rounded-lg"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichTextRenderer, { content: post.content })
		]
	})] });
}
function BlogAdminTab({ currentUserId }) {
	const [posts, setPosts] = (0, import_react.useState)([]);
	const [editingPost, setEditingPost] = (0, import_react.useState)(null);
	const [showForm, setShowForm] = (0, import_react.useState)(false);
	const load = async () => {
		const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
		setPosts(data ?? []);
	};
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const remove = async (p) => {
		if (p.author_id !== currentUserId) return toast.error("Só o autor pode apagar este post");
		if (!confirm(`Apagar post "${p.title}"?`)) return;
		const { error } = await supabase.from("blog_posts").delete().eq("id", p.id);
		if (error) return toast.error(error.message);
		toast.success("Post apagado");
		load();
	};
	const openEdit = (p) => {
		if (p.author_id !== currentUserId) return toast.error("Só o autor pode editar este post");
		setEditingPost(p);
		setShowForm(true);
	};
	const handleDone = () => {
		setShowForm(false);
		setEditingPost(null);
		load();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 pt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "p-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "text-lg font-semibold text-primary",
					children: [
						"Blog Posts (",
						posts.length,
						")"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open: showForm,
					onOpenChange: setShowForm,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							className: "bg-primary text-primary-foreground",
							onClick: () => {
								setEditingPost(null);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-4 w-4" }), " Novo post"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
						className: "max-w-3xl max-h-[85vh] overflow-y-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editingPost ? "Editar post" : "Novo post" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostForm, {
							post: editingPost,
							currentUserId,
							onDone: handleDone
						})]
					})]
				})]
			})
		}), posts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "p-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Nenhum post ainda."
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "p-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border",
				children: posts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5 shrink-0 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium truncate",
								children: p.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: new Date(p.created_at).toLocaleDateString("pt-PT")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 shrink-0",
							children: [
								p.published ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "default",
									className: "bg-green-700",
									children: "Publicado"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									children: "Rascunho"
								}),
								p.members_only && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "default",
									className: "bg-gold text-gold-foreground",
									children: "Exclusivo"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewDialog, { post: p }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "ghost",
									onClick: () => openEdit(p),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "ghost",
									onClick: () => remove(p),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
								})
							]
						})
					]
				}, p.id))
			})
		})]
	});
}
function AdminPage() {
	const navigate = useNavigate();
	const [allowed, setAllowed] = (0, import_react.useState)(null);
	const [lessons, setLessons] = (0, import_react.useState)([]);
	const [students, setStudents] = (0, import_react.useState)([]);
	const [title, setTitle] = (0, import_react.useState)("");
	const [desc, setDesc] = (0, import_react.useState)("");
	const [url, setUrl] = (0, import_react.useState)("");
	const [activeTab, setActiveTab] = (0, import_react.useState)("dashboard");
	const [profileStudent, setProfileStudent] = (0, import_react.useState)(null);
	const [currentUserId, setCurrentUserId] = (0, import_react.useState)("");
	const loadLessons = async () => {
		const { data } = await supabase.from("lessons").select("*").order("position");
		setLessons(data ?? []);
	};
	const loadStudents = async () => {
		const { data: enr } = await supabase.from("enrollments").select("id, status, created_at, user_id").order("created_at", { ascending: false });
		const list = enr ?? [];
		const ids = list.map((s) => s.user_id);
		if (ids.length) {
			const { data: profs } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
			const map = new Map((profs ?? []).map((p) => [p.id, p]));
			list.forEach((s) => {
				const p = map.get(s.user_id);
				s.profile = p ? {
					full_name: p.full_name,
					email: p.email
				} : null;
			});
		}
		setStudents(list);
	};
	(0, import_react.useEffect)(() => {
		const check = async () => {
			const { data: u } = await supabase.auth.getUser();
			if (!u.user) return navigate({ to: "/auth" });
			const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
			const ok = !!roles?.some((r) => r.role === "admin");
			setAllowed(ok);
			if (ok) {
				setCurrentUserId(u.user.id);
				await loadLessons();
				await loadStudents();
			}
		};
		check();
	}, [navigate]);
	if (allowed === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "p-10 text-center text-muted-foreground",
			children: "A carregar..."
		})]
	});
	if (!allowed) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "p-10 text-center text-muted-foreground",
			children: "Acesso restrito a administradores."
		})]
	});
	const addLesson = async (e) => {
		e.preventDefault();
		const next = lessons.length ? Math.max(...lessons.map((l) => l.position)) + 1 : 1;
		const { error } = await supabase.from("lessons").insert({
			title,
			description: desc,
			video_url: url,
			position: next
		});
		if (error) return toast.error(error.message);
		toast.success("Aula adicionada");
		setTitle("");
		setDesc("");
		setUrl("");
		loadLessons();
	};
	const move = async (l, dir) => {
		const swap = lessons[lessons.findIndex((x) => x.id === l.id) + dir];
		if (!swap) return;
		await Promise.all([supabase.from("lessons").update({ position: swap.position }).eq("id", l.id), supabase.from("lessons").update({ position: l.position }).eq("id", swap.id)]);
		loadLessons();
	};
	const removeLesson = async (l) => {
		if (!confirm(`Apagar aula "${l.title}"?`)) return;
		const { error } = await supabase.from("lessons").delete().eq("id", l.id);
		if (error) return toast.error(error.message);
		loadLessons();
	};
	const setStatus = async (s, newStatus) => {
		const { error } = await supabase.from("enrollments").update({ status: newStatus }).eq("id", s.id);
		if (error) {
			toast.error(error.message);
			return loadStudents();
		}
		toast.success(newStatus === "active" ? "Acesso liberado" : "Acesso revogado");
		if (newStatus === "active" && s.profile?.full_name) {
			const { data: prof } = await supabase.from("profiles").select("whatsapp_number").eq("id", s.user_id).single();
			if (prof?.whatsapp_number) sendWhatsApp(prof.whatsapp_number, enrollmentActivatedMessage(s.profile.full_name));
		}
		loadStudents();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-5xl px-4 py-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold text-primary md:text-3xl",
					children: "Painel admin"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
					value: activeTab,
					onValueChange: setActiveTab,
					className: "mt-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "dashboard",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "mr-1.5 h-4 w-4" }), "Dashboard"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "lessons",
								children: [
									"Aulas (",
									lessons.length,
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "students",
								children: [
									"Alunos (",
									students.length,
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "certificates",
								children: "Certificados"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "admins",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "mr-1.5 h-4 w-4" }), "Admins"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "blog",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "mr-1.5 h-4 w-4" }), "Blog"]
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "lessons",
							className: "space-y-6 pt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "p-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-semibold text-primary",
									children: "Adicionar nova aula"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: addLesson,
									className: "mt-4 space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Título" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: title,
												onChange: (e) => setTitle(e.target.value),
												required: true
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Descrição (opcional)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												value: desc,
												onChange: (e) => setDesc(e.target.value)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "URL do vídeo (YouTube)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: url,
												onChange: (e) => setUrl(e.target.value),
												placeholder: "https://www.youtube.com/watch?v=...",
												required: true
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "submit",
											className: "bg-primary text-primary-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), " Adicionar"]
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "p-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-semibold text-primary",
									children: "Aulas"
								}), lessons.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm text-muted-foreground",
									children: "Nenhuma aula ainda."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-4 divide-y divide-border",
									children: lessons.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-center gap-3 py-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "w-6 text-sm text-muted-foreground",
												children: [i + 1, "."]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-medium",
													children: l.title
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "truncate text-xs text-muted-foreground",
													children: l.video_url
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MaterialsDialog, { lesson: l }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuizzesDialog, { lesson: l }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "icon",
												variant: "ghost",
												onClick: () => move(l, -1),
												disabled: i === 0,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "h-4 w-4" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "icon",
												variant: "ghost",
												onClick: () => move(l, 1),
												disabled: i === lessons.length - 1,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "h-4 w-4" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "icon",
												variant: "ghost",
												onClick: () => removeLesson(l),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
											})
										]
									}, l.id))
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "students",
							className: "pt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "p-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-semibold text-primary",
									children: "Alunos & inscrições"
								}), students.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm text-muted-foreground",
									children: "Ainda não há pedidos de inscrição."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-4 divide-y divide-border",
									children: students.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex flex-col gap-3 py-3 md:flex-row md:items-center",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => setProfileStudent(s),
													className: "font-medium text-left hover:text-gold hover:underline",
													children: s.profile?.full_name || "(sem nome)"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted-foreground",
													children: s.profile?.email
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `rounded-full px-3 py-1 text-xs font-semibold ${s.status === "active" ? "bg-gold text-gold-foreground" : "bg-secondary text-secondary-foreground"}`,
												children: s.status === "active" ? "Ativo" : "Pendente"
											}),
											s.status === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												onClick: () => setStatus(s, "active"),
												className: "bg-primary text-primary-foreground",
												children: "Liberar acesso"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => setStatus(s, "pending"),
												children: "Revogar"
											})
										]
									}, s.id))
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "certificates",
							className: "pt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CertificatesTab, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "dashboard",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardTab, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "admins",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminsTab, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "blog",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlogAdminTab, { currentUserId })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentProfileDialog, {
					student: profileStudent,
					open: !!profileStudent,
					onOpenChange: (v) => {
						if (!v) setProfileStudent(null);
					}
				})
			]
		})]
	});
}
function MaterialsDialog({ lesson }) {
	const [materials, setMaterials] = (0, import_react.useState)([]);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const load = async () => {
		const { data } = await supabase.from("lesson_materials").select("*").eq("lesson_id", lesson.id).order("created_at");
		setMaterials(data ?? []);
	};
	const handleUpload = async (e) => {
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
			file_url: urlData.publicUrl
		});
		if (error) toast.error(error.message);
		else toast.success("Material adicionado");
		setUploading(false);
		load();
	};
	const remove = async (m) => {
		const { error } = await supabase.from("lesson_materials").delete().eq("id", m.id);
		if (error) return toast.error(error.message);
		toast.success("Material removido");
		load();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: (v) => {
			setOpen(v);
			if (v) load();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "outline",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "mr-1 h-4 w-4" }), " Materiais"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Materiais — ", lesson.title] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
					htmlFor: "file-upload",
					className: "flex cursor-pointer items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground hover:border-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-5 w-5" }), uploading ? "A carregar..." : "Clique para fazer upload (PDF ou imagem)"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "file-upload",
					type: "file",
					accept: ".pdf,image/*",
					className: "hidden",
					onChange: handleUpload,
					disabled: uploading
				}),
				materials.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Nenhum material ainda."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: materials.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2 rounded-lg bg-secondary p-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 shrink-0" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: m.file_url,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "flex-1 truncate hover:underline",
								children: m.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								className: "h-7 w-7",
								onClick: () => remove(m),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
							})
						]
					}, m.id))
				})
			]
		})] })]
	});
}
function QuizzesDialog({ lesson }) {
	const [quizzes, setQuizzes] = (0, import_react.useState)([]);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [question, setQuestion] = (0, import_react.useState)("");
	const [options, setOptions] = (0, import_react.useState)([
		"",
		"",
		"",
		""
	]);
	const [correctIndex, setCorrectIndex] = (0, import_react.useState)(0);
	const load = async () => {
		const { data } = await supabase.from("lesson_quizzes").select("*").eq("lesson_id", lesson.id).order("position");
		setQuizzes(data ?? []);
	};
	const add = async () => {
		if (!question.trim() || options.some((o) => !o.trim())) return toast.error("Preenche a pergunta e todas as opções.");
		const next = quizzes.length ? Math.max(...quizzes.map((q) => q.position)) + 1 : 1;
		const { error } = await supabase.from("lesson_quizzes").insert({
			lesson_id: lesson.id,
			question: question.trim(),
			options,
			correct_index: correctIndex,
			position: next
		});
		if (error) return toast.error(error.message);
		toast.success("Pergunta adicionada");
		setQuestion("");
		setOptions([
			"",
			"",
			"",
			""
		]);
		setCorrectIndex(0);
		load();
	};
	const remove = async (q) => {
		const { error } = await supabase.from("lesson_quizzes").delete().eq("id", q.id);
		if (error) return toast.error(error.message);
		load();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: (v) => {
			setOpen(v);
			if (v) load();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "outline",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "mr-1 h-4 w-4" }), " Quizzes"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Quizzes — ", lesson.title] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 rounded-lg border p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-semibold",
							children: "Nova pergunta"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: question,
									onChange: (e) => setQuestion(e.target.value),
									placeholder: "Pergunta..."
								}),
								options.map((opt, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "radio",
										name: "correct",
										checked: correctIndex === i,
										onChange: () => setCorrectIndex(i),
										className: "shrink-0"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: opt,
										onChange: (e) => {
											const n = [...options];
											n[i] = e.target.value;
											setOptions(n);
										},
										placeholder: `Opção ${i + 1}`
									})]
								}, i)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Seleciona o rádio ao lado da opção correta."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: add,
							className: "mt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-4 w-4" }), "Adicionar"]
						})
					]
				}), quizzes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Nenhuma pergunta ainda."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: quizzes.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-lg bg-secondary p-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: q.question
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								className: "h-6 w-6 shrink-0",
								onClick: () => remove(q),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-1 space-y-0.5 text-muted-foreground",
							children: q.options.map((opt, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: i === q.correct_index ? "font-medium text-green-600" : "",
								children: [i === q.correct_index ? "✓ " : "", opt]
							}, i))
						})]
					}, q.id))
				})]
			})]
		})]
	});
}
function CertificatesTab() {
	const [requests, setRequests] = (0, import_react.useState)([]);
	const [rejectionText, setRejectionText] = (0, import_react.useState)({});
	const load = async () => {
		const { data } = await supabase.from("certificate_requests").select("*").order("requested_at", { ascending: false });
		const list = data ?? [];
		const ids = list.map((r) => r.user_id);
		if (ids.length) {
			const { data: profs } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
			const map = new Map((profs ?? []).map((p) => [p.id, p]));
			list.forEach((r) => {
				const p = map.get(r.user_id);
				r.profile = p ? {
					full_name: p.full_name,
					email: p.email
				} : null;
			});
		}
		setRequests(list);
	};
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const approve = async (r) => {
		const { data: userData } = await supabase.auth.getUser();
		const certUrl = `/certificates/${r.user_id}.pdf`;
		const { error } = await supabase.from("certificate_requests").update({
			status: "approved",
			certificate_url: certUrl,
			reviewed_at: (/* @__PURE__ */ new Date()).toISOString(),
			reviewer_id: userData.user?.id
		}).eq("id", r.id);
		if (error) return toast.error(error.message);
		toast.success("Certificado aprovado");
		if (r.profile?.full_name) {
			const { data: prof } = await supabase.from("profiles").select("whatsapp_number").eq("id", r.user_id).single();
			if (prof?.whatsapp_number) sendWhatsApp(prof.whatsapp_number, certificateApprovedMessage(r.profile.full_name));
		}
		load();
	};
	const reject = async (r) => {
		const reason = rejectionText[r.id]?.trim();
		if (!reason) return toast.error("Indica o motivo da rejeição.");
		const { data: userData } = await supabase.auth.getUser();
		const { error } = await supabase.from("certificate_requests").update({
			status: "rejected",
			rejection_reason: reason,
			reviewed_at: (/* @__PURE__ */ new Date()).toISOString(),
			reviewer_id: userData.user?.id
		}).eq("id", r.id);
		if (error) return toast.error(error.message);
		toast.success("Certificado rejeitado");
		load();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-lg font-semibold text-primary",
			children: "Pedidos de certificado"
		}), requests.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted-foreground",
			children: "Nenhum pedido ainda."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 divide-y divide-border",
			children: requests.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "py-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 md:flex-row md:items-start md:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: r.profile?.full_name || "(sem nome)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: r.profile?.email
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: ["Pedido: ", new Date(r.requested_at).toLocaleDateString("pt-PT")]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `rounded-full px-3 py-1 text-xs font-semibold ${r.status === "approved" ? "bg-green-100 text-green-700" : r.status === "rejected" ? "bg-red-100 text-red-700" : "bg-gold text-gold-foreground"}`,
							children: r.status === "approved" ? "Aprovado" : r.status === "rejected" ? "Rejeitado" : "Pendente"
						})]
					}),
					r.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: () => approve(r),
								className: "bg-green-600 text-white hover:bg-green-700",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "mr-1 h-4 w-4" }), " Aprovar"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Motivo da rejeição...",
								className: "h-8 w-56 text-xs",
								value: rejectionText[r.id] || "",
								onChange: (e) => setRejectionText({
									...rejectionText,
									[r.id]: e.target.value
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => reject(r),
								className: "text-red-600",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "mr-1 h-4 w-4" }), " Rejeitar"]
							})
						]
					}),
					r.status === "rejected" && r.rejection_reason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-red-600",
						children: ["Motivo: ", r.rejection_reason]
					}),
					r.status === "approved" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-green-600",
						children: "Certificado aprovado."
					})
				]
			}, r.id))
		})]
	});
}
function DashboardTab() {
	const [metrics, setMetrics] = (0, import_react.useState)(null);
	const [enrollmentsByDay, setEnrollmentsByDay] = (0, import_react.useState)([]);
	const [lessonStats, setLessonStats] = (0, import_react.useState)([]);
	const [activity, setActivity] = (0, import_react.useState)([]);
	const load = async () => {
		const { data: enr } = await supabase.from("enrollments").select("id, status, user_id, created_at");
		const list = enr ?? [];
		const active = list.filter((s) => s.status === "active");
		const pending = list.filter((s) => s.status === "pending");
		const { count: certPending } = await supabase.from("certificate_requests").select("*", {
			count: "exact",
			head: true
		}).eq("status", "pending");
		setMetrics({
			totalStudents: list.length,
			activeStudents: active.length,
			pendingStudents: pending.length,
			estimatedRevenue: active.length * COURSE.priceNumber,
			pendingCertificates: certPending ?? 0
		});
		const dayMap = /* @__PURE__ */ new Map();
		list.forEach((s) => {
			const d = s.created_at.slice(0, 10);
			dayMap.set(d, (dayMap.get(d) || 0) + 1);
		});
		setEnrollmentsByDay([...dayMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({
			date,
			count
		})));
		const { data: lessons } = await supabase.from("lessons").select("id, title").order("position");
		const lessonList = lessons ?? [];
		const stats = [];
		for (const l of lessonList) {
			const { count } = await supabase.from("lesson_progress").select("*", {
				count: "exact",
				head: true
			}).eq("lesson_id", l.id);
			stats.push({
				lesson_title: l.title,
				completed: count ?? 0,
				total: active.length,
				pct: active.length > 0 ? Math.round((count ?? 0) / active.length * 100) : 0
			});
		}
		setLessonStats(stats);
		const items = [];
		const { data: enr2 } = await supabase.from("enrollments").select("id, user_id, created_at").order("created_at", { ascending: false }).limit(5);
		const enrollIds = [...new Set((enr2 ?? []).map((e) => e.user_id))];
		if (enrollIds.length) {
			const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", enrollIds);
			const profMap = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
			(enr2 ?? []).forEach((e) => {
				items.push({
					id: `enr-${e.id}`,
					type: "enrollment",
					description: "Novo pedido de inscrição",
					user_name: profMap.get(e.user_id) || "(sem nome)",
					created_at: e.created_at
				});
			});
		}
		const { data: certs } = await supabase.from("certificate_requests").select("id, user_id, status, requested_at").order("requested_at", { ascending: false }).limit(5);
		const certIds = [...new Set((certs ?? []).map((c) => c.user_id))];
		if (certIds.length) {
			const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", certIds);
			const profMap = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
			(certs ?? []).forEach((c) => {
				items.push({
					id: `cert-${c.id}`,
					type: "certificate",
					description: `Pedido de certificado ${c.status === "pending" ? "pendente" : c.status === "approved" ? "aprovado" : "rejeitado"}`,
					user_name: profMap.get(c.user_id) || "(sem nome)",
					created_at: c.requested_at
				});
			});
		}
		const { data: comms } = await supabase.from("lesson_comments").select("id, user_id, created_at").order("created_at", { ascending: false }).limit(5);
		const commIds = [...new Set((comms ?? []).map((c) => c.user_id))];
		if (commIds.length) {
			const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", commIds);
			const profMap = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
			(comms ?? []).forEach((c) => {
				items.push({
					id: `comm-${c.id}`,
					type: "comment",
					description: "Novo comentário numa aula",
					user_name: profMap.get(c.user_id) || "(sem nome)",
					created_at: c.created_at
				});
			});
		}
		items.sort((a, b) => b.created_at.localeCompare(a.created_at));
		setActivity(items.slice(0, 10));
	};
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	if (!metrics) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-8 text-center text-muted-foreground",
		children: "A carregar dashboard..."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 pt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
								children: "Total Alunos"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-3xl font-bold text-primary",
							children: metrics.totalStudents
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-5 w-5 text-green-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
								children: "Ativos"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-3xl font-bold text-green-600",
							children: metrics.activeStudents
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-5 w-5 text-amber-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
								children: "Pendentes"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-3xl font-bold text-amber-600",
							children: metrics.pendingStudents
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-5 w-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
								children: "Receita Estimada"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-3xl font-bold text-primary",
							children: [metrics.estimatedRevenue.toLocaleString("pt-PT"), " Kz"]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "flex items-center gap-2 text-sm font-semibold text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-4 w-4" }), " Matrículas"]
					}), enrollmentsByDay.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted-foreground",
						children: "Sem dados suficientes."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: 200,
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
							data: enrollmentsByDay,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
									id: "colorCount",
									x1: "0",
									y1: "0",
									x2: "0",
									y2: "1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "5%",
										stopColor: "#C9A84C",
										stopOpacity: .3
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "95%",
										stopColor: "#C9A84C",
										stopOpacity: 0
									})]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "hsl(var(--border))"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "date",
									tick: { fontSize: 11 },
									stroke: "hsl(var(--muted-foreground))",
									tickFormatter: (v) => v.slice(5)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									allowDecimals: false,
									tick: { fontSize: 11 },
									stroke: "hsl(var(--muted-foreground))"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "monotone",
									dataKey: "count",
									stroke: "#C9A84C",
									fillOpacity: 1,
									fill: "url(#colorCount)"
								})
							]
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "flex items-center gap-2 text-sm font-semibold text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-4 w-4" }), " Progresso por Aula"]
					}), lessonStats.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted-foreground",
						children: "Sem dados."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: 200,
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: lessonStats,
							layout: "vertical",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "hsl(var(--border))"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									type: "number",
									domain: [0, 100],
									tick: { fontSize: 11 },
									stroke: "hsl(var(--muted-foreground))",
									tickFormatter: (v) => `${v}%`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									dataKey: "lesson_title",
									type: "category",
									width: 120,
									tick: { fontSize: 10 },
									stroke: "hsl(var(--muted-foreground))"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { formatter: (v) => `${v}%` }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "pct",
									fill: "#C9A84C",
									radius: [
										0,
										4,
										4,
										0
									]
								})
							]
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "flex items-center gap-2 text-sm font-semibold text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4" }), " Atividade Recente"]
					}),
					activity.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted-foreground",
						children: "Nenhuma atividade ainda."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 divide-y divide-border",
						children: activity.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-3 py-3 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `flex h-7 w-7 items-center justify-center rounded-full ${a.type === "enrollment" ? "bg-blue-100 text-blue-700" : a.type === "certificate" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`,
									children: a.type === "enrollment" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" }) : a.type === "certificate" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3.5 w-3.5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium",
											children: a.user_name
										}),
										" — ",
										a.description
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "shrink-0 text-xs text-muted-foreground",
									children: new Date(a.created_at).toLocaleDateString("pt-PT", {
										day: "numeric",
										month: "short"
									})
								})
							]
						}, a.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-center gap-4 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3 w-3" }), " Inscrição"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-3 w-3" }), " Certificado"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3 w-3" }), " Comentário"]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "flex items-center gap-2 text-sm font-semibold text-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4" }), " Certificados Pendentes"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-2xl font-bold text-amber-600",
					children: metrics.pendingCertificates
				})]
			})
		]
	});
}
function StudentProfileDialog({ student, open, onOpenChange }) {
	if (!student) return null;
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [progress, setProgress] = (0, import_react.useState)([]);
	const [quizAttempts, setQuizAttempts] = (0, import_react.useState)([]);
	const [comments, setComments] = (0, import_react.useState)(0);
	const [certRequest, setCertRequest] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!open || !student) return;
		const load = async () => {
			const { data: prof } = await supabase.from("profiles").select("full_name, email, whatsapp_number, created_at").eq("id", student.user_id).single();
			setProfile(prof);
			const { data: ls } = await supabase.from("lessons").select("id, title").order("position");
			const allLessons = ls ?? [];
			const { data: pr } = await supabase.from("lesson_progress").select("lesson_id").eq("user_id", student.user_id);
			const doneSet = new Set((pr ?? []).map((p) => p.lesson_id));
			setProgress(allLessons.map((l) => ({
				lesson_id: l.id,
				title: l.title,
				done: doneSet.has(l.id)
			})));
			const { data: quiz } = await supabase.from("quiz_attempts").select("score, total, passed, created_at").eq("user_id", student.user_id).order("created_at", { ascending: false });
			setQuizAttempts(quiz ?? []);
			const { count: commCount } = await supabase.from("lesson_comments").select("*", {
				count: "exact",
				head: true
			}).eq("user_id", student.user_id);
			setComments(commCount ?? 0);
			const { data: cert } = await supabase.from("certificate_requests").select("status, rejection_reason").eq("user_id", student.user_id).maybeSingle();
			setCertRequest(cert);
		};
		load();
	}, [open, student]);
	const pct = progress.length > 0 ? Math.round(progress.filter((p) => p.done).length / progress.length * 100) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-lg max-h-[80vh] overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Perfil do Aluno" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-secondary p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-semibold text-primary",
							children: "Dados Pessoais"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-2 space-y-1 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-muted-foreground",
										children: "Nome"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "font-medium",
										children: profile?.full_name || "(sem nome)"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-muted-foreground",
										children: "Email"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "font-medium",
										children: profile?.email || "-"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-muted-foreground",
										children: "WhatsApp"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "font-medium",
										children: profile?.whatsapp_number || "-"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-muted-foreground",
										children: "Registo"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "font-medium",
										children: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("pt-PT") : "-"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-muted-foreground",
										children: "Inscrição"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "font-medium",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `rounded-full px-2 py-0.5 text-xs font-semibold ${student.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`,
											children: student.status === "active" ? "Ativo" : "Pendente"
										})
									})]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-secondary p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-semibold text-primary",
								children: "Progresso nas Aulas"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-2xl font-bold",
								children: [pct, "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 h-2 w-full overflow-hidden rounded-full bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full rounded-full bg-gold transition-all",
									style: { width: `${pct}%` }
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 space-y-1",
								children: progress.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-2 text-sm",
									children: [p.done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-3.5 w-3.5 text-green-600" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3.5 w-3.5 rounded-full border-2 border-muted-foreground" }), p.title]
								}, p.lesson_id))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-secondary p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-semibold text-primary",
							children: "Tentativas de Quiz"
						}), quizAttempts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "Nenhuma tentativa."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 space-y-1 text-sm",
							children: quizAttempts.map((q, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									q.score,
									"/",
									q.total,
									" — ",
									q.passed ? "Aprovado" : "Não aprovado"
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: new Date(q.created_at).toLocaleDateString("pt-PT")
								})]
							}, i))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-secondary p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-semibold text-primary",
							children: "Comentários"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm",
							children: [
								comments,
								" comentário",
								comments === 1 ? "" : "s",
								" feitos"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-secondary p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-semibold text-primary",
							children: "Certificado"
						}), !certRequest ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "Nenhum pedido."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm",
							children: [
								certRequest.status === "pending" && "Pedido pendente",
								certRequest.status === "approved" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-green-600",
									children: "Aprovado"
								}),
								certRequest.status === "rejected" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-red-600",
									children: "Rejeitado"
								}), certRequest.rejection_reason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-2 text-muted-foreground",
									children: ["— ", certRequest.rejection_reason]
								})] })
							]
						})]
					})
				]
			})]
		})
	});
}
function AdminsTab() {
	const [admins, setAdmins] = (0, import_react.useState)([]);
	const [newEmail, setNewEmail] = (0, import_react.useState)("");
	const [adding, setAdding] = (0, import_react.useState)(false);
	const [currentUserId, setCurrentUserId] = (0, import_react.useState)(null);
	const load = async () => {
		const { data: u } = await supabase.auth.getUser();
		setCurrentUserId(u.user?.id ?? null);
		const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
		if (!roles) return;
		const ids = roles.map((r) => r.user_id);
		if (ids.length === 0) return;
		const { data: profs } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
		const map = new Map((profs ?? []).map((p) => [p.id, p]));
		setAdmins(ids.map((id) => {
			const p = map.get(id);
			return {
				user_id: id,
				full_name: p?.full_name ?? null,
				email: p?.email ?? null
			};
		}));
	};
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const addAdmin = async () => {
		if (!newEmail.trim()) return;
		setAdding(true);
		const { data: profs } = await supabase.from("profiles").select("id").eq("email", newEmail.trim()).maybeSingle();
		if (!profs) {
			toast.error("Utilizador não encontrado com esse email.");
			setAdding(false);
			return;
		}
		const { error } = await supabase.from("user_roles").insert({
			user_id: profs.id,
			role: "admin"
		});
		if (error) {
			if (error.code === "23505") toast.error("Este utilizador já é admin.");
			else toast.error(error.message);
			setAdding(false);
			return;
		}
		toast.success("Admin adicionado!");
		setNewEmail("");
		setAdding(false);
		load();
	};
	const removeAdmin = async (userId) => {
		if (userId === currentUserId) {
			toast.error("Não podes remover a ti próprio.");
			return;
		}
		if (!confirm("Remover este admin?")) return;
		const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
		if (error) return toast.error(error.message);
		toast.success("Admin removido.");
		load();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 pt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold text-primary",
				children: "Adicionar Admin"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-end gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email do utilizador" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: newEmail,
						onChange: (e) => setNewEmail(e.target.value),
						placeholder: "email@exemplo.com"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: addAdmin,
					disabled: adding || !newEmail.trim(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), " Adicionar"]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "text-lg font-semibold text-primary",
				children: [
					"Administradores (",
					admins.length,
					")"
				]
			}), admins.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted-foreground",
				children: "Nenhum admin encontrado."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 divide-y divide-border",
				children: admins.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: a.full_name || "(sem nome)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: a.email
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => removeAdmin(a.user_id),
						disabled: a.user_id === currentUserId,
						className: "text-red-600",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "mr-1 h-4 w-4" }), " Remover"]
					})]
				}, a.user_id))
			})]
		})]
	});
}
//#endregion
export { AdminPage as component };

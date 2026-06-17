import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CDPDOa_J.mjs";
import { t as COURSE } from "./course-DmnKEs2C.mjs";
import { _ as require_jsx_runtime, v as require_react } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as cn, t as Button } from "./button-DRsC1qZi.mjs";
import { u as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as SiteHeader } from "./SiteHeader-Iq68lQMD.mjs";
import { t as Card } from "./card-BLWafi8D.mjs";
import { E as FileText, I as Check, M as CirclePlay, N as CircleCheck, O as Download, T as GraduationCap, g as Lock, h as MessageSquare, u as Smartphone } from "../_libs/lucide-react.mjs";
import { a as DialogTrigger, i as DialogTitle, n as DialogContent, o as Textarea, r as DialogHeader, t as Dialog } from "./dialog-PKvBy6tW.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as CheckboxIndicator, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/curso-BYhB3BtR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
function toEmbed(url) {
	try {
		const u = new URL(url);
		if (u.hostname.includes("youtube.com")) {
			const v = u.searchParams.get("v");
			if (v) return `https://www.youtube.com/embed/${v}`;
			const shortsMatch = u.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]+)/);
			if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
		}
		if (u.hostname === "youtu.be") return `https://www.youtube.com/embed${u.pathname}`;
		if (u.hostname === "vimeo.com" || u.hostname === "player.vimeo.com") {
			const vimeoId = u.pathname.split("/").pop();
			if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`;
		}
		if (u.pathname.includes("/embed/")) return url;
		return url;
	} catch {
		return url;
	}
}
function CursoPage() {
	const [status, setStatus] = (0, import_react.useState)("loading");
	const [lessons, setLessons] = (0, import_react.useState)([]);
	const [progress, setProgress] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [current, setCurrent] = (0, import_react.useState)(null);
	const [userId, setUserId] = (0, import_react.useState)(null);
	const [userName, setUserName] = (0, import_react.useState)("");
	const [materials, setMaterials] = (0, import_react.useState)([]);
	const [quizzes, setQuizzes] = (0, import_react.useState)([]);
	const [comments, setComments] = (0, import_react.useState)([]);
	const [newComment, setNewComment] = (0, import_react.useState)("");
	const [isAdmin, setIsAdmin] = (0, import_react.useState)(false);
	const loadCurrentLessonData = async (lessonId) => {
		const [matRes, quizRes, commRes] = await Promise.all([
			supabase.from("lesson_materials").select("*").eq("lesson_id", lessonId).order("created_at"),
			supabase.from("lesson_quizzes").select("*").eq("lesson_id", lessonId).order("position"),
			supabase.from("lesson_comments").select("*").eq("lesson_id", lessonId).order("created_at", { ascending: false })
		]);
		setMaterials(matRes.data ?? []);
		setQuizzes(quizRes.data ?? []);
		const comms = commRes.data ?? [];
		const ids = [...new Set(comms.map((c) => c.user_id))];
		if (ids.length) {
			const { data: profs } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
			const map = new Map((profs ?? []).map((p) => [p.id, p]));
			const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "admin").in("user_id", ids);
			const adminIds = new Set((roles ?? []).map((r) => r.user_id));
			comms.forEach((c) => {
				const p = map.get(c.user_id);
				c.profile = p ? {
					full_name: p.full_name,
					email: p.email
				} : null;
				c.is_admin = adminIds.has(c.user_id);
			});
		}
		setComments(comms);
	};
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const load = async () => {
			try {
				const { data: u } = await supabase.auth.getUser();
				if (!u.user || cancelled) return;
				setUserId(u.user.id);
				const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", u.user.id).single();
				setUserName(profile?.full_name || "");
				const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
				setIsAdmin(!!roles?.some((r) => r.role === "admin"));
				const { data: enr } = await supabase.from("enrollments").select("status").eq("user_id", u.user.id).maybeSingle();
				if (cancelled) return;
				if (isAdmin) setStatus("active");
				else if (!enr) {
					setStatus("none");
					return;
				} else if (enr.status !== "active") {
					setStatus("pending");
					return;
				} else setStatus("active");
				const { data: ls } = await supabase.from("lessons").select("*").order("position", { ascending: true });
				if (cancelled) return;
				const list = ls ?? [];
				setLessons(list);
				if (list.length) {
					setCurrent(list[0]);
					loadCurrentLessonData(list[0].id);
				}
				const { data: pr } = await supabase.from("lesson_progress").select("lesson_id").eq("user_id", u.user.id);
				if (cancelled) return;
				setProgress(new Set((pr ?? []).map((p) => p.lesson_id)));
			} catch {
				if (!cancelled) {
					toast.error("Erro ao carregar o curso. Tente novamente.");
					setStatus("none");
				}
			}
		};
		load();
		return () => {
			cancelled = true;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (current) loadCurrentLessonData(current.id);
	}, [current?.id]);
	const requestAccess = async () => {
		if (!userId) return;
		const { error } = await supabase.from("enrollments").insert({
			user_id: userId,
			status: "pending"
		});
		if (error) return toast.error(error.message);
		toast.success("Pedido registado! Aguarde a liberação do acesso.");
		setStatus("pending");
	};
	const toggleDone = async (lesson, done) => {
		if (!userId) return;
		if (done) {
			const { error } = await supabase.from("lesson_progress").insert({
				user_id: userId,
				lesson_id: lesson.id
			});
			if (error) return toast.error(error.message);
			setProgress(new Set([...progress, lesson.id]));
		} else {
			const { error } = await supabase.from("lesson_progress").delete().eq("user_id", userId).eq("lesson_id", lesson.id);
			if (error) return toast.error(error.message);
			const n = new Set(progress);
			n.delete(lesson.id);
			setProgress(n);
		}
	};
	const postComment = async () => {
		if (!userId || !current || !newComment.trim()) return;
		const { error } = await supabase.from("lesson_comments").insert({
			lesson_id: current.id,
			user_id: userId,
			content: newComment.trim()
		});
		if (error) return toast.error(error.message);
		setNewComment("");
		loadCurrentLessonData(current.id);
	};
	const allDone = lessons.length > 0 && lessons.every((l) => progress.has(l.id));
	if (status === "loading") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground",
			children: "A carregar..."
		})]
	});
	if (status === "none" || status === "pending") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto max-w-2xl px-4 py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-8 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mx-auto h-12 w-12 text-gold" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 text-2xl font-bold text-primary",
						children: status === "pending" ? "A aguardar liberação" : "Acesso ainda não ativo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-muted-foreground",
						children: status === "pending" ? "O seu pedido foi recebido. Após confirmação do pagamento, o acesso é liberado em até 24h." : "Para começar, registe o seu pedido de inscrição. Em seguida, efetue o pagamento."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "my-6 rounded-xl bg-secondary p-6 text-left text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold text-primary",
								children: "Dados para pagamento"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "mt-2 space-y-1 text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-foreground",
											children: "Banco:"
										}),
										" ",
										COURSE.paymentInstructions.bank
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-foreground",
											children: "IBAN:"
										}),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono",
											children: COURSE.paymentInstructions.iban
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-foreground",
											children: "Titular:"
										}),
										" ",
										COURSE.paymentInstructions.holder
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-foreground",
											children: "Valor:"
										}),
										" ",
										COURSE.priceLabel
									] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs",
								children: COURSE.paymentInstructions.note
							})
						]
					}),
					status === "none" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: requestAccess,
						className: "bg-primary text-primary-foreground",
						children: "Registar pedido de inscrição"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "text-sm text-muted-foreground underline",
							children: "Voltar à página inicial"
						})
					})
				]
			})
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl px-4 py-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold text-primary md:text-3xl",
					children: COURSE.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-muted-foreground",
					children: [
						lessons.length,
						" aula",
						lessons.length === 1 ? "" : "s",
						" • ",
						progress.size,
						" concluída",
						progress.size === 1 ? "" : "s"
					]
				}),
				lessons.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "mt-8 p-10 text-center text-muted-foreground",
					children: "Em breve as aulas estarão disponíveis aqui."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 grid gap-6 lg:grid-cols-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "lg:col-span-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "overflow-hidden p-0",
								children: [current && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "aspect-video w-full bg-black",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
										src: toEmbed(current.video_url),
										title: current.title,
										className: "h-full w-full",
										allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
										allowFullScreen: true
									}, current.id)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-6",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "text-xl font-bold text-primary",
											children: current?.title
										}),
										current?.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-sm text-muted-foreground",
											children: current.description
										}),
										current && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "mt-4 flex cursor-pointer items-center gap-2 text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
												checked: progress.has(current.id),
												onCheckedChange: (c) => {
													if (c !== "indeterminate") toggleDone(current, c);
												}
											}), "Marcar como concluída"]
										})
									]
								})]
							}),
							materials.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "mt-4 p-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
									className: "flex items-center gap-2 text-sm font-semibold text-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" }), " Materiais de Apoio"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-3 space-y-2",
									children: materials.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: m.file_url,
										target: "_blank",
										rel: "noopener noreferrer",
										className: "flex items-center gap-3 rounded-lg bg-secondary p-3 text-sm hover:bg-secondary/80",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 shrink-0 text-gold" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "flex-1 truncate",
												children: m.title
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 shrink-0 text-muted-foreground" })
										]
									}) }, m.id))
								})]
							}),
							current && quizzes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuizSection, {
								quizQuestions: quizzes,
								userId
							}),
							current && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "mt-4 p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "flex items-center gap-2 text-sm font-semibold text-primary",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-4 w-4" }),
											" Comentários (",
											comments.length,
											")"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 space-y-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											value: newComment,
											onChange: (e) => setNewComment(e.target.value),
											placeholder: "Tens alguma dúvida sobre esta aula?",
											className: "min-h-[80px] text-sm"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											onClick: postComment,
											disabled: !newComment.trim(),
											children: "Comentar"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4 space-y-3",
										children: comments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted-foreground",
											children: "Nenhum comentário ainda. Sê o primeiro a comentar!"
										}) : comments.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg bg-secondary p-3 text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium",
														children: c.profile?.full_name || "Anónimo"
													}),
													c.is_admin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "rounded bg-gold px-1.5 py-0.5 text-[10px] font-semibold text-gold-foreground",
														children: "Professor"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xs text-muted-foreground",
														children: new Date(c.created_at).toLocaleDateString("pt-PT")
													})
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 whitespace-pre-wrap",
												children: c.content
											})]
										}, c.id))
									})
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
								children: "Aulas"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 space-y-1",
								children: lessons.map((l, i) => {
									const done = progress.has(l.id);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setCurrent(l),
										className: `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${current?.id === l.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`,
										children: [done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 shrink-0 text-gold" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlay, { className: "h-4 w-4 shrink-0 opacity-70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex-1 truncate",
											children: [
												i + 1,
												". ",
												l.title
											]
										})]
									}) }, l.id);
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "mt-4 p-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppSettings, { userId })
						}),
						allDone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "mt-4 p-6 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "mx-auto h-10 w-10 text-gold" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-2 text-sm font-semibold text-primary",
									children: "Parabéns! Completaste todas as aulas!"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CertificateRequestSection, {
									userId,
									userName
								})
							]
						})
					] })]
				})
			]
		})]
	});
}
function QuizSection({ quizQuestions, userId }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [answers, setAnswers] = (0, import_react.useState)({});
	const [submitted, setSubmitted] = (0, import_react.useState)(false);
	const [score, setScore] = (0, import_react.useState)(0);
	const handleSubmit = () => {
		let correct = 0;
		quizQuestions.forEach((q) => {
			if (answers[q.id] === q.correct_index) correct++;
		});
		setScore(correct);
		setSubmitted(true);
	};
	const reset = () => {
		setAnswers({});
		setSubmitted(false);
		setScore(0);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "mt-4 p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "flex items-center gap-2 text-sm font-semibold text-primary",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-4 w-4" }),
					" Quiz (",
					quizQuestions.length,
					" perguntas)"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
				open,
				onOpenChange: (v) => {
					setOpen(v);
					if (!v) reset();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						children: "Fazer Quiz"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Quiz da aula" }) }), !submitted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-6",
						children: [quizQuestions.map((q, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mb-2 text-sm font-medium",
							children: [
								i + 1,
								". ",
								q.question
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-1",
							children: q.options.map((opt, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: `flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm transition ${answers[q.id] === j ? "border-primary bg-primary/5" : "hover:bg-secondary"}`,
								onClick: () => setAnswers({
									...answers,
									[q.id]: j
								}),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "radio",
										name: `q-${q.id}`,
										checked: answers[q.id] === j,
										onChange: () => {},
										className: "sr-only"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-4 w-4 rounded-full border-2 ${answers[q.id] === j ? "border-primary bg-primary" : "border-muted-foreground"}` }),
									opt
								]
							}, j))
						})] }, q.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleSubmit,
							disabled: Object.keys(answers).length < quizQuestions.length,
							className: "w-full",
							children: "Ver resultados"
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-lg font-bold",
								children: [
									score,
									"/",
									quizQuestions.length,
									" corretas"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted-foreground",
								children: score === quizQuestions.length ? "Perfeito! Acertaste tudo!" : score >= quizQuestions.length / 2 ? "Bom trabalho!" : "Continua a praticar!"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-2 text-left",
								children: quizQuestions.map((q, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `rounded-lg p-3 text-sm ${answers[q.id] === q.correct_index ? "bg-green-50" : "bg-red-50"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-medium",
										children: [
											i + 1,
											". ",
											q.question
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-muted-foreground",
										children: answers[q.id] === q.correct_index ? "✓ Correta" : `✗ Errada. Resposta correta: ${q.options[q.correct_index]}`
									})]
								}, q.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: reset,
								className: "w-full",
								children: "Refazer quiz"
							})
						]
					})]
				})]
			})]
		})
	});
}
function CertificateRequestSection({ userId, userName }) {
	const [request, setRequest] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		if (!userId) return;
		supabase.from("certificate_requests").select("status, certificate_url, rejection_reason").eq("user_id", userId).maybeSingle().then(({ data }) => {
			setRequest(data);
			setLoading(false);
		});
	}, [userId]);
	const requestCert = async () => {
		if (!userId) return;
		const { error } = await supabase.from("certificate_requests").insert({
			user_id: userId,
			status: "pending"
		});
		if (error) return toast.error(error.message);
		toast.success("Pedido de certificado registado! Aguarda a aprovação.");
		setRequest({
			status: "pending",
			certificate_url: null,
			rejection_reason: null
		});
	};
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-3 text-xs text-muted-foreground",
		children: "A carregar..."
	});
	if (!request) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		size: "sm",
		onClick: requestCert,
		className: "mt-3 bg-gold text-gold-foreground hover:bg-gold/90",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "mr-1 h-4 w-4" }), " Solicitar Certificado"]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3",
		children: [
			request.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Pedido de certificado enviado. Aguarda a aprovação do administrador."
			}),
			request.status === "approved" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-green-600",
				children: "Certificado aprovado! 🎉"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: "Em breve disponível para download."
			})] }),
			request.status === "rejected" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-red-600",
				children: "Certificado rejeitado."
			}), request.rejection_reason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: ["Motivo: ", request.rejection_reason]
			})] })
		]
	});
}
function WhatsAppSettings({ userId }) {
	const [number, setNumber] = (0, import_react.useState)("");
	const [saved, setSaved] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		if (!userId) return;
		supabase.from("profiles").select("whatsapp_number").eq("id", userId).single().then(({ data }) => {
			if (data?.whatsapp_number) setNumber(data.whatsapp_number);
			setLoading(false);
		});
	}, [userId]);
	const save = async () => {
		if (!userId) return;
		const cleaned = number.replace(/\s+/g, "");
		if (cleaned && !/^\+?\d{7,15}$/.test(cleaned)) return toast.error("Número inválido. Ex: +244900000000");
		const { error } = await supabase.from("profiles").update({ whatsapp_number: cleaned || null }).eq("id", userId);
		if (error) return toast.error(error.message);
		setSaved(true);
		toast.success("Número guardado! Receberás notificações por WhatsApp.");
		setTimeout(() => setSaved(false), 3e3);
	};
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-xs text-muted-foreground",
		children: "A carregar..."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
			className: "flex items-center gap-2 text-sm font-semibold text-primary",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "h-4 w-4" }), " Notificações WhatsApp"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-muted-foreground",
			children: "Regista o teu número para receber notificações (matrícula ativada, certificado, etc.)"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "tel",
				placeholder: "+244900000000",
				className: "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
				value: number,
				onChange: (e) => setNumber(e.target.value)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				onClick: save,
				children: saved ? "Guardado" : "Guardar"
			})]
		})
	] });
}
//#endregion
export { CursoPage as component };

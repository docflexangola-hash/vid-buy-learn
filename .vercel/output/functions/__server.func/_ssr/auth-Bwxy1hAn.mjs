import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CDPDOa_J.mjs";
import { _ as require_jsx_runtime, v as require_react } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-DRsC1qZi.mjs";
import { t as Logo } from "./Logo-DbNrwqe3.mjs";
import { d as useNavigate, u as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Card } from "./card-BLWafi8D.mjs";
import { n as Label, t as Input } from "./label-CmIE8x5o.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BYfOmXtJ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-Bwxy1hAn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthPage() {
	const navigate = useNavigate();
	const [tab, setTab] = (0, import_react.useState)("signin");
	const [siEmail, setSiEmail] = (0, import_react.useState)("");
	const [siPass, setSiPass] = (0, import_react.useState)("");
	const [siLoading, setSiLoading] = (0, import_react.useState)(false);
	const [suName, setSuName] = (0, import_react.useState)("");
	const [suEmail, setSuEmail] = (0, import_react.useState)("");
	const [suPass, setSuPass] = (0, import_react.useState)("");
	const [suLoading, setSuLoading] = (0, import_react.useState)(false);
	const [rstEmail, setRstEmail] = (0, import_react.useState)("");
	const [rstLoading, setRstLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		supabase.auth.getUser().then(({ data }) => {
			if (data.user) navigate({ to: "/curso" });
		});
	}, [navigate]);
	const onSignIn = async (e) => {
		e.preventDefault();
		setSiLoading(true);
		const { data: signInData, error } = await supabase.auth.signInWithPassword({
			email: siEmail,
			password: siPass
		});
		setSiLoading(false);
		if (error) return toast.error(error.message);
		toast.success("Bem-vindo!");
		const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", signInData.user.id);
		navigate({ to: !!roles?.some((r) => r.role === "admin") ? "/admin" : "/curso" });
	};
	const onSignUp = async (e) => {
		e.preventDefault();
		setSuLoading(true);
		const { data, error } = await supabase.auth.signUp({
			email: suEmail,
			password: suPass,
			options: {
				emailRedirectTo: `${window.location.origin}/curso`,
				data: { full_name: suName }
			}
		});
		setSuLoading(false);
		if (error) return toast.error(error.message);
		if (data.session) {
			toast.success("Conta criada! Pode entrar agora.");
			setTab("signin");
			setSiEmail(suEmail);
		} else toast.success("Conta criada! Verifique o seu email para confirmar o registo.");
	};
	const onReset = async (e) => {
		e.preventDefault();
		setRstLoading(true);
		const { error } = await supabase.auth.resetPasswordForEmail(rstEmail, { redirectTo: `${window.location.origin}/reset-password` });
		setRstLoading(false);
		if (error) return toast.error(error.message);
		toast.success("Enviámos um email com instruções.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center px-4 py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "mb-6 flex justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { className: "h-14" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-border/60 p-6 md:p-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						value: tab,
						onValueChange: setTab,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								className: "grid w-full grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "signin",
										children: "Entrar"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "signup",
										children: "Criar conta"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "reset",
										children: "Recuperar"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "signin",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: onSignIn,
									className: "space-y-4 pt-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "si-email",
												children: "Email"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "si-email",
												type: "email",
												required: true,
												value: siEmail,
												onChange: (e) => setSiEmail(e.target.value)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "si-pass",
												children: "Senha"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "si-pass",
												type: "password",
												required: true,
												value: siPass,
												onChange: (e) => setSiPass(e.target.value)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "submit",
											disabled: siLoading,
											className: "w-full bg-primary text-primary-foreground",
											children: siLoading ? "A entrar..." : "Entrar"
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "signup",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: onSignUp,
									className: "space-y-4 pt-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "su-name",
												children: "Nome completo"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "su-name",
												required: true,
												value: suName,
												onChange: (e) => setSuName(e.target.value)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "su-email",
												children: "Email"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "su-email",
												type: "email",
												required: true,
												value: suEmail,
												onChange: (e) => setSuEmail(e.target.value)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "su-pass",
												children: "Senha (mín. 6)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "su-pass",
												type: "password",
												required: true,
												minLength: 6,
												value: suPass,
												onChange: (e) => setSuPass(e.target.value)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "submit",
											disabled: suLoading,
											className: "w-full bg-primary text-primary-foreground",
											children: suLoading ? "A criar..." : "Criar conta"
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "reset",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: onReset,
									className: "space-y-4 pt-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted-foreground",
											children: "Enviaremos um link para repor a sua senha."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "rst-email",
												children: "Email"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "rst-email",
												type: "email",
												required: true,
												value: rstEmail,
												onChange: (e) => setRstEmail(e.target.value)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "submit",
											disabled: rstLoading,
											className: "w-full bg-primary text-primary-foreground",
											children: rstLoading ? "A enviar..." : "Enviar link"
										})
									]
								})
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-center text-sm text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "underline",
						children: "← Voltar à página inicial"
					})
				})
			]
		})
	});
}
//#endregion
export { AuthPage as component };

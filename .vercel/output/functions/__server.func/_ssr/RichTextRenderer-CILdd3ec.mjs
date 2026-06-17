import { _ as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as purify } from "../_libs/dompurify.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/RichTextRenderer-CILdd3ec.js
var import_jsx_runtime = require_jsx_runtime();
var proseStyles = "prose prose-sm sm:prose-base max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-xl prose-h3:text-lg prose-p:text-foreground/85 prose-p:leading-relaxed prose-a:text-gold prose-a:underline prose-blockquote:border-l-gold prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-md prose-img:rounded-xl prose-img:mx-auto prose-li:text-foreground/85";
function RichTextRenderer({ content, className = "" }) {
	const sanitized = purify.sanitize(content);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `${proseStyles} ${className}`,
		dangerouslySetInnerHTML: { __html: sanitized }
	});
}
//#endregion
export { RichTextRenderer as t };

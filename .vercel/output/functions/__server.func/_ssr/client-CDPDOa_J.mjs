import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client-CDPDOa_J.js
function createSupabaseClient() {
	return createClient("https://wqnajtzsgqzrtawbrkbu.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxbmFqdHpzZ3F6cnRhd2Jya2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzODUwNjcsImV4cCI6MjA5Njk2MTA2N30.hFGQVKGT8FP_0S_tXJMiFD_b6iZEmwgIkH0WzyP9uVY", { auth: {
		storage: typeof window !== "undefined" ? localStorage : void 0,
		persistSession: true,
		autoRefreshToken: true
	} });
}
var _supabase;
var supabase = new Proxy({}, { get(_, prop, receiver) {
	if (!_supabase) _supabase = createSupabaseClient();
	return Reflect.get(_supabase, prop, receiver);
} });
//#endregion
export { supabase as t };

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, XCircle } from "lucide-react";
import { addAdminRole, removeAdminRole } from "@/lib/api/admin.functions";

export function AdminsTab() {
  const [admins, setAdmins] = useState<
    { user_id: string; full_name: string | null; email: string | null }[]
  >([]);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    setCurrentUserId(u.user?.id ?? null);

    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
    if (!roles) return;
    const ids = roles.map((r) => r.user_id);
    if (ids.length === 0) return;
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", ids);
    const map = new Map((profs ?? []).map((p) => [p.id, p]));
    setAdmins(
      ids.map((id) => {
        const p = map.get(id);
        return { user_id: id, full_name: p?.full_name ?? null, email: p?.email ?? null };
      }),
    );
  };

  useEffect(() => {
    load();
  }, []);

  const addAdmin = async () => {
    if (!newEmail.trim()) return;
    setAdding(true);
    try {
      await addAdminRole({ email: newEmail.trim() });
      toast.success("Admin adicionado!");
      setNewEmail("");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao adicionar admin");
    } finally {
      setAdding(false);
    }
  };

  const removeAdmin = async (userId: string) => {
    if (!confirm("Remover este admin?")) return;
    try {
      await removeAdminRole({ userId });
      toast.success("Admin removido.");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover admin");
    }
  };

  return (
    <div className="space-y-6 pt-4">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-primary">Adicionar Admin</h2>
        <div className="mt-4 flex items-end gap-3">
          <div className="flex-1 space-y-2">
            <Label>Email do utilizador</Label>
            <Input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>
          <Button onClick={addAdmin} disabled={adding || !newEmail.trim()}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-primary">Administradores ({admins.length})</h2>
        {admins.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nenhum admin encontrado.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {admins.map((a) => (
              <li key={a.user_id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{a.full_name || "(sem nome)"}</p>
                  <p className="text-xs text-muted-foreground">{a.email}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeAdmin(a.user_id)}
                  disabled={a.user_id === currentUserId}
                  className="text-red-600"
                >
                  <XCircle className="mr-1 h-4 w-4" /> Remover
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

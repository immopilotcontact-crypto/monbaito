import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase-server";

export async function DELETE() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const uid = session.user.id;

  // La cascade DELETE sur auth.users supprime toutes les données liées (via FK cascade)
  const service = createServiceClient();
  const { error } = await service.auth.admin.deleteUser(uid);
  if (error) {
    console.error("[user/delete]", error.message);
    return NextResponse.json({ error: "Échec de la suppression du compte" }, { status: 500 });
  }

  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}

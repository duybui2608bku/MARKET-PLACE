import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const adminSecret = process.env.ADMIN_SECRET as string | undefined;

export async function GET(req: NextRequest) {
  try {
    if (adminSecret) {
      const provided = req.headers.get("x-admin-secret");
      if (provided !== adminSecret) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ users: data.users });
  } catch (err: any) {
    return Response.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

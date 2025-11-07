import { NextRequest } from "next/server";
import { getSupabaseWithBearer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");
    if (!authorization) {
      return Response.json(
        { error: "Missing Authorization header" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseWithBearer(authorization);
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      return Response.json(
        { error: error?.message || "Invalid token" },
        { status: 401 }
      );
    }

    return Response.json({ user: data.user });
  } catch (err: unknown) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

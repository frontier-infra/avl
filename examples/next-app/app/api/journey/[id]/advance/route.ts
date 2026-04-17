import { NextResponse } from "next/server";

/**
 * Mock action endpoint for the demo. Does not persist.
 * In a real app this would call the same service the human UI calls.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    ok: true,
    journey_id: id,
    advanced_to: body.target_stage_id ?? "(unspecified)",
    note: body.note ?? null,
    at: new Date().toISOString(),
  });
}

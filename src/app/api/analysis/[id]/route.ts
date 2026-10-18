import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/security/sessionStore';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(params.id);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Analysis session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

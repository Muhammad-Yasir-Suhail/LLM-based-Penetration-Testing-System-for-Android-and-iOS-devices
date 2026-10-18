import { NextRequest, NextResponse } from 'next/server';
import { getSession, isValidSessionId } from '@/lib/security/sessionStore';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    if (!id || !isValidSessionId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid session identifier' },
        { status: 400 }
      );
    }

    const session = await getSession(id);
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
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve analysis session' },
      { status: 500 }
    );
  }
}


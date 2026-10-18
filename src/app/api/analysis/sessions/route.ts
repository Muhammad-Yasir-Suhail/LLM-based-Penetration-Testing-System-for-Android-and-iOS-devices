import { NextResponse } from 'next/server';
import { listSessions } from '@/lib/security/sessionStore';

export async function GET() {
  try {
    const sessions = await listSessions();
    return NextResponse.json({
      success: true,
      sessions
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

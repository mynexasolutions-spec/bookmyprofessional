import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken, ADMIN_COOKIE } from '@/lib/admin-session';
import { listEmailLogs } from '@/lib/data/email-logs';

export async function GET(req) {
  try {
    const token = (await cookies()).get(ADMIN_COOKIE)?.value;
    const session = verifyAdminToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sync = searchParams.get('sync') === 'true';
    const limit = Math.min(100, Number(searchParams.get('limit')) || 50);

    const logs = await listEmailLogs({ limit, syncWithBrevo: sync });

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error('Failed to list email logs:', error);
    return NextResponse.json({ error: 'Failed to retrieve logs' }, { status: 500 });
  }
}

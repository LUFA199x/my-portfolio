import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getAllProjects } from '@/actions/projects';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const projects = await getAllProjects();
  return NextResponse.json(projects.map((p) => ({ id: p.id, name: p.title })));
}

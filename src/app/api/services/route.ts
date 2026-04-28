import { NextResponse } from 'next/server';
import { getAllServices } from '@/actions/services';

export async function GET() {
  const services = await getAllServices();
  return NextResponse.json(services);
}

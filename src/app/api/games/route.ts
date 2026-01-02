import { NextResponse } from 'next/server';
import { getGamesByPopularity } from '@/services/game.service';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await getGamesByPopularity(limit, offset);

    return NextResponse.json(result);
}

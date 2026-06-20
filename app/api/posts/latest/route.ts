import { NextResponse } from 'next/server';
import { getPublishedPosts } from '@/lib/mdx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET() {
  try {
    const posts = (await getPublishedPosts()).slice(0, 3);

    return NextResponse.json(
      {
        success: true,
        count: posts.length,
        posts,
      },
      {
        headers: {
          ...corsHeaders,
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      },
    );
  } catch (error) {
    console.error('GET /api/posts/latest failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to load the latest blog posts',
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories, addCategory, deleteCategory } from '@/lib/categories';
import { revalidatePath } from 'next/cache';
import { triggerRebuild } from '@/lib/github';

export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/categories called');
    const body = await request.json();
    console.log('Request body:', body);
    const { categoryName } = body;
    
    if (!categoryName?.trim()) {
      console.log('Category name is missing or empty');
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    console.log('Adding category:', categoryName.trim());
    const result = await addCategory(categoryName.trim());
    console.log('Add category result:', result);
    
    if (result.success) {
      console.log('Revalidating paths and triggering rebuild');
      revalidatePath('/');
      revalidatePath('/admin/dashboard');
      revalidatePath('/admin/posts');
      revalidatePath('/admin/categories');
      await triggerRebuild();
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('POST /api/categories error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE /api/categories called');
    const body = await request.json();
    console.log('Request body:', body);
    const { categoryName } = body;
    
    if (!categoryName) {
      console.log('Category name is missing');
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    console.log('Deleting category:', categoryName);
    const result = await deleteCategory(categoryName);
    console.log('Delete category result:', result);
    
    if (result.success) {
      console.log('Revalidating paths and triggering rebuild');
      revalidatePath('/');
      revalidatePath('/admin/dashboard');
      revalidatePath('/admin/posts');
      revalidatePath('/admin/categories');
      await triggerRebuild();
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('DELETE /api/categories error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
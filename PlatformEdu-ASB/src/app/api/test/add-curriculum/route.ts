import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Create a section
    const { data: section, error: sectionError } = await admin
      .from('sections')
      .insert({
        course_id: courseId,
        title: 'Introducción',
        position: 0,
      })
      .select('id')
      .single();

    if (sectionError) {
      return NextResponse.json({ error: sectionError.message }, { status: 500 });
    }

    // Create a lesson
    const { error: lessonError } = await admin
      .from('lessons')
      .insert({
        section_id: section.id,
        title: 'Lección de prueba',
        type: 'text',
        content_text: 'Contenido de la lección de prueba',
        duration_seconds: 60,
        position: 0,
        is_free_preview: true,
      });

    if (lessonError) {
      return NextResponse.json({ error: lessonError.message }, { status: 500 });
    }

    return NextResponse.json({ sectionId: section.id });
  } catch (error) {
    console.error('Test curriculum creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
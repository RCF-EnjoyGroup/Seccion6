import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { email, password, fullName, role } = await request.json();

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Create user with admin API (auto-confirms email)
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: fullName },
      email_confirm: true,
    });

    if (authError) {
      // If user already exists, try to get them
      if (authError.message.includes('already registered') || authError.message.includes('already exists') || authError.message.includes('already been registered')) {
        const { data: listData } = await admin.auth.admin.listUsers();
        const existingUser = listData.users.find(u => u.email === email);
        if (existingUser) {
          // Update profile
          const { error: profileError } = await admin
            .from('profiles')
            .upsert({ id: existingUser.id, role, onboarded: true, full_name: fullName }, { onConflict: 'id' });
          if (profileError) {
            return NextResponse.json({ error: profileError.message }, { status: 500 });
          }
          return NextResponse.json({ user: existingUser });
        }
      }
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const user = authData.user;

    // Create/update profile
    const { error: profileError } = await admin
      .from('profiles')
      .upsert({ id: user.id, role, onboarded: true, full_name: fullName }, { onConflict: 'id' });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Test user creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
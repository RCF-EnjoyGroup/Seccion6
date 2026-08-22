#!/usr/bin/env node
/**
 * Configure Supabase Auth settings via Management API
 * 
 * Prerequisites:
 * 1. Create Personal Access Token at https://supabase.com/dashboard/account/tokens
 * 2. Export as env: export SUPABASE_ACCESS_TOKEN="sbp_xxx"
 * 3. Get project ref from dashboard URL or `npx supabase projects list`
 */

const PROJECT_REF = 'anfevrtbbgdlhfrmxdue';
const BASE_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}`;

async function fetchAPI(path, method = 'GET', body = null) {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    throw new Error('SUPABASE_ACCESS_TOKEN not set. Create one at https://supabase.com/dashboard/account/tokens');
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`API Error ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function getAuthConfig() {
  console.log('📋 Fetching current auth config...');
  return fetchAPI('/config/auth');
}

async function updateAuthConfig(config) {
  console.log('🔧 Updating auth config...');
  return fetchAPI('/config/auth', 'PATCH', config);
}

async function getEmailTemplates() {
  console.log('📧 Fetching email templates...');
  return fetchAPI('/config/auth/email-templates');
}

async function updateEmailTemplate(templateName, config) {
  console.log(`📝 Updating email template: ${templateName}...`);
  return fetchAPI(`/config/auth/email-templates/${templateName}`, 'PATCH', config);
}

async function main() {
  try {
    // 1. Show current config
    const currentAuth = await getAuthConfig();
    console.log('\n📄 Current Auth Config:');
    console.log(JSON.stringify(currentAuth, null, 2));

    // 2. Update auth settings
    const authConfig = {
      site_url: 'http://localhost:3000',
      additional_redirect_urls: [
        'http://localhost:3000/auth/callback',
        'http://localhost:3000/onboarding',
        'http://localhost:3000/instructor',
        'http://localhost:3000/estudiante',
        'https://anfevrtbbgdlhfrmxdue.supabase.co/auth/v1/verify',
      ],
      enable_signup: true,
      enable_email_confirmations: true,
      enable_email_change_confirmations: true,
      secure_email_change: true,
      min_password_length: 8,
    };

    await updateAuthConfig(authConfig);
    console.log('✅ Auth config updated');

    // 3. Verify update
    const updatedAuth = await getAuthConfig();
    console.log('\n📄 Updated Auth Config:');
    console.log(JSON.stringify(updatedAuth, null, 2));

    // 4. Update email templates
    const templates = {
      signup: {
        subject: 'Confirma tu cuenta en EduPlatform',
        content: `¡Bienvenido a EduPlatform! 

Haz clic en el siguiente enlace para confirmar tu cuenta:

{{ .ConfirmationURL }}

Este enlace expira en 24 horas.

Si no creaste esta cuenta, ignora este email.

— El equipo de EduPlatform`,
      },
      invite: {
        subject: 'Te han invitado a EduPlatform',
        content: `Has sido invitado a unirte a EduPlatform.

Acepta la invitación:

{{ .ConfirmationURL }}

— El equipo de EduPlatform`,
      },
      recovery: {
        subject: 'Restablece tu contraseña en EduPlatform',
        content: `Solicitaste restablecer tu contraseña.

Haz clic aquí para crear una nueva:

{{ .ConfirmationURL }}

Este enlace expira en 24 horas.

Si no solicitaste esto, ignora este email.

— El equipo de EduPlatform`,
      },
      magic_link: {
        subject: 'Tu link mágico para EduPlatform',
        content: `Inicia sesión en EduPlatform sin contraseña:

{{ .ConfirmationURL }}

Este enlace expira en 24 horas.

— El equipo de EduPlatform`,
      },
      email_change: {
        subject: 'Confirma tu nuevo email en EduPlatform',
        content: `Solicitaste cambiar tu email a {{ .Email }}.

Confirma el cambio:

{{ .ConfirmationURL }}

— El equipo de EduPlatform`,
      },
    };

    for (const [name, template] of Object.entries(templates)) {
      await updateEmailTemplate(name, template);
      console.log(`✅ Template "${name}" updated`);
    }

    console.log('\n🎉 All done! Verify in Dashboard: https://supabase.com/dashboard/project/anfevrtbbgdlhfrmxdue/auth/settings');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
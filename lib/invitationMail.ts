import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const DOMAIN = process.env.NEXT_AUTH_URL || 'http://localhost:3000';

interface SendInvitationEmailProps {
  emailDestino: string;
  eventoTitulo: string;
  rolAsignado: string;
  usuarioExiste: boolean;
}

export async function sendEventInvitationEmail({
  emailDestino,
  eventoTitulo,
  rolAsignado,
  usuarioExiste,
}: SendInvitationEmailProps) {
  
  // Si el usuario ya existe lo mandamos al login/dashboard, si no, a la pantalla de registro
  const urlDestino = usuarioExiste 
    ? `${DOMAIN}/dashboard` 
    : `${DOMAIN}/auth/register?inviteEmail=${encodeURIComponent(emailDestino)}`;

  const subject = usuarioExiste
    ? `🎉 Te han asignado un rol en el evento: ${eventoTitulo}`
    : `✨ Te invitaron a co-organizar el evento: ${eventoTitulo}`;

  const cuerpoHtml = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; rounded: 12px;">
      <h2 style="color: #7c3aed; margin-bottom: 4px;">¡Hola!</h2>
      <p style="font-size: 14px; color: #3f3f46; line-height: 1.5;">
        Fuiste invitado(a) a formar parte del equipo de organización del evento <strong>"${eventoTitulo}"</strong> en la plataforma de <strong>Invitify</strong>.
      </p>
      
      <div style="background-color: #f4f4f5; padding: 12px; border-radius: 8px; margin: 18px 0; border-left: 4px solid #7c3aed;">
        <span style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #71717a; display: block; margin-bottom: 2px;">Tu Rol</span>
        <strong style="font-size: 15px; color: #18181b;">${rolAsignado}</strong>
      </div>

      <p style="font-size: 13px; color: #71717a; margin-bottom: 24px;">
        ${usuarioExiste 
          ? 'Como ya tienes una cuenta en Invitify, puedes ingresar de inmediato a gestionar el panel de control.' 
          : 'Para comenzar a colaborar, es necesario que crees una cuenta gratuita en nuestra plataforma utilizando este correo electrónico.'}
      </p>

      <a href="${urlDestino}" style="display: block; text-align: center; background-color: #7c3aed; color: white; padding: 10px 16px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 14px;">
        ${usuarioExiste ? 'Ir al Dashboard del Evento' : 'Aceptar Invitación y Registrarme'}
      </a>

      <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
      <span style="font-size: 11px; color: #a1a1aa; display: block; text-align: center;">Ecosistema Invitify - Gestión Avanzada de Eventos</span>
    </div>
  `;

  return await resend.emails.send({
    from: 'Invitify <onboarding@resend.dev>', // Al configurar tu dominio real usarías algo como hola@invitify.com
    to: emailDestino,
    subject: subject,
    html: cuerpoHtml,
  });
}
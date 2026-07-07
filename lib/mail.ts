import { Resend } from 'resend';

// ❌ ELIMINAMOS esta línea de la raíz para que no rompa al importar el archivo:
// const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXTAUTH_URL;

/**
 * Envía el correo electrónico para verificar la cuenta recién creada.
 */
export async function sendVerificationEmail(email: string, token: string, nombre: string) {
  // 🔑 Inicializamos de forma segura dentro de la función
  const resend = new Resend(process.env.RESEND_API_KEY);
  const confirmLink = `${domain}/auth/verify?token=${token}`;

  try {
    await resend.emails.send({
      from: 'Invitify <onboarding@resend.dev>',
      to: email,
      subject: '✨ Verifica tu cuenta en Invitify',
      html: ``,
    });
    console.log(`✉️ Correo de verificación enviado con éxito a: ${email}`);
  } catch (error) {
    console.error('❌ ERROR_SEND_VERIFICATION_EMAIL:', error);
    throw new Error('No se pudo enviar el correo de verificación.');
  }
}

/**
 * Envía el correo con el token temporal para el restablecimiento de contraseña.
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  // 🔑 Inicializamos de forma segura dentro de la función
  const resend = new Resend(process.env.RESEND_API_KEY);
  const resetLink = `${domain}/auth/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: 'Invitify <onboarding@resend.dev>',
      to: email,
      subject: '🔒 Restablecer tu contraseña - Invitify',
      html: ``,
    });
    console.log(`✉️ Correo de recuperación enviado con éxito a: ${email}`);
  } catch (error) {
    console.error('❌ ERROR_SEND_RESET_EMAIL:', error);
    throw new Error('No se pudo enviar el correo de recuperación.');
  }
}

// import { Resend } from 'resend';

// // Inicializamos Resend con la API Key del .env
// const resend = new Resend(process.env.RESEND_API_KEY);
// const domain = process.env.NEXTAUTH_URL;

// /**
//  * Envía el correo electrónico para verificar la cuenta recién creada.
//  */
// export async function sendVerificationEmail(email: string, token: string, nombre: string) {
//   const confirmLink = `${domain}/auth/verify?token=${token}`;

//   try {
//     await resend.emails.send({
//       // NOTA: Si usas la capa gratuita de Resend sin un dominio propio configurado, 
//       // DEBES enviar obligatoriamente desde 'onboarding@resend.dev'
//       from: 'Invitify <onboarding@resend.dev>',
//       to: email,
//       subject: '✨ Verifica tu cuenta en Invitify',
//       html: `
//         <div style="font-family: sans-serif; background-color: #09090b; color: #f4f4f5; padding: 40px; border-radius: 16px; max-w: 500px; margin: 0 auto; border: 1px solid #27272a;">
//           <h2 style="color: #a855f7; margin-bottom: 10px;">¡Bienvenido a Invitify, ${nombre}!</h2>
//           <p style="font-size: 14px; color: #a1a1aa; line-height: 1.5;">
//             Gracias por registrarte. Para comenzar a diseñar y gestionar tus invitaciones digitales inteligentes, necesitamos confirmar tu dirección de correo electrónico.
//           </p>
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${confirmLink}" style="background-color: #9333ea; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);">
//               Confirmar Correo Electrónico
//             </a>
//           </div>
//           <p style="font-size: 11px; color: #71717a; line-height: 1.4;">
//             Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br/>
//             <a href="${confirmLink}" style="color: #a855f7;">${confirmLink}</a>
//           </p>
//           <hr style="border: 0; border-top: 1px solid #27272a; margin: 30px 0;" />
//           <p style="font-size: 11px; color: #52525b; text-align: center; margin: 0;">
//             &copy; ${new Date().getFullYear()} Invitify. Gestión inteligente de eventos únicos.
//           </p>
//         </div>
//       `,
//     });
//     console.log(`✉️ Correo de verificación enviado con éxito a: ${email}`);
//   } catch (error) {
//     console.error('❌ ERROR_SEND_VERIFICATION_EMAIL:', error);
//     throw new Error('No se pudo enviar el correo de verificación.');
//   }
// }

// /**
//  * Envía el correo con el token temporal para el restablecimiento de contraseña.
//  */
// export async function sendPasswordResetEmail(email: string, token: string) {
//   const resetLink = `${domain}/auth/reset-password?token=${token}`;

//   try {
//     await resend.emails.send({
//       from: 'Invitify <onboarding@resend.dev>',
//       to: email,
//       subject: '🔒 Restablecer tu contraseña - Invitify',
//       html: `
//         <div style="font-family: sans-serif; background-color: #09090b; color: #f4f4f5; padding: 40px; border-radius: 16px; max-w: 500px; margin: 0 auto; border: 1px solid #27272a;">
//           <h2 style="color: #a855f7; margin-bottom: 10px;">Recuperación de Contraseña</h2>
//           <p style="font-size: 14px; color: #a1a1aa; line-height: 1.5;">
//             Hemos recibido una solicitud para restablecer la contraseña de acceso a tu cuenta en Invitify. Este enlace expirará en 1 hora.
//           </p>
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${resetLink}" style="background-color: #9333ea; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);">
//               Establecer Nueva Contraseña
//             </a>
//           </div>
//           <p style="font-size: 14px; color: #a1a1aa; line-height: 1.5;">
//             Si tú no solicitaste este cambio, puedes ignorar este correo de forma segura; tu contraseña actual se mantendrá intacta.
//           </p>
//           <p style="font-size: 11px; color: #71717a; line-height: 1.4; margin-top: 20px;">
//             Enlace directo:<br/>
//             <a href="${resetLink}" style="color: #a855f7;">${resetLink}</a>
//           </p>
//           <hr style="border: 0; border-top: 1px solid #27272a; margin: 30px 0;" />
//           <p style="font-size: 11px; color: #52525b; text-align: center; margin: 0;">
//             Invitify Security Engine.
//           </p>
//         </div>
//       `,
//     });
//     console.log(`✉️ Correo de recuperación enviado con éxito a: ${email}`);
//   } catch (error) {
//     console.error('❌ ERROR_SEND_RESET_EMAIL:', error);
//     throw new Error('No se pudo enviar el correo de recuperación.');
//   }
// }
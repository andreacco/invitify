import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

// Definimos exactamente qué rutas requieren autenticación obligatoria
export const config = {
  matcher: [
    "/admin/:path*", // Cualquier ruta que empiece con /admin (ej: /admin/invitados, /admin/dashboard)
    "/api/admin/:path*" // Protege también las futuras APIs administrativas
  ],
};
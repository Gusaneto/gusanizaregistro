GUSANIZA SEGURIDAD - INSTALACION

1. NO BORRES LAS PAGINAS VIEJAS TODAVIA.
2. Sube TODO el contenido de este ZIP a un repositorio GitHub NUEVO (carpeta raiz del proyecto).
3. En Vercel, importa ese repositorio como proyecto nuevo. Framework: Other. Root directory: ./
4. En Vercel > Settings > Environment Variables agrega:
   SUPABASE_URL = URL de proyecto Supabase
   SUPABASE_ANON_KEY = clave anon/publishable de Supabase
   SUPABASE_SERVICE_ROLE_KEY = clave service_role (SECRETA: solo Vercel, NUNCA frontend/GitHub)
   Aplica a Production y redeploy.
5. En Supabase > Authentication > URL Configuration, configura Site URL con el dominio NUEVO de Vercel; agrega ese dominio a Redirect URLs para confirmacion de correo.
6. Verifica que el trigger de alta de usuario cree perfiles_gusaniza (id, email, estado='pendiente', administrador=false). El proyecto anterior ya habia creado la funcion crear_perfil_gusaniza, pero confirma que el trigger se ejecuta al registrar usuario nuevo.
7. La cuenta de administrador debe existir en auth.users Y public.perfiles_gusaniza con estado='aprobado', administrador=true. NO copies claves de servicio en el navegador.
8. Prueba con usuario nuevo: registro, confirmacion email si esta habilitada, estado pendiente, rechazo de login, aprobacion en panel, acceso a herramientas, bloqueo y rechazo inmediato de nuevas peticiones.
9. IMPORTANTE: Las direcciones viejas de las herramientas SIGUEN PUBLICAS. Para impedir acceso por URL antigua, retira o protege esos despliegues DESPUES de validar la nueva plataforma. El enlace externo semovil.vercel.app se mantiene publico por decision de proyecto.
10. No habilites autenticacion anonima a las tablas. Mantener RLS habilitado; las consultas privilegiadas solo se realizan en funciones del servidor con service_role.

ADVERTENCIAS:
- Las sesiones duran aproximadamente una hora. Luego hay que iniciar sesion de nuevo.
- La recuperacion de contraseña esta disponible desde el formulario de inicio de sesion. En Supabase Authentication > URL Configuration configura Site URL y Redirect URLs para https://gusanizaregistro.vercel.app/** (o tu dominio definitivo). El enlace debe abrir la pagina con el fragmento type=recovery y access_token.
- Para verificar que nadie entra por la URL anterior, prueba desde una ventana privada.

NOTA VERSION 2: Se corrigio el nombre real de tabla a public.perfiles_gusaniza. El primer boton apunta a https://semovil.vercel.app/ sin modificar su contenido. Este enlace externo NO esta protegido contra acceso directo.

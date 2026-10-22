# Configuración inicial de administración MRF

La página pública muestra únicamente productos publicados. El panel `/admin` requiere inicio de sesión y una autorización individual guardada en `mrf_admin_users`. El cliente no tiene permisos de escritura.

## 1. Crear las tablas y políticas

En Supabase abre **SQL Editor → New query**, pega el contenido completo de `database/mrf_schema.sql` y pulsa **Run**.

## 2. Crear la primera cuenta administradora

En Supabase abre **Authentication → Users → Add user** y crea el usuario con el correo que usarán para administrar MRF. Usa una contraseña segura. No hace falta dar acceso a los compradores.

Después, en **SQL Editor**, ejecuta el siguiente comando sustituyendo el correo de ejemplo por el mismo correo que acabas de crear:

```sql
insert into public.mrf_admin_users (user_id)
select id from auth.users where email = lower('tu-correo@ejemplo.com')
on conflict (user_id) do nothing;
```

Repite estos pasos por cada persona del equipo que deba editar el catálogo. Nunca insertes clientes en `mrf_admin_users`.

En Supabase, desactiva el registro público en **Authentication → Settings → Sign-in / Providers → Allow new users to sign up**. El panel MRF no tiene un botón de registro; cada administrador se crea desde el Dashboard y se agrega manualmente a la tabla protegida.

## 3. Abrir el panel

Inicia la página y entra a `http://localhost:5173/admin/login`. Inicia sesión con el correo autorizado. El panel funciona desde PC y celular y permite publicar/ocultar productos, editar sus datos y fotos, y activar/desactivar las modalidades disponibles y por encargo.

## 4. Cargar los productos existentes

Los productos de ejemplo que ya estaban escritos en el código no se copian solos a Supabase. Después de ejecutar el SQL, agrégalos desde el panel. Al guardar, el catálogo público leerá los cambios de la base de datos.

## Seguridad

- No actives un formulario público de registro para administración.
- La clave `VITE_SUPABASE_PUBLISHABLE_KEY` puede usarse en la web; jamás pongas una clave `secret` o `service_role` en archivos Vite.
- Las políticas RLS de `database/mrf_schema.sql` dejan al público leer catálogo publicado, pero solo a los usuarios autorizados en `mrf_admin_users` modificar productos, opciones e imágenes.
- No subas `.env.local` al repositorio ni la compartas en capturas.

## Recuperar una contraseña olvidada

En Supabase abre **Authentication → URL Configuration → Redirect URLs** y agrega la dirección de recuperación de la app:

- Desarrollo local: `http://localhost:5173/admin/recover`
- Sitio publicado: `https://TU-DOMINIO/admin/recover` (reemplaza `TU-DOMINIO` por el dominio real del sitio)

En `/admin/login`, pulsa **¿Olvidaste tu contraseña?**, escribe el correo de la cuenta administradora y abre el enlace que llegue a ese correo. El enlace regresa a `/admin/recover`, donde se escribe y confirma la contraseña nueva. Si la URL de retorno no está en la lista permitida de Supabase, el enlace no podrá volver correctamente a la app.

## Activar el modo de mantenimiento

Ejecuta una sola vez el archivo database/mrf_maintenance_mode.sql en **Supabase → SQL Editor**. Esto agrega el interruptor a la configuración del catálogo ya existente.

Luego entra a /admin, abre **Opciones para clientes**, activa **Poner la página en mantenimiento** y guarda. Los visitantes de inicio, catálogo y productos verán el logo MRF y el mensaje “Estamos creando cosas nuevas para ti”; la ruta de administración seguirá disponible para que puedas volver y desactivarlo.

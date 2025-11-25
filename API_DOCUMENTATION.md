# OTT Perú - Documentación de APIs

## 🔐 Autenticación
Todas las APIs requieren autenticación JWT excepto el webhook de Culqi. Incluir header:
```
Authorization: Bearer <token>
```

---

## 📺 API de Reproducción

### POST `/play/{content_id}`
Valida y retorna la URL del manifest para reproducir contenido.

**Validaciones implementadas:**
1. ✅ **Geo-IP**: Solo permite acceso desde Perú
2. ✅ **Concurrencia**: Valida límite de dispositivos simultáneos según plan
3. ✅ **Plan (Upsell)**: Valida que el plan incluya TV en vivo si es necesario

**Request Body:**
```json
{
  "profile_id": "uuid",
  "device_id": "unique-device-identifier"
}
```

**Response (200 OK):**
```json
{
  "manifest_url": "https://example.com/manifest.m3u8",
  "content_id": "uuid",
  "title": "Nombre del contenido",
  "device_id": "device-123",
  "session_info": {
    "concurrent_streams": 1,
    "limit": 2
  }
}
```

**Errores posibles:**
- **403 Forbidden (GEO_BLOCKED):**
  ```json
  {
    "error": "Reproducción bloqueada. El servicio StreemingTv solo está disponible en Perú.",
    "code": "GEO_BLOCKED"
  }
  ```

- **403 Forbidden (CONCURRENT_LIMIT_REACHED):**
  ```json
  {
    "error": "Límite de reproducción simultánea alcanzado (2 dispositivos). Por favor, cierra otros dispositivos.",
    "code": "CONCURRENT_LIMIT_REACHED",
    "limit": 2,
    "current": 2,
    "oldest_device": "device-123"
  }
  ```

- **402 Payment Required (PLAN_UPGRADE_REQUIRED):**
  ```json
  {
    "error": "Necesitas un plan VOD + TV para ver TV en vivo. Actualiza tu plan.",
    "code": "PLAN_UPGRADE_REQUIRED",
    "required_scope": "VOD_TV",
    "current_plan": "Plan A",
    "available_plans": ["Plan C", "Plan D"]
  }
  ```

- **402 Payment Required (NO_SUBSCRIPTION):**
  ```json
  {
    "error": "No tienes una suscripción activa. Por favor, suscríbete para continuar.",
    "code": "NO_SUBSCRIPTION"
  }
  ```

**Notas importantes:**
- El `device_id` debe ser único por dispositivo (ej: UUID, MAC address, etc.)
- La sesión expira automáticamente después de 5 minutos sin heartbeat
- Para mantener la sesión activa, llamar al endpoint cada 2-3 minutos

---

## 💳 API de Pagos (Culqi)

### POST `/subscription-checkout`
Procesa un pago para crear o actualizar una suscripción.

**Request Body:**
```json
{
  "plan_id": "uuid",
  "token_id": "culqi-token-id",
  "email": "usuario@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "charge_id": "chr_test_xxxxx",
  "message": "Pago procesado exitosamente",
  "subscription": {
    "plan_name": "Plan C",
    "price": 25.00,
    "start_date": "2025-01-01T00:00:00Z",
    "end_date": "2025-01-31T00:00:00Z"
  }
}
```

**Errores:**
- **402 Payment Required**: Error al procesar el pago con Culqi
- **404 Not Found**: Plan no encontrado

**Flujo de integración:**
1. Cliente genera token de Culqi usando Culqi.js en el frontend
2. Enviar token_id al endpoint `/subscription-checkout`
3. El backend procesa el cargo con Culqi
4. Se crea/actualiza la suscripción automáticamente

---

### POST `/subscription-webhook` (Webhook de Culqi)
Endpoint público para recibir notificaciones de Culqi.

**⚠️ No requiere autenticación JWT** (configurado con `verify_jwt = false`)

**Eventos manejados:**
- `charge.succeeded`: Activa/renueva suscripción
- `charge.failed`: Cancela suscripción
- `refund.created`: Cancela suscripción

**Configuración en Culqi Dashboard:**
1. Ir a Configuración → Webhooks
2. Agregar URL: `https://tu-proyecto.supabase.co/functions/v1/subscription-webhook`
3. Seleccionar eventos: `charge.succeeded`, `charge.failed`, `refund.created`

---

## 🎬 API de Contenido Comunitario

### POST `/community-request`
Permite a usuarios solicitar contenido nuevo.

**Request Body:**
```json
{
  "content_title": "Título del contenido solicitado",
  "content_description": "Descripción detallada",
  "content_type": "movie" | "series" | "documentary",
  "content_details": {
    "year": 2024,
    "genre": "Drama",
    "actors": ["Actor 1", "Actor 2"]
  }
}
```

**Response (201 Created):**
```json
{
  "request": {
    "id": "uuid",
    "user_id": "uuid",
    "content_title": "Título",
    "status": "pending",
    "submission_date": "2025-01-01T00:00:00Z"
  },
  "message": "Solicitud enviada exitosamente. Será revisada en menos de 24 horas."
}
```

---

### GET `/community-request`
Lista solicitudes de contenido.

**Comportamiento:**
- **Usuario normal**: Solo ve sus propias solicitudes
- **Admin/Staff**: Ve todas las solicitudes

**Response (200 OK):**
```json
{
  "requests": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "content_title": "Título",
      "content_description": "Descripción",
      "status": "pending" | "approved" | "rejected" | "published",
      "submission_date": "2025-01-01T00:00:00Z",
      "approved_by": "uuid",
      "approved_at": "2025-01-01T12:00:00Z",
      "published_content_id": "uuid",
      "rejection_reason": "Motivo del rechazo"
    }
  ]
}
```

---

### PUT `/community-approve/{request_id}`
Aprueba o rechaza una solicitud de contenido.

**⚠️ Solo Admin/Staff** - Requiere rol `admin` o `staff` en tabla `user_roles`

**Request Body (Aprobar):**
```json
{
  "action": "approve",
  "manifest_url": "https://example.com/manifest.m3u8",
  "trailer_url": "https://example.com/trailer.mp4",
  "cover_image_url": "https://example.com/cover.jpg"
}
```

**Request Body (Rechazar):**
```json
{
  "action": "reject",
  "rejection_reason": "Contenido no disponible para licenciamiento"
}
```

**Response (200 OK - Aprobado):**
```json
{
  "message": "Solicitud aprobada y contenido publicado exitosamente (SLA < 24h)",
  "request_id": "uuid",
  "content_id": "uuid",
  "content": {
    "id": "uuid",
    "title": "Título",
    "category": ["Comunidad", "movie"],
    "manifest_url": "https://example.com/manifest.m3u8"
  }
}
```

**Errores:**
- **403 Forbidden**: Usuario no tiene rol admin/staff
- **404 Not Found**: Solicitud no encontrada

---

## 👥 Sistema de Roles

Para otorgar permisos de Admin/Staff a usuarios:

```sql
-- Insertar rol de admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-here', 'admin');

-- Insertar rol de staff
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-here', 'staff');
```

**Roles disponibles:**
- `user` (por defecto)
- `staff` (puede aprobar solicitudes de comunidad)
- `admin` (acceso completo)

---

## 🔄 Limpieza automática de sesiones

Las sesiones de reproducción inactivas (sin heartbeat > 5 minutos) se limpian automáticamente antes de cada validación de concurrencia.

Para forzar limpieza manual:
```sql
SELECT public.cleanup_stale_streams();
```

---

## 📊 Tablas principales

### `active_streams`
Tracking de sesiones de reproducción activas.

### `community_requests`
Solicitudes de contenido por la comunidad.

### `user_roles`
Roles de usuario (admin, staff, user).

### `subscriptions`
Suscripciones activas de usuarios.

### `plans`
Planes disponibles (A, B, C, D) con precios y límites.

---

## 🧪 Testing

### Probar Geo-IP validation
El sistema detecta automáticamente IPs de desarrollo (localhost, 192.168.x, 10.x) y permite el acceso.

### Probar concurrencia
1. Llamar `/play` desde 2 dispositivos distintos con mismo `user_id`
2. El 3er dispositivo debe recibir error 403 si el plan tiene límite de 2

### Probar upsell
1. Usuario con Plan A o B (solo VOD)
2. Intentar reproducir contenido con `is_tv=true`
3. Debe recibir error 402 solicitando upgrade a Plan C o D

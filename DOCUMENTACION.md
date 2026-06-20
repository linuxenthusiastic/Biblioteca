# Sistema de Gestión de Préstamos de Biblioteca

## 1. Análisis

### Problema

Las bibliotecas con atención a personas externas enfrentan dificultades para registrar y dar seguimiento a los préstamos de libros: se desconoce qué libros están disponibles, quién los tiene, y no existe un canal claro para que el público formule solicitudes. Esto genera pérdidas de material, demoras y conflictos por falta de información.

### Diferencia entre problema y solución

| Problema | Solución propuesta |
|---|---|
| No se sabe qué libros están disponibles | Catálogo con estado en tiempo real |
| No hay canal formal para solicitar libros | Formulario de solicitud de préstamo |
| El bibliotecario no tiene vista centralizada | Panel de gestión con acciones por solicitud |
| No queda registro de quién devolvió | Historial de devoluciones |

### Actores

- **Solicitante externo**: persona ajena a la institución que desea pedir un libro en préstamo.
- **Bibliotecario**: responsable de aprobar, rechazar y registrar devoluciones.

### Alcance

**Incluye:**
- Catálogo de libros con estado de disponibilidad
- Formulario de solicitud (nombre, email, DNI, libro, fecha de retiro)
- Panel del bibliotecario: aprobar, rechazar, registrar devolución
- Historial de préstamos finalizados

**No incluye:**
- Autenticación de usuarios ni roles con contraseña
- Gestión del inventario de libros (altas/bajas del catálogo)
- Notificaciones por email al solicitante
- Vencimiento automático de préstamos
- Backend ni base de datos persistente en servidor

### Riesgos identificados

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Datos en `localStorage` se pierden al limpiar el navegador | Alto | Informar al usuario; en producción reemplazar por backend |
| Múltiples solicitudes del mismo libro antes de aprobación | Medio | Se verifica disponibilidad al momento del envío; el primero en ser aprobado bloquea el libro |
| No hay control de identidad del solicitante | Medio | El DNI actúa como identificador básico; autenticación queda fuera del alcance |
| El bibliotecario puede operar sin login | Bajo | Aceptable en este alcance; en producción se requeriría autenticación |

---

## 2. Diseño

### Arquitectura

Aplicación de una sola página (SPA) sin framework. Tres vistas en pestañas, persistencia en `localStorage`.

```
index.html          → estructura HTML con las tres pestañas
src/
  main.js           → lógica de UI, eventos y renderizado
  storage.js        → operaciones sobre localStorage
  style.css         → estilos
```

### Modelo de datos

**Libro**
```json
{
  "id": 1,
  "titulo": "El principito",
  "autor": "Antoine de Saint-Exupéry",
  "isbn": "978-950-731-000-1"
}
```

**Solicitud de préstamo**
```json
{
  "id": 1748560000000,
  "solicitante": "Juan Pérez",
  "email": "juan@correo.com",
  "dni": "30456789",
  "libroId": 1,
  "libroTitulo": "El principito — Antoine de Saint-Exupéry",
  "fechaRetiro": "2026-06-10",
  "estado": "pendiente",
  "fechaDevolucion": null
}
```

### Estados de una solicitud

```
pendiente → activo   (bibliotecario aprueba)
pendiente → rechazado (bibliotecario rechaza)
activo    → devuelto  (bibliotecario registra devolución)
```

---

## 3. Desarrollo

### Stack

| Herramienta | Uso |
|---|---|
| Vanilla JS (ES Modules) | Lógica de la app |
| Vite 5 | Bundler y servidor de desarrollo |
| CSS nativo | Estilos |
| localStorage | Persistencia local |

### Comandos

```bash
npm install       # instalar dependencias
npm run dev       # servidor de desarrollo (localhost:5173)
npm run build     # compilar para producción → /dist
npm run preview   # previsualizar build
```

---

## 4. Validación

### Reglas aplicadas en el formulario de solicitud

| Campo | Regla |
|---|---|
| Nombre | Obligatorio, no vacío |
| Email | Obligatorio, formato válido |
| DNI | Obligatorio, solo dígitos, 7 u 8 caracteres |
| Libro | Obligatorio; opciones no disponibles aparecen deshabilitadas |
| Fecha de retiro | Obligatoria, no puede ser anterior a hoy |
| Disponibilidad | Si el libro ya tiene un préstamo activo, se rechaza el envío |

### Casos de prueba

- [ ] Solicitud exitosa con todos los campos válidos
- [ ] Error visible al dejar campos vacíos
- [ ] Error si el email no tiene formato correcto
- [ ] Error si el DNI tiene letras o menos de 7 dígitos
- [ ] Error si la fecha de retiro es anterior a hoy
- [ ] Libro no disponible aparece deshabilitado en el selector
- [ ] Bibliotecario puede aprobar una solicitud pendiente
- [ ] Bibliotecario puede rechazar una solicitud pendiente
- [ ] Libro pasa a "Prestado" en el catálogo tras aprobación
- [ ] Bibliotecario puede registrar devolución en préstamos activos
- [ ] Libro vuelve a "Disponible" tras registrar devolución
- [ ] Historial muestra solicitudes devueltas y rechazadas

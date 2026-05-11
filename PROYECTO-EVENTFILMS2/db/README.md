# PostgreSQL Database for EventFilms

Esta carpeta contiene el esquema relacional y datos de semilla para el proyecto.

## Archivos

- `schema.sql`: crea las tablas y vistas necesarias para el dominio de edición de eventos.
- `seed.sql`: inserta clientes, editores, almacenamientos, eventos y asignaciones de almacenamiento.

## Cómo crear la base de datos

1. Crear la base de datos en PostgreSQL:

```bash
createdb eventfilms
```

2. Ejecutar el esquema:

```bash
psql -d eventfilms -f db/schema.sql
```

3. Cargar datos de ejemplo:

```bash
psql -d eventfilms -f db/seed.sql
```

## Cómo iniciar PostgREST

1. Instala PostgREST y asegúrate de que el binario `postgrest` esté en tu PATH.

2. Inicia el servicio con la configuración incluida:

```bash
postgrest db/postgrest.conf
```

3. El API quedará expuesto en `http://127.0.0.1:3000`.

## Endpoints de ejemplo

- `GET /eventos`
- `GET /clientes`
- `GET /editores`
- `GET /almacenamientos`
- `GET /evento_almacenamiento`
- `GET /vw_evento_detalles`

## Credenciales

- Usuario de la base de datos: `postgres`
- Contraseña: `postgres`
- Base de datos: `eventfilms`

## Entidades principales

- `clientes`
- `editores`
- `almacenamientos`
- `eventos`
- `evento_almacenamiento`

## Relaciones

- `eventos` referencia a `clientes` y `editores`.
- `evento_almacenamiento` relaciona `eventos` con `almacenamientos`.
- `vw_evento_detalles` ofrece una vista de lectura rápida con la información principal del evento.

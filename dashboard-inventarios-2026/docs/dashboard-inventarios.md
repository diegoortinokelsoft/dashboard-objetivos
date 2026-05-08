# Dashboard Inventarios 2026

## Objetivo

Frontend en React + Vite + TypeScript para consultar y visualizar metricas del archivo `data-inventarios-2026`.

El dashboard evita consultas repetidas a Google Apps Script: hace una unica carga anual inicial y luego filtra, agrupa, calcula y exporta en el navegador.

## Endpoint

La app usa la variable:

```bash
VITE_INVENTARIOS_API_URL=https://script.google.com/macros/s/AKfycbyXGXw4G18dmeF9zkPH_o7yEdpSe9vW56bbnHi8xAEbHE4aYZ-e5OKKgOPbFfZRyrFLdg/exec
```

La URL final se construye asi:

```ts
`${import.meta.env.VITE_INVENTARIOS_API_URL}?type=year`
```

## Estrategia de consulta

La app consulta exclusivamente `?type=year`.

No hay nuevas consultas por mes, team o usuario. Todas las vistas dependen de la respuesta anual cacheada y procesada en frontend.

## Cache local

El hook `useInventariosData` guarda la respuesta completa en `localStorage` con estas claves:

```ts
inventarios-year-cache
inventarios-year-cache-time
```

El TTL es de 2 horas. Si existe cache fresca, se usa inmediatamente. Si el cache vencio, se conserva la data anterior mientras se consulta de nuevo. El boton `Actualizar` fuerza una nueva consulta y reemplaza la data.

## Limpieza de filas

Antes de calcular metricas se aplican estas reglas globales:

- Solo filas con `status = enviada`.
- Se ignoran filas sin `correo`.
- Se ignoran filas sin `fecha`.
- Se ignoran filas con `total_tareas <= 0`.
- Se deduplica por `task_id`; si no existe, por `_sheet + _rowNumber`.
- Si un usuario aparece en mas de un team, se agrupa separado por el team de cada fila.
- El mes se deriva siempre desde `fecha`.

## Formula de completitud

Para cada fila con objetivo configurado:

```txt
% fila = total_tareas / objetivo * 100
```

Para un usuario por dia:

```txt
% diario = suma de los porcentajes de todas sus filas validas del dia
```

Un dia se considera cumplido si `% diario >= 90%`.

Las filas sin objetivo no suman al porcentaje diario y se muestran como `Sin objetivo configurado` en el detalle.

## Objetivos

Los objetivos viven en:

```txt
src/config/objetivos.ts
```

Se buscan por combinacion normalizada `task_type + activity`, usando `trim().toLowerCase()`. No se usa `bu` para buscar objetivos.

## Paginas

`/resumen`: muestra porcentaje diario por fecha, usuario y team. Incluye filtros por mes, dia, team, usuario y cumplimiento diario.

`/usuario`: permite seleccionar un correo, ver resumen diario, expandir tareas originales y copiar o descargar CSV de resumen y detalle.

`/team`: permite seleccionar un team, filtrar por mes, dia, usuario y cumplimiento, y expandir las tareas originales de cada dia.

`/metricas`: muestra estadisticas numericas agrupadas por `BU + activity + task_type`, con objetivo esperado cuando exista.

Todas las tablas permiten ordenar por header: ascendente, descendente y regreso al orden default.

## Variables de entorno

Copiar `.env.example` a `.env` para correr localmente:

```bash
VITE_INVENTARIOS_API_URL=https://script.google.com/macros/s/AKfycbyXGXw4G18dmeF9zkPH_o7yEdpSe9vW56bbnHi8xAEbHE4aYZ-e5OKKgOPbFfZRyrFLdg/exec
```

## Desarrollo local

```bash
npm install
npm run dev
```

## Build para Netlify

```bash
npm run build
```

La carpeta `dist` queda lista para deploy estatico. El archivo `public/_redirects` contiene:

```txt
/* /index.html 200
```

Esto permite recargar rutas SPA como `/usuario`, `/team` o `/metricas` en Netlify.

# AUDIT_GUIDE.md

# Auditoría general del proyecto

Este documento define el procedimiento estándar para realizar una auditoría completa de la aplicación.

Cuando el usuario solicite un informe general del proyecto, seguí este procedimiento.

---

# REGLA PRINCIPAL

LA AUDITORÍA ES DE SOLO LECTURA.

Durante una auditoría:

- no modificar archivos;
- no crear archivos;
- no eliminar archivos;
- no renombrar archivos;
- no instalar paquetes;
- no actualizar paquetes;
- no ejecutar migraciones;
- no hacer deploy;
- no modificar bases de datos;
- no modificar servicios externos;
- no hacer commits;
- no hacer push.

Podés utilizar comandos seguros de inspección y diagnóstico.

---

# OBJETIVO

El objetivo de la auditoría es comprender la aplicación como:

1. producto;
2. sistema;
3. arquitectura;
4. código;
5. infraestructura;
6. aplicación en ejecución potencial;
7. proyecto mantenible a largo plazo.

No te limites a buscar errores sintácticos.

Intentá comprender cómo funciona realmente.

---

# 1. RECONOCIMIENTO DEL PROYECTO

Inspeccioná primero:

- estructura de carpetas;
- archivos raíz;
- package.json;
- archivos de configuración;
- variables de entorno referenciadas;
- README;
- documentación;
- configuración de build;
- configuración de hosting;
- configuración de base de datos;
- configuración de servicios externos.

Identificá el stack antes de profundizar.

---

# 2. DESCRIPCIÓN GENERAL

Explicá:

- qué hace la aplicación;
- cuál parece ser su objetivo;
- quiénes son sus usuarios;
- qué problema intenta resolver;
- cuáles son sus funcionalidades principales;
- cuáles son sus módulos principales.

No dependas exclusivamente del README.

Contrastá siempre documentación y código.

---

# 3. STACK TECNOLÓGICO

Identificá:

## Frontend

- lenguaje;
- framework;
- bundler;
- router;
- estado;
- UI;
- estilos;
- formularios.

## Backend

Si existe:

- lenguaje;
- framework;
- arquitectura;
- API;
- autenticación;
- validación.

## Datos

- base de datos;
- almacenamiento;
- caché;
- realtime;
- ORM;
- consultas.

## Servicios externos

Ejemplos:

- Firebase;
- AWS;
- Google;
- Stripe;
- Mercado Pago;
- servicios de correo;
- APIs externas.

## Infraestructura

- hosting;
- CI/CD;
- contenedores;
- cloud;
- dominios;
- configuración.

## Desarrollo

- lint;
- formatter;
- testing;
- package manager;
- scripts.

Indicá versiones cuando puedan determinarse de forma confiable.

---

# 4. ARQUITECTURA

Reconstruí la arquitectura real.

Explicá:

- entry point;
- inicialización;
- routing;
- layouts;
- estado global;
- estado local;
- contexts;
- stores;
- servicios;
- acceso a datos;
- autenticación;
- autorización;
- componentes;
- hooks;
- helpers;
- módulos.

Mostrá conceptualmente algo similar a:

Usuario
→ UI
→ componente
→ lógica
→ servicio
→ API / base de datos
→ estado
→ UI

---

# 5. FLUJOS FUNCIONALES

Identificá los flujos principales.

Por ejemplo:

## Autenticación

usuario
→ formulario
→ validación
→ servicio
→ autenticación
→ sesión
→ aplicación

## Creación de registro

usuario
→ formulario
→ validación
→ transformación
→ almacenamiento
→ actualización de estado
→ interfaz

## Lectura de datos

componente
→ contexto/store
→ servicio
→ consulta
→ transformación
→ estado
→ render

Adaptá estos flujos al proyecto real.

---

# 6. MODELO DE DATOS

Si existe una base de datos, analizá:

- entidades;
- colecciones;
- tablas;
- relaciones;
- claves;
- identificadores;
- referencias;
- duplicaciones;
- datos derivados;
- campos calculados.

Buscá inconsistencias potenciales.

Si la aplicación usa NoSQL, prestá atención a:

- desnormalización;
- duplicación deliberada;
- listeners;
- costos de lectura;
- índices;
- consistencia.

---

# 7. BUGS

Buscá errores potenciales relacionados con:

- null;
- undefined;
- NaN;
- strings vacíos;
- conversiones de tipos;
- fechas;
- IDs;
- arrays;
- objetos;
- promesas;
- asincronía;
- efectos;
- listeners;
- closures;
- estado;
- rutas;
- validaciones;
- formularios;
- errores de API;
- errores de base de datos.

Clasificá:

## Crítico

Puede provocar:

- pérdida de datos;
- acceso indebido;
- caída importante;
- corrupción;
- comportamiento grave.

## Alto

Puede romper funcionalidades importantes.

## Medio

Puede producir fallos en determinados casos.

## Bajo

Problema menor o caso borde.

Para cada bug indicá:

- archivo;
- zona aproximada;
- problema;
- escenario que lo activa;
- impacto;
- solución sugerida.

NO LO CORRIJAS.

---

# 8. SEGURIDAD

Realizá una auditoría específica.

Buscá:

## Autenticación

- rutas sin protección;
- sesiones incorrectas;
- manejo inseguro de tokens;
- persistencia incorrecta.

## Autorización

- usuarios que pueden acceder a datos ajenos;
- roles verificados solamente en frontend;
- permisos demasiado amplios.

## Base de datos

- reglas permisivas;
- operaciones cliente peligrosas;
- validaciones ausentes;
- escrituras arbitrarias.

## Secretos

- claves privadas;
- tokens;
- secretos;
- credenciales.

Nunca reproduzcas su contenido.

## Inputs

- datos sin validar;
- HTML;
- URLs;
- archivos;
- nombres de archivos;
- consultas.

## Dependencias

- paquetes innecesarios;
- paquetes potencialmente abandonados;
- configuraciones riesgosas.

## Infraestructura

- CORS;
- headers;
- endpoints;
- configuración de producción.

Clasificá riesgos según:

CRÍTICO
ALTO
MEDIO
BAJO

---

# 9. DUPLICACIÓN

Buscá:

- funciones similares;
- lógica repetida;
- componentes repetidos;
- formularios repetidos;
- transformaciones repetidas;
- validaciones repetidas;
- consultas repetidas;
- estilos repetidos;
- constantes duplicadas;
- configuración duplicada.

Para cada caso indicá:

- dónde está;
- qué se repite;
- cuánto valor tendría centralizarlo.

No refactorices automáticamente.

---

# 10. MANTENIBILIDAD

Evaluá:

- tamaño de archivos;
- tamaño de componentes;
- responsabilidad única;
- nombres;
- cohesión;
- acoplamiento;
- complejidad;
- dependencias cruzadas;
- organización;
- consistencia.

Señalá especialmente:

- God Components;
- God Services;
- funciones excesivamente largas;
- archivos difíciles de comprender;
- módulos con demasiadas responsabilidades.

---

# 11. PERFORMANCE

Buscá:

## Frontend

- renders innecesarios;
- estados duplicados;
- useEffect problemáticos;
- cálculos repetidos;
- listas grandes;
- imágenes;
- bundle;
- imports;
- listeners.

## Datos

- consultas repetidas;
- consultas demasiado amplias;
- listeners permanentes;
- falta de paginación;
- falta de caché;
- datos descargados innecesariamente.

## Backend

Si existe:

- consultas N+1;
- procesamiento repetido;
- llamadas externas;
- endpoints demasiado pesados.

Clasificá oportunidades por:

ALTO IMPACTO
MEDIO IMPACTO
BAJO IMPACTO

---

# 12. MANEJO DE ERRORES

Analizá:

- try/catch;
- errores ignorados;
- console.error;
- feedback al usuario;
- estados de loading;
- retry;
- errores de red;
- errores de autenticación;
- errores de base de datos.

Buscá errores que puedan fallar silenciosamente.

---

# 13. TESTING

Identificá:

- framework de testing;
- tests unitarios;
- tests integración;
- tests end-to-end.

Evaluá qué áreas críticas no tienen tests.

Proponé prioridades de testing.

No escribas tests automáticamente.

---

# 14. DOCUMENTACIÓN

Analizá:

- README;
- comentarios;
- documentación de arquitectura;
- instalación;
- variables de entorno;
- scripts;
- deploy.

Indicá documentación inexistente o desactualizada.

---

# 15. DEPENDENCIAS

Revisá dependencias declaradas.

Identificá:

- dependencias posiblemente innecesarias;
- duplicaciones funcionales;
- paquetes utilizados en un solo lugar;
- paquetes esenciales;
- posibles dependencias legacy.

No actualices automáticamente.

---

# 16. EXPERIENCIA DE USUARIO

Analizá cuando sea posible:

- navegación;
- formularios;
- feedback;
- errores;
- estados vacíos;
- loading;
- accesibilidad;
- responsive;
- consistencia;
- claridad.

Separá problemas objetivos de preferencias visuales.

---

# 17. ALCANCE DEL PRODUCTO

Evaluá qué funcionalidades podrían resultar útiles.

Buscá:

- procesos manuales que podrían automatizarse;
- funcionalidades parcialmente implementadas;
- oportunidades de integración;
- flujos innecesariamente largos;
- funcionalidades faltantes evidentes.

Separá claramente:

IDEAS DE PRODUCTO

de:

PROBLEMAS TÉCNICOS.

---

# 18. CÓDIGO MUERTO

Buscá:

- archivos aparentemente sin uso;
- imports sin uso;
- funciones no llamadas;
- componentes no utilizados;
- constantes obsoletas;
- código comentado;
- rutas inaccesibles.

No elimines nada.

---

# 19. CONSISTENCIA

Revisá inconsistencias en:

- nombres;
- formato;
- arquitectura;
- manejo de datos;
- tratamiento de fechas;
- IDs;
- errores;
- imports;
- estilos.

---

# 20. RESULTADO DEL INFORME

Presentá el informe con esta estructura.

# Informe técnico del proyecto

## 1. Resumen ejecutivo

Descripción breve del estado de la aplicación.

## 2. Qué hace la aplicación

Descripción funcional.

## 3. Tecnologías utilizadas

Stack.

## 4. Arquitectura

Descripción técnica.

## 5. Flujos principales

Flujos funcionales.

## 6. Modelo de datos

Si corresponde.

## 7. Fortalezas

Aspectos positivos reales.

## 8. Bugs encontrados

Separados por gravedad.

## 9. Riesgos de seguridad

Separados por gravedad.

## 10. Duplicaciones

Código repetido.

## 11. Problemas de arquitectura

Si existen.

## 12. Performance

Oportunidades.

## 13. Mantenibilidad

Diagnóstico.

## 14. Testing

Estado actual.

## 15. UX

Observaciones.

## 16. Ideas de producto

Ideas opcionales.

## 17. Código potencialmente obsoleto

Si existe.

## 18. Prioridades

### Crítica

### Alta

### Media

### Baja

## 19. Quick wins

Cambios pequeños con alto beneficio.

## 20. Mejoras estructurales

Cambios más grandes que podrían considerarse.

## 21. Próximos pasos sugeridos

Orden recomendado.

---

# VALORACIÓN FINAL

Asigná una valoración orientativa de 1 a 10 para:

- Arquitectura
- Calidad de código
- Mantenibilidad
- Seguridad
- Performance
- Testing
- UX
- Documentación

Luego:

Estado general: X/10

Explicá brevemente cada valoración.

Estas puntuaciones son orientativas.

No presentes una valoración como una medición objetiva.

---

# CIERRE

Finalizá indicando:

## Los 3 problemas más importantes

1.
2.
3.

## Las 3 mejoras con mejor relación esfuerzo/beneficio

1.
2.
3.

## Qué haría primero

Una recomendación concreta.

NO IMPLEMENTES NINGUNA DE LAS RECOMENDACIONES.

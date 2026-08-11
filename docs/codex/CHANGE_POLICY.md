# CHANGE_POLICY.md

# Política de cambios del proyecto

Este documento define cómo deben realizarse modificaciones sobre el proyecto.

---

# PRINCIPIO

Ningún cambio debe ejecutarse automáticamente.

Todo cambio debe seguir:

ANÁLISIS
→ PROPUESTA
→ CONFIRMACIÓN
→ IMPLEMENTACIÓN
→ VALIDACIÓN
→ INFORME

---

# 1. ANTES DE MODIFICAR

Antes de realizar un cambio:

1. comprendé el problema;
2. revisá código relacionado;
3. buscá soluciones existentes dentro del proyecto;
4. identificá dependencias;
5. evaluá posibles efectos secundarios.

---

# 2. PROPUESTA

Antes de implementar, presentá:

## Problema

Qué ocurre.

## Causa probable

Por qué ocurre.

## Solución propuesta

Qué harías.

## Archivos afectados

Listado exacto o aproximado.

## Riesgos

Qué podría romperse.

## Alternativas

Cuando exista más de una solución razonable.

---

# 3. AUTORIZACIÓN

Esperá aprobación explícita.

No interpretes preguntas como autorización.

Por ejemplo:

"¿Y si hacemos eso?"

NO significa autorización.

En cambio:

"Sí, hacelo."

sí significa autorización.

---

# 4. ALCANCE

La implementación debe limitarse al alcance acordado.

Ejemplo:

Si el usuario autoriza:

"Corregir el cálculo del stock."

No aproveches para:

- renombrar variables;
- refactorizar componentes;
- cambiar estilos;
- actualizar dependencias;
- reorganizar carpetas.

Salvo que sea necesario para solucionar el problema.

---

# 5. CAMBIOS PEQUEÑOS

Preferí cambios incrementales.

Si una tarea requiere una refactorización grande:

dividila conceptualmente en etapas.

Ejemplo:

ETAPA 1
Extraer acceso a datos.

ETAPA 2
Separar lógica.

ETAPA 3
Simplificar componentes.

Proponé las etapas antes de ejecutarlas.

---

# 6. NO REESCRIBIR SIN NECESIDAD

No reemplaces módulos completos cuando un cambio localizado resuelva el problema.

Preservá código funcional siempre que sea razonable.

---

# 7. DEPENDENCIAS

Antes de instalar una dependencia:

indicá:

- nombre;
- objetivo;
- por qué hace falta;
- alternativa sin dependencia;
- impacto.

Esperá autorización.

---

# 8. BASES DE DATOS

Nunca realices modificaciones de datos reales sin autorización específica.

Esto incluye:

- UPDATE;
- DELETE;
- INSERT;
- migraciones;
- seeds;
- cambios de esquema;
- modificaciones de documentos;
- operaciones masivas.

---

# 9. FIREBASE

No ejecutes automáticamente:

- deploy;
- cambios de reglas;
- borrado de colecciones;
- migraciones;
- modificaciones de configuración remota;
- cambios de proyectos;
- operaciones masivas.

Las reglas pueden editarse solamente después de aprobación.

El deploy requiere autorización independiente si no fue expresamente incluido.

---

# 10. GIT

Podés utilizar comandos seguros de lectura:

- git status;
- git diff;
- git log;
- git branch.

No ejecutes automáticamente:

- git commit;
- git push;
- git reset;
- git rebase;
- git clean;
- eliminación de ramas.

---

# 11. REFACTORING

Un refactor debe preservar comportamiento salvo que se acuerde lo contrario.

Antes de un refactor importante:

identificá:

- objetivo;
- alcance;
- beneficios;
- riesgos;
- archivos.

---

# 12. SEGURIDAD

Si encontrás una vulnerabilidad mientras trabajás en otra tarea:

informala.

No amplíes automáticamente el alcance para corregirla salvo que represente un riesgo inmediato de pérdida de datos durante la tarea actual.

---

# 13. ERRORES ENCONTRADOS DURANTE UNA TAREA

Si encontrás un bug no relacionado:

indicá:

"Encontré además un problema no relacionado con la tarea actual."

Explicalo brevemente.

No lo corrijas automáticamente.

---

# 14. VALIDACIÓN

Después de implementar:

cuando existan y sean seguros, utilizar:

- lint;
- tests;
- typecheck;
- build.

No hagas deploy para validar.

---

# 15. RESULTADO

Después de cada implementación presentar:

## Archivos modificados

- archivo A
- archivo B

## Qué cambió

Descripción.

## Por qué

Motivo.

## Validación realizada

Comandos o pruebas.

## Resultado

Éxito / problemas encontrados.

## Pendientes

Aspectos no modificados.

---

# 16. REVERSIBILIDAD

Siempre que sea posible, preferí cambios fáciles de revisar y revertir.

Evitar grandes modificaciones mezcladas sin necesidad.

---

# OBJETIVO

Los cambios deben ser:

- mínimos;
- comprensibles;
- revisables;
- seguros;
- consistentes.

# PROJECT_CONTEXT.md

# Contexto del proyecto

Este archivo contiene contexto humano sobre el proyecto.

No debe considerarse automáticamente como fuente absoluta de verdad.

Si existe una contradicción entre este documento y el código actual:

informala.

---

# 1. NOMBRE DEL PROYECTO

Nombre:

[COMPLETAR]

---

# 2. OBJETIVO

Descripción breve:

[COMPLETAR]

Ejemplo:

Esta aplicación administra operaciones internas de una empresa de transporte.

---

# 3. USUARIOS

Usuarios principales:

[COMPLETAR]

Ejemplo:

- administración;
- operadores;
- choferes;
- supervisores.

---

# 4. FUNCIONALIDADES PRINCIPALES

[COMPLETAR]

Ejemplo:

- gestión de usuarios;
- gestión de productos;
- ventas;
- compras;
- stock;
- reportes.

---

# 5. STACK PRINCIPAL

Frontend:

[COMPLETAR]

Backend:

[COMPLETAR]

Base de datos:

[COMPLETAR]

Autenticación:

[COMPLETAR]

Hosting:

[COMPLETAR]

---

# 6. ESTADO DEL PROYECTO

Seleccionar aproximadamente:

- prototipo;
- desarrollo;
- testing;
- producción;
- mantenimiento.

Estado:

[COMPLETAR]

---

# 7. ARQUITECTURA DESEADA

[COMPLETAR]

Ejemplo:

components
→ componentes visuales reutilizables

pages
→ pantallas

services
→ acceso a datos

context
→ estado global

functions
→ funciones reutilizables

---

# 8. DECISIONES TÉCNICAS

Registrar decisiones importantes.

Ejemplo:

## CSS

Se utiliza CSS tradicional.

No utilizar Tailwind salvo decisión explícita.

## Datos

El acceso a Firestore debe centralizarse en services.

## Componentes

Evitar lógica de acceso a datos directamente dentro de componentes visuales.

---

# 9. COSAS QUE NO QUEREMOS CAMBIAR SIN MOTIVO IMPORTANTE

[COMPLETAR]

Ejemplo:

- framework principal;
- Firebase;
- estructura general;
- sistema de IDs;
- estilos visuales generales.

---

# 10. PRIORIDADES

Orden aproximado:

1. estabilidad;
2. seguridad;
3. mantenibilidad;
4. funcionalidad;
5. performance;
6. estética.

Modificar según el proyecto.

---

# 11. RESTRICCIONES

[COMPLETAR]

Ejemplo:

- evitar servicios pagos adicionales;
- evitar dependencias innecesarias;
- mantener compatibilidad mobile;
- mantener Firebase como backend actual.

---

# 12. DATOS IMPORTANTES

Describir conceptualmente datos importantes.

NO colocar:

- contraseñas;
- tokens;
- API keys privadas;
- credenciales;
- secretos.

---

# 13. INTEGRACIONES

[COMPLETAR]

Ejemplo:

- Firebase Authentication;
- Firestore;
- Firebase Hosting.

---

# 14. CONVENCIONES

## Naming

[COMPLETAR]

## Idioma del código

[COMPLETAR]

## Idioma de interfaz

[COMPLETAR]

## Estilos

[COMPLETAR]

---

# 15. PROBLEMAS CONOCIDOS

Problemas ya conocidos por el propietario:

[COMPLETAR]

Esto permite distinguir entre problemas nuevos y deuda técnica conocida.

---

# 16. FUNCIONALIDADES FUTURAS

Ideas o funcionalidades previstas:

[COMPLETAR]

No deben considerarse obligatorias.

---

# 17. DECISIONES DE PRODUCTO

Registrar decisiones que puedan parecer extrañas desde el código pero tengan una razón de negocio.

Ejemplo:

"Los registros históricos nunca se eliminan físicamente."

---

# 18. ENTORNOS

Desarrollo:

[COMPLETAR]

Testing:

[COMPLETAR]

Producción:

[COMPLETAR]

No incluir secretos.

---

# 19. DEPLOY

Descripción conceptual:

[COMPLETAR]

No incluir credenciales.

---

# 20. NOTAS PARA CODEX

Consideraciones adicionales:

[COMPLETAR]

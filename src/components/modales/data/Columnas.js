export const columnas = {
  tractores: [
    { key: "id", label: "Interno", filtroEspecial: true },
    { key: "dominio", label: "Dominio" },
    { key: "nombreEmpresa", label: "Empresa" },
    { key: "marca", label: "Marca" },
    { key: "modelo", label: "Modelo" },
    { key: "nombrePersona", label: "Persona" },
    //{ key: "nombreResponsable", label: "Responsable" },
    { key: "nombreSatelital", label: "Satelital" },
    //{ key: "detalle", label: "Detalle" },
    { key: "estado", label: "Estado", filtroEspecial: true },
  ],
  furgones: [
    { key: "id", label: "ID", filtroEspecial: true },
    { key: "dominio", label: "Dominio" },
    { key: "nombreEmpresa", label: "Empresa" },
    { key: "tipo", label: "Tipo" },
    { key: "estado", label: "Estado", filtroEspecial: true },
  ],
  personas: [
    { key: "id", label: "DNI", filtroEspecial: true },
    { key: "legajo", label: "Legajo", filtroEspecial: true },
    { key: "nombreCompleto", label: "Persona" },
    { key: "nombreEmpresa", label: "Empresa" },
    { key: "puestoCompleto", label: "Puesto" },
    { key: "estado", label: "Estado", filtroEspecial: true },
  ],
  empresas: [
    { key: "id", label: "CUIT" },
    { key: "nombre", label: "Nombre" },
    { key: "razonSocial", label: "Razon social" },
    { key: "tipo", label: "Tipo" },
    { key: "ubicacion", label: "Ubicacion" }
  ],
  cuentaCorriente: [
    { key: "id", label: "CUIT" },
    { key: "nombre", label: "Nombre" },
    { key: "monto", label: "Monto" },
    { key: "estado", label: "Estado" }
  ],
  movimientos: [
    { key: "id", label: "N° Movimiento", filtroEspecial: true },
    { key: "fecha", label: "Fecha & hora", filtroEspecial: true },
    { key: "viaje", label: "N° Viaje", filtroEspecial: true },
    { key: "personaCompleta", label: "Persona / empleado", filtroEspecial: true },
    { key: "operadorCompleto", label: "Operador", filtroEspecial: true },
    { key: "tipo", label: "TIPO", filtroEspecial: true },
    { key: "montoCompleto", label: "Monto" }
  ],
  viajes: [
    { key: "id", label: "N° Viaje", filtroEspecial: true },
    { key: "fecha", label: "Fecha & hora", filtroEspecial: true },
    { key: "personaCompleta", label: "Chofer", filtroEspecial: true },
    { key: "tractorCompleto", label: "Tractor", filtroEspecial: true },
    { key: "furgonCompleto", label: "Carga / Furgon", filtroEspecial: true },
    { key: "clienteCompleto", label: "Cliente", filtroEspecial: true },
    { key: "detalle", label: "Detalle" },
  ],
  cruces: [
    { key: "id", label: "N° Cruce", filtroEspecial: true },
    { key: "viaje", label: "N° Viaje", filtroEspecial: true },
    { key: "fecha", label: "Fecha & hora", filtroEspecial: true },
    { key: "personaCompleta", label: "Chofer", filtroEspecial: true },
    { key: "tractorCompleto", label: "Tractor", filtroEspecial: true },
    { key: "furgonCompleto", label: "Carga / Furgon", filtroEspecial: true },
    { key: "detalle", label: "Detalle" },
  ]
};
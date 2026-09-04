export const columnas = {
  tractores: [
    { key: "id", label: "Interno", filtroEspecial: true, responsive: true },
    { key: "dominio", label: "Dominio", responsive: true },
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
    { key: "id", label: "ID", filtroEspecial: true, responsive: true },
    { key: "dominio", label: "Dominio", responsive: true },
    { key: "nombreEmpresa", label: "Empresa" },
    { key: "tipo", label: "Tipo" },
    { key: "estado", label: "Estado", filtroEspecial: true },
  ],
  personas: [
    { key: "id", label: "DNI", filtroEspecial: true, responsive: true },
    { key: "legajo", label: "Legajo", filtroEspecial: true },
    { key: "nombreCompleto", label: "Persona", responsive: true },
    { key: "nombreEmpresa", label: "Empresa" },
    { key: "puestoCompleto", label: "Puesto", responsive: true },
    { key: "estado", label: "Estado", filtroEspecial: true },
  ],
  empresas: [
    { key: "id", label: "CUIT", responsive: true },
    { key: "nombre", label: "Nombre", responsive: true },
    { key: "razonSocial", label: "Razon social", responsive: true },
    { key: "tipo", label: "Tipo" },
    { key: "ubicacion", label: "Ubicacion" }
  ],
  cuentaCorriente: [
    { key: "id", label: "CUIT", responsive: true },
    { key: "nombre", label: "Nombre", responsive: true },
    { key: "monto", label: "Monto", responsive: true },
    { key: "estado", label: "Estado" }
  ],
  movimientos: [
    { key: "estadoLabel", label: "Estado", responsive: true },
    { key: "id", label: "N° Movimiento", filtroEspecial: true },
    { key: "fecha", label: "Fecha & hora", filtroEspecial: true, responsive: true },
    { key: "viaje", label: "N° Viaje", filtroEspecial: true },
    { key: "personaCompleta", label: "Persona / empleado", filtroEspecial: true, responsive: true },
    { key: "operadorCompleto", label: "Operador", filtroEspecial: true },
    { key: "tipo", label: "TIPO", filtroEspecial: true, responsive: true },
    { key: "montoCompleto", label: "Monto", responsive: true },
    { key: "nroAdelanto", label: "n° Adelanto", responsive: false }
  ],
  liquidaciones: [
    { key: "estadoLabel", label: "Estado", responsive: true },
    { key: "id", label: "N° Liquidación", filtroEspecial: true, responsive: true },
    { key: "fecha", label: "Fecha & hora", filtroEspecial: true, responsive: true },
    { key: "cuentaCompleta", label: "Cuenta", filtroEspecial: true, responsive: true },
    { key: "saldoCompleto", label: "Saldo", responsive: true },
    { key: "cantidadMovimientos", label: "Movimientos", responsive: true },
    { key: "tipoCierreCompleto", label: "Cierre", responsive: true },
    { key: "operadorCompleto", label: "Operador" },
    { key: "nroAdelanto", label: "n° Adelanto", responsive: false }
  ],
  viajes: [
    { key: "id", label: "N° Viaje", filtroEspecial: true },
    { key: "fecha", label: "Fecha & hora", filtroEspecial: true, responsive: true },
    { key: "personaCompleta", label: "Chofer", filtroEspecial: true, responsive: true },
    { key: "tractorCompleto", label: "Tractor", filtroEspecial: true, responsive: true },
    { key: "furgonCompleto", label: "Carga / Furgon", filtroEspecial: true, responsive: true },
    { key: "clienteCompleto", label: "Cliente", filtroEspecial: true },
    { key: "detalle", label: "Detalle" },
    { key: "estadoLabel", label: "Estado" }
  ],
  cruces: [
    { key: "estadoLabel", label: "Estado", responsive: true },
    { key: "id", label: "N° Cruce", filtroEspecial: true },
    { key: "viaje", label: "N° Viaje", filtroEspecial: true },
    { key: "fecha", label: "Fecha & hora", filtroEspecial: true, responsive: true },
    { key: "personaCompleta", label: "Chofer", filtroEspecial: true, responsive: true },
    { key: "tractorCompleto", label: "Tractor", filtroEspecial: true, responsive: true },
    { key: "furgonCompleto", label: "Carga / Furgon", filtroEspecial: true, responsive: true },
    { key: "detalle", label: "Detalle" },
  ]
};

export const columnas = {
  tractores: [
    { key: "id", label: "Interno", filtroEspecial: true },
    { key: "dominio", label: "Dominio" },
    { key: "nombreEmpresa", label: "Empresa" },
    { key: "marca", label: "Marca" },
    { key: "modelo", label: "Modelo" },
    //{ key: "nombreResponsable", label: "Responsable" },
    //{ key: "nombreSatelital", label: "Satelital" },
    { key: "detalle", label: "Detalle" },
    { key: "estado", label: "Estado", filtroEspecial: true },
  ],
  furgones: [
    { key: "id", label: "ID", filtroEspecial: true },
    { key: "dominio", label: "Dominio" },
    { key: "nombreEmpresa", label: "Empresa" },
    { key: "detalle", label: "Detalle" },
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
    { key: "tipo", label: "Tipo" },
    { key: "cuentaCorriente", label: "Cta Corriente" },
    { key: "estado", label: "Estado" }
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
    { key: "personaCompleta", label: "Persona / empleado", filtroEspecial: true },
    { key: "operadorCompleto", label: "Operador", filtroEspecial: true },
    { key: "tipo", label: "TIPO", filtroEspecial: true },
    { key: "montoCompleto", label: "Monto" }
  ]
};
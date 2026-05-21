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
};
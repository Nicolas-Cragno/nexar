export const fichaContent = {
    tractores: [
        { key: "id", label: "Interno", type: "title" },
        { key: "dominio", label: "Dominio", type: "principal" },
        { key: "marca", label: "Marca", type: "principal" },
        { key: "modelo", label: "Modelo", type: "principal" },
        { key: "motor", label: "Motor", type: "principal" },
        { key: "chasis", label: "Chasis", type: "principal" },
        { key: "detalle", label: "Detalle", type: "principal" },
        { key: "nombreEmpresa", label: "Empresa", type: "secondary" },
        //{ key: "nombreResponsable", label: "A cargo", type: "secondary" },
        //{ key: "nombreSatelital", label: "Satelital", type: "secondary" },
        //{ key: "detalleSatelital", label: "Detalle (satelital)", type: "secret" }, // restringido
        //{ key: "comentarioSatelital", label: "Comentario (satelital)", type: "secret" }, // restringido
        { key: "estado", label: "Estado", type: "state" },

    ],
    furgones: [
        { key: "id", label: "Interno", type: "title" },
        { key: "dominio", label: "Dominio", type: "principal" },
        { key: "marca", label: "Marca", type: "principal" },
        { key: "modelo", label: "Modelo", type: "principal" },
        { key: "detalle", label: "Detalle", type: "principal" },
        { key: "nombreEmpresa", label: "Empresa", type: "secondary" },
        { key: "estado", label: "Estado", type: "state" },

    ],
    personas: [
        { key: "apellido", label: "apellido", type: "title" },
        { key: "nombres", label: "nombres", type: "secondtitle" },
        { key: "id", label: "DNI", type: "principal" },
        { key: "nacimiento", label: "Nacimiento", type: "principal", soloFecha: true },
        { key: "ubicacion", label: "Ubicación", type: "principal" },
        { key: "legajo", label: "Legajo", type: "secondary" },
        { key: "nombreEmpresa", label: "Empresa", type: "secondary" },
        { key: "ingreso", label: "Ingreso", type: "secondary" },
        { key: "tipo", label: "Relación", type: "secondary" },
        { key: "puestoCompleto", label: "Puesto", type: "secondary" },
        { key: "sucursalCompleta", label: "Sede", type: "secondary" },
        { key: "detalle", label: "Detalle", type: "secondary" },
        { key: "estado", label: "Estado", type: "state" },
    ],
}


// grafica para types:

/*
     _______________________
    |                       |
    |         title         |
    |_______________________|
    |                       |
    |        subtitle       |
    |_______________________|
    |                       |
    |       principal       |
    |_______________________|
    |                       |
    |       secondary       |
    |_______________________|
    |                       |
    |         footer        |
    |_______________________|

*/
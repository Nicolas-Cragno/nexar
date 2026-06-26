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
        { key: "nombrePersona", label: "A cargo", type: "secondary" },
        { key: "nombreSatelital", label: "Satelital", type: "secondary" },
        //{ key: "detalleSatelital", label: "Detalle (satelital)", type: "secret" }, // restringido
        //{ key: "comentarioSatelital", label: "Comentario (satelital)", type: "secret" }, // restringido
        { key: "estado", label: "Estado", type: "state" },

    ],
    furgones: [
        { key: "id", label: "Interno", type: "title" },
        { key: "dominio", label: "Dominio", type: "principal" },
        { key: "tipo", label: "Tipo", type: "principal" },
        { key: "marca", label: "Marca", type: "principal" },
        { key: "modelo", label: "Modelo", type: "principal" },
        { key: "detalle", label: "Detalle", type: "principal" },
        { key: "nombreEmpresa", label: "Empresa", type: "secondary" },
        { key: "estado", label: "Estado", type: "state" },

    ],
    personas: [
        { key: "estado", label: "Estado", type: "state" },
        // datos personales
        { key: "apellido", label: "apellido", type: "title" },
        { key: "nombres", label: "nombres", type: "secondtitle" },
        { key: "id", label: "DNI", type: "principal" },
        { key: "cuit", label: "CUIT / CUIL", type: "principal" },
        { key: "nacimiento", label: "Nacimiento", type: "principal", soloFecha: true },
        { key: "ubicacion", label: "Ubicación", type: "principal" },
        // datos laborales
        { key: "legajo", label: "Legajo", type: "secondary" },
        { key: "nombreEmpresa", label: "Empresa", type: "secondary" },
        { key: "alta", label: "Ingreso", type: "secondary" },
        { key: "tipo", label: "Relación", type: "secondary" },
        { key: "cuentaCorriente", label: "Cta Corriente", type: "secondary" },
        { key: "puestoCompleto", label: "Puesto", type: "secondary" },
        { key: "sucursalCompleta", label: "Sede", type: "secondary" },
        { key: "detalle", label: "Detalle", type: "secondary" },
    ],
    clientes: [
        { key: "id", label: "CUIT", type: "principal" },
        { key: "nombre", label: "Nombre", type: "principal" },
        { key: "razonSocial", label: "Razon Social", type: "principal" },
        { key: "tipo", label: "Tipo", type: "principal" },
        { key: "ubicacion", label: "Ubicacion", type: "principal" }
    ],
    proveedores: [
        { key: "id", label: "CUIT", type: "principal" },
        { key: "nombre", label: "Nombre", type: "principal" },
        { key: "razonSocial", label: "Razon Social", type: "principal" },
        { key: "tipo", label: "Tipo", type: "principal" },
        { key: "ubicacion", label: "Ubicacion", type: "principal" }
    ],
    viajes: [
        { key: "fecha", label: "Fecha de inicio", type: "principal", soloFecha: true },
        { key: "fechaFin", label: "Fecha finalización", type: "principal", soloFecha: true },
        { key: "estadoLabel", label: "Estado", type: "stateButton", submitType: "submitFinViaje" },
        { key: "personaCompleta", label: "Chofer", type: "principal" },
        { key: "tractorCompleto", label: "Tractor", type: "principal" },
        { key: "furgonCompleto", label: "Carga/Furgon", type: "principal" },
        { key: "clienteCompleto", label: "Cliente/s", type: "principal" },
        { key: "pdf", label: "Impresion", type: "pdf", function: "imprimirHojaDeRuta" },
        //{ key: "tramos", label: "Tramos", type: "secondary" },
        //{ key: "adelantosRegistrados", label: "Adelantos", type: "secondary" }, se renderiza directo en Ficha.jsx
        //{ key: "crucesRegistrados", label: "Cruces de barcaza", type: "secondary" }, se renderiza directo en Ficha.jsx
    ]

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
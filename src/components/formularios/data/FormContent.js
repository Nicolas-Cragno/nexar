export const eventos = {
    porteria: [
        { key: "tipo", label: "Tipo", type: "principal", use: "database", dato: "text", inputType: "inputOptions", optionsList: "tiposPorteria", important: true },
        { key: "operador", label: "Operador", type: "principal", use: "database", dato: "number", inputType: "inputOptions", optionsList: "serenos", important: true },
        { key: "persona", label: "Chofer", type: "principal", use: "database", dato: "number", inputType: "inputOptions", optionsList: "choferes", important: true },
        { key: "tractor", label: "Tractor", type: "principal", use: "database", dato: "number", inputType: "inputOptions", optionsList: "tractores", important: true },
        { key: "furgon", label: "Furgon / carga", type: "secondary", type2: "boolOptionB", use: "database", dato: "number", inputType: "inputOptions", optionsList: "furgones", important: false },
        { key: "cargado", label: "Con carga", type: "secondary", use: "database", dato: "boolean", inputType: "boolean", positive: "FURGON CARGADO", negative: "FURGON VACIO" },
        { key: "detalle", label: "Detalle", use: "database", type: "secondary", dato: "text", inputType: "textarea", important: false },
        {
            key: "chequeos", label: "Chequeos", type: "group", use: "database", dato: "array", important: false, items: [
                { key: "ckAntivandalico", label: "Antivandalico", type: "select", dato: "boolean" },
                { key: "ckCorte", label: "Corte", type: "select", dato: "boolean" },
                { key: "ckDesenganche", label: "Desenganche", type: "select", dato: "boolean" },
                { key: "ckPanico", label: "Panico", type: "select", dato: "boolean" },
                { key: "ckPuertaCabina", label: "Puerta cabina", type: "select", dato: "boolean" },
                { key: "ckPuertaFurgon", label: "Puerta furgon", type: "select", dato: "boolean" },
                { key: "ckReporte", label: "Reporte", type: "select", dato: "boolean" },
            ]
        },
    ],
    porteriaParticular: [
        { key: "tipo", label: "Tipo", type: "principal", use: "database", dato: "text", inputType: "inputOptions", optionsList: "tiposPorteria", important: true },
        { key: "operador", label: "Operador", type: "principal", use: "database", dato: "number", inputType: "inputOptions", optionsList: "serenos", important: true },
        { key: "detalle", label: "Detalle", use: "database", type: "principal", dato: "text", inputType: "textarea", important: false },
        { key: "persona", label: "Persona", type: "secondary", use: "database", dato: "number", inputType: "inputOptions", optionsList: "personas", important: true },
        { key: "vehiculo", label: "Vehiculo", type: "secondary", use: "database", dato: "text", inputType: "inputOptions", optionsList: "vehiculos", important: false },
        { key: "furgon", label: "Furgon / carga", type: "secondary", use: "database", dato: "number", inputType: "inputOptions", optionsList: "furgones", important: false },

    ],
    porteriaProveedores: [
        { key: "tipo", label: "Tipo", type: "principal", use: "database", dato: "text", inputType: "inputOptions", optionsList: "tiposPorteria", important: true },
        { key: "operador", label: "Operador", type: "principal", use: "database", dato: "number", inputType: "inputOptions", optionsList: "serenos", important: true },
        { key: "destino", label: "Destino", use: "database", type: "principal", dato: "number", inputType: "inputOptions", optionsList: "sectores", important: true },
        { key: "detalle", label: "Detalle", use: "database", type: "principal", dato: "text", inputType: "textarea", important: false },
        { key: "empresa", label: "Empresa", type: "secondary", use: "database", dato: "number", inputType: "inputOptions", optionsList: "proveedores", important: false },
        { key: "persona", label: "Persona", type: "secondary", use: "database", dato: "number", inputType: "inputOptions", optionsList: "personas", important: false },
        { key: "vehiculo", label: "Vehiculo", type: "secondary", use: "database", dato: "text", inputType: "inputOptions", optionsList: "vehiculos", important: false },
        { key: "remito", label: "Remito", type: "secondary", use: "database", dato: "text", inputType: "input", important: false },
    ],
    llaves: [
        { key: "tipo", label: "Tipo", type: "principal", use: "database", dato: "text", inputType: "inputOptions", optionsList: "llaves", important: true },
        { key: "operador", label: "Operador", type: "principal", use: "database", dato: "number", inputType: "inputOptions", optionsList: "serenos", important: true },
        { key: "detalle", label: "Detalle", use: "database", type: "principal", dato: "text", inputType: "textarea", important: false },
        { key: "persona", label: "Persona", type: "secondary", use: "database", dato: "number", inputType: "inputOptions", optionsList: "personas", important: true },
        { key: "tractor", label: "Tractor", type: "secondary", use: "database", dato: "array", inputType: "multiOptions", optionsList: "tractores", important: true },
        { key: "parteTr", label: "Parte de tractor", type: "secondary", use: "database", dato: "boolean", inputType: "boolean", positive: "DEJA PARTE DE TRACTOR", negative: "SIN PARTE DE TRACTOR" }
    ],
    tractores: [
        { key: "sucursal", label: "Sucursal", type: "principal", use: "database", dato: "text", inputType: "inputOptions", optionsList: "sucursales", important: true },
        { key: "mecanico", label: "Mecanico", type: "principal", use: "database", dato: "number", inputType: "inputOptions", optionsList: "personas", importante: true },
        { key: "tipo", label: "Tipo", type: "principal", use: "database", dato: "text", inputType: "inputOptions", optionsList: "tiposTractores", important: true },
        { key: "tractor", label: "Tractor", type: "principal", use: "database", dato: "number", inputType: "inputOptions", optionsList: "tractores", important: true },
        { key: "kilometraje", label: "Kilometraje", type: "principal", use: "database", dato: "number", inputType: "input", important: false },
        { key: "persona", label: "Chofer", type: "principal", use: "database", dato: "number", inputType: "inputOptions", optionsList: "choferes", important: false },
        { key: "detalle", label: "Detalle", use: "database", type: "principal", dato: "text", inputType: "textarea", important: false },
        {
            key: "repuestos", label: "Repuestos", type: "groupComplete", optionsList: "stock", use: "database", dato: "array", important: false, addButton: true, items: [
                { key: "repuesto", label: "Repuesto", inputType: "inputOptions", optionsList: "stock", dato: "number" },
                { key: "cantidad", label: "Cantidad", inputType: "input", dato: "number" },
                { key: "unidad", label: "Unidad", inputType: "inputOptions", optionsList: "unidades", dato: "text" },
            ]
        },
        {
            key: "chequeos", label: "Chequeos", type: "group", use: "database", dato: "array", important: false, items: [
                { key: "aceiteMotor", label: "Aceite de Motor", type: "select", dato: "boolean" },
                { key: "filtroGasoil", label: "Filtro de Gasoil", type: "select", dato: "boolean" },
                { key: "trampaAgua", label: "Trampa de Agua", type: "select", dato: "boolean" },
                { key: "filtroAceite", label: "Filtro de Aceite", type: "select", dato: "boolean" },
                { key: "filtroAire", label: "Filtro de Aire", type: "select", dato: "boolean" },
                { key: "filtroHidraulico", label: "Filtro Hidráulico", type: "select", dato: "boolean" },
                { key: "engrase", label: "Engrase", type: "select", dato: "boolean" },

                { key: "filtroSecador", label: "Filtro Secador", type: "select", dato: "boolean" },
                { key: "aceiteCaja", label: "Aceite de Caja", type: "select", dato: "boolean" },
                { key: "filtroCaja", label: "Filtro de Caja", type: "select", dato: "boolean" },
                { key: "aceiteDiferencial", label: "Acite Diferencial", type: "select", dato: "boolean" },
                { key: "filtroDiferencial", label: "Filtro Diferencial", type: "select", dato: "boolean" },
                { key: "filtroAgua", label: "Filtro de Agua", type: "select", dato: "boolean" },
                { key: "anticongelante", label: "Anticongelante", type: "select", dato: "boolean" },
            ]
        },
        // parte para los repuestos - array - 
    ],
    satelital: [
        { key: "tipo", label: "Tipo", type: "principal", use: "database", dato: "text", inputType: "inputOptions", optionsList: "tiposSatelital", important: true },
        { key: "persona", label: "Persona", type: "principal", use: "database", dato: "number", inputType: "inputOptions", optionsList: "personas", important: true },
        { key: "tractor", label: "Tractor", type: "principal", use: "database", dato: "number", inputType: "inputOptions", optionsList: "tractores", important: true },
        { key: "furgon", label: "Furgon / carga", type: "principal", use: "database", dato: "number", inputType: "inputOptions", optionsList: "furgones", important: false },

        { key: "ubicacion", label: "Ubicacion", use: "database", type: "secondary", dato: "text", inputType: "input", important: false },

        { key: "personaRelacionada", label: "2° Persona/s", type: "secondary", use: "database", dato: "array", inputType: "multiOptions", optionsList: "personas", important: false },
        { key: "tractorRelacionado", label: "2° Tractor/s", type: "secondary", use: "database", dato: "array", inputType: "multiOptions", optionsList: "tractores", important: false },


        { key: "detalle", label: "Detalle", use: "database", type: "secondary", dato: "text", inputType: "textarea", important: false },

    ],
    stock: [
        { key: "area", label: "Area", type: "principal", use: "database", dato: "text", inputType: "inputOptions", optionsList: "sectores", important: true },
        { key: "detalle", label: "Detalle", use: "database", type: "principal", dato: "text", inputType: "textarea", important: false },
        {
            key: "ingresos", label: "Movimiento a registrar", type: "group", use: "database", dato: "array", important: false, items: [
                { key: "id", label: "Articulo", type: "group", dato: "string", inputType: "inputOptions", optionsList: "stock" },
                { key: "cantidad", label: "Cantidad", type: "group", dato: "number", inputType: "input" },
                { key: "moneda", label: "Moneda", type: "group", dato: "boolean", inputType: "booleanDouble", optionOne: "AR$", optionTwo: "U$D" },
                { key: "valor", label: "Valor", type: "group", dato: "number", inputType: "input" },
            ]
        },
    ],
    cuentaCorriente: [
        { key: "viaje", label: "Viaje", type: "principal", use: "database", dato: "text", inputType: "inputOptions", optionsList: "viajesActivos", important: false },
        { key: "tipo", label: "Tipo", type: "principal", use: "database", dato: "text", inputType: "inputOptions", optionsList: "tipoCuentaCorriente", important: true, neverDisabled: true },
        { key: "operador", label: "Operador", type: "principal", use: "database", dato: "number", inputType: "inputOptions", optionsList: "administrativos", important: true, neverDisabled: true },
        { key: "persona", label: "Empleado", type: "principal", use: "database", dato: "number", inputType: "inputOptions", optionsList: "cuentasCorrientes", important: true },
        { key: "monto", label: "Monto", use: "database", type: "secondary", dato: "number", inputType: "input", important: true, neverDisabled: true },
        { key: "detalle", label: "Detalle", use: "database", type: "secondary", dato: "text", inputType: "textarea", important: false, neverDisabled: true },
    ],
    viajes: [
        { key: "persona", label: "Chofer", type: "principal", use: "database", dato: "number", inputType: "inputOptions", optionsList: "choferes", important: true },
        { key: "tractor", label: "Tractor", type: "principal", use: "database", dato: "number", inputType: "inputOptions", optionsList: "tractores", important: true },
        { key: "furgon", label: "Carga / Furgón", type: "principal", use: "database", dato: "array", inputType: "multiOptions", optionsList: "furgones", important: false },
        { key: "cliente", label: "Cliente", type: "principal", use: "database", dato: "array", inputType: "multiOptions", optionsList: "clientes", important: false },
        { key: "operador", label: "Operador", type: "principal", use: "database", dato: "number", inputType: "inputOptions", optionsList: "administrativos", important: true, neverDisabled: true },
        { key: "detalle", label: "Detalle", use: "database", type: "principal", dato: "text", inputType: "textarea", important: false },
        {
            key: "tramos", label: "Tramos", type: "groupTramos", use: "database", dato: "array", addButton: true, items: [
                //{ key: "fechaSalida", label: "Fecha", inputType: "inputDate" },
                { key: "lugarSalida", label: "Origen", inputType: "inputOptions", optionsList: "provincias" },
                //{ key: "fechaLlegada", label: "Fecha", inputType: "inputDate" },
                { key: "lugarLlegada", label: "Destino", inputType: "inputOptions", optionsList: "provincias" },
                //{ key: "detalle", label: "Detalle", inputType: "input" },
            ]
        },
        { key: "adelanto", label: "Adelanto", use: "database", type: "noVisual", dato: "number" },
        { key: "adelantos", label: "Adelantos", type: "toDo" }

    ],
    cruces: [
        { key: "viaje", label: "Viaje", type: "principal", use: "database", dato: "text", inputType: "inputOptions", optionsList: "viajesActivos", important: true },
        { key: "persona", label: "Chofer", type: "principal", use: "database", dato: "number", inputType: "inputOptions", optionsList: "choferes", important: true },
        { key: "tractor", label: "Tractor", type: "principal", use: "database", dato: "number", inputType: "inputOptions", optionsList: "tractores", important: true },
        { key: "furgon", label: "Carga / Furgón", type: "principal", use: "database", dato: "array", inputType: "multiOptions", optionsList: "furgones", limitOptions: 2, important: false },
        { key: "detalle", label: "Detalle", use: "database", type: "secondary", dato: "text", inputType: "textarea", important: false, neverDisabled: true }
    ],
    cargas: [
        { key: "viaje", label: "Viaje", type: "principal", use: "database", dato: "text", inputType: "inputOptions", optionsList: "viajes", important: true },
        {
            key: "destinos", label: "Destinos", type: "groupComplete", use: "database", dato: "array", addButton: true, items: [
                //{ key: "fecha", label: "Salida", inputType: "inputDate" },
                { key: "cliente", label: "Cargado en", inputType: "input" },
                { key: "carga", label: "Carga", inputType: "input" },
                { key: "detalle", label: "Detalle", inputType: "input" },
            ]
        },
    ]
}
export const elementos = {
    tractores: [
        { key: "interno", isId: true, label: "Interno", type: "principal", use: "database", dato: "text", inputType: "input", important: true, notChange: true }, // se envía como identificador
        { key: "dominio", label: "Dominio", use: "database", type: "principal", dato: "text", inputType: "input", important: true },
        { key: "chasis", label: "Chasis", use: "database", type: "principal", dato: "text", inputType: "input", important: false },
        { key: "motor", label: "Motor", use: "database", type: "principal", dato: "number", inputType: "input", important: false },
        { key: "marca", label: "Marca", use: "database", type: "principal", dato: "text", inputType: "input", important: false },
        { key: "modelo", label: "Modelo", use: "database", type: "principal", dato: "number", inputType: "input", important: false },
        { key: "detalle", label: "Detalle", use: "database", type: "principal", dato: "text", inputType: "textarea", important: false },
        { key: "empresa", label: "Empresa", use: "database", type: "secondary", dato: "number", inputType: "inputOptions", optionsList: "empresasPropias", important: false },
        { key: "satelital", label: "Satelital", type: "secondary", use: "database", dato: "number", inputType: "inputOptions", optionsList: "proveedores", important: false },
        { key: "persona", label: "Persona asignada / dueño", use: "database", type: "secondary", inputType: "inputOptions", optionsList: "choferes", dato: "number", important: false },
        //{ key: "detalleSatelital", label: "Detalle (satelital)", use: "database", type: "secret", inputType: "textarea", dato: "text", important: false }, // retextido
        //{ key: "comentarioSatelital", label: "Comentario (satelital)", use: "database", type: "secret", inputType: "textarea", dato: "text", important: false }, // retextido
    ],
    furgones: [
        { key: "interno", isId: true, label: "Interno", type: "principal", use: "database", dato: "number", inputType: "input", important: true, notChange: true }, // se envía como identificador
        { key: "tipo", label: "Tipo", type: "principal", use: "database", dato: "text", inputType: "inputOptions", optionsList: "tipoFurgones", important: true },
        { key: "dominio", label: "Dominio", type: "principal", use: "database", dato: "text", inputType: "input", important: true },
        { key: "marca", label: "Marca", type: "principal", use: "database", dato: "text", inputType: "input", important: false },
        { key: "modelo", label: "Modelo", type: "principal", use: "database", dato: "number", inputType: "input", important: false },
        { key: "detalle", label: "Detalle", type: "principal", use: "database", dato: "text", inputType: "textarea", important: false },
        { key: "empresa", label: "Empresa", use: "database", type: "secondary", dato: "number", inputType: "inputOptions", optionsList: "empresasPropias", important: false },
        //{ key: "comentarioSatelital", label: "Comentario (satelital)", use: "database", type: "secret", dato: "textarea", inputType: "input", important: false }, // retextido

    ],
    personas: [
        // datos personales
        { key: "dni", isId: true, label: "DNI", type: "principal", use: "database", dato: "number", inputType: "input", important: true, notChange: true },
        { key: "cuit", label: "CUIT / CUIL", type: "principal", use: "database", dato: "number", inputType: "input", important: true, notChange: true },
        { key: "apellido", label: "Apellido", type: "principal", use: "database", dato: "text", inputType: "input", important: true },
        { key: "nombres", label: "Nombres", type: "principal", use: "database", dato: "text", inputType: "input", important: true },
        { key: "nacimiento", label: "Nacimiento", type: "principal", use: "database", dato: "date", inputType: "inputDate", important: false },
        { key: "ubicacion", label: "Ubicación", type: "principal", use: "database", dato: "text", inputType: "input", important: false },
        // datos laborales
        { key: "legajo", label: "Legajo", type: "secondary", use: "database", dato: "number", inputType: "input", important: false },
        { key: "empresa", label: "Empresa", type: "secondary", use: "database", dato: "number", inputType: "inputOptions", optionsList: "empresasPropias", important: false },
        { key: "tipo", label: "Tipo", type: "secondary", use: "database", dato: "text", inputType: "inputOptions", optionsList: "tipoEmpleados", important: false },
        { key: "puesto", label: "Puesto", type: "secondary", use: "database", dato: "text", inputType: "inputOptions", optionsList: "puestos", important: false },
        { key: "especializacion", label: "Especialización", type: "secondary", use: "database", dato: "text", inputType: "input", important: false },
        { key: "sucursal", label: "Sucursal", type: "secondary", use: "database", dato: "text", inputType: "inputOptions", optionsList: "ubicaciones", important: false },
        //{ key: "ingreso", label: "Ingreso", type: "secret", use: "database", dato: "date", inputType: "", important: false },
        { key: "detalle", label: "Detalle", type: "principal", use: "database", dato: "text", inputType: "textarea", important: false },
        //{ key: "comentario", label: "Comentario", type: "secret", use: "database", dato: "text", inputType: "", important: false },
        //{ key: "alerta", label: "Alerta", type: "secret", use: "database", dato: "", inputType: "text", important: false },
    ],
    empresas: [
        { key: "cuit", isId: true, label: "Cuit", type: "principal", use: "database", dato: "number", inputType: "input", important: true, notChange: true }, // se envía como identificador
        { key: "razonSocial", label: "Razon Social", type: "principal", use: "database", dato: "text", inputType: "input", important: true },
        { key: "nombre", label: "Nombre", type: "principal", use: "database", dato: "text", inputType: "input", important: true },
        { key: "tipo", label: "Tipo", use: "database", type: "secondary", dato: "text", inputType: "inputOptions", optionsList: "tipoEmpresas", important: true },
        { key: "ubicacion", label: "Ubicacion", type: "principal", use: "database", dato: "text", inputType: "input", important: false },
    ]
}
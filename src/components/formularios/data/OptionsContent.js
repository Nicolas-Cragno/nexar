import localidades from "../../../functions/data/localidades.json";
import provincias from "../../../functions/data/provincias.json";

const builderOptions = (data = [], label) => {
    if (!Array.isArray(data)) return [];

    return data.map((item) => ({
        value: item.id,
        label: label(item),
        raw: item,
    }))
}

// Elementos

export const stockOptions = (data = []) => {
    // elementos, repuestos, herramientas, etc
    const label = (item) => `${item.id} - ${item.label} ${item.detalle ? " | " + item.detalle : ""}`;
    return builderOptions(data, label);
};

export const proveedoresOptions = (data = []) => {
    // proveedores de articulos y servicios
    const label = (item) => `${item.id} - ${item.nombre} ${item.marca !== item.nombre ? "(" + item.marca + ")" : ""} - ${item.cuit !== 0 && item.cuit}`
    return builderOptions(data, label);
}

export const empresasOptions = (data = []) => {
    // empresas, proveedores y sucursales
    const label = (item) => `${item.nombre} (${item.id})`;
    return builderOptions(data, label)
};

export const personasOptions = (data = []) => {
    // personas(full), mecanicos, choferes, etc
    const label = (item) => `${item.apellido}, ${item.nombres} ${item.especializacion ? "(" + item.especializacion + ")" : item.puesto ? "(" + item.puesto + ")" : ""}`;
    return builderOptions(data, label)
};

export const vehiculosOptions = (data = []) => {
    // tractores, furgones y vehiculos
    const label = (item) => `${item.id} (${item.dominio === item.id ? item.marca : item.dominio})`;
    return builderOptions(data, label)
};

export const sectoresOptions = (data = []) => {
    const label = (item) => `${item.id} - ${item.nombre}`;
    return builderOptions(data, label);
};

export const localidadesOptions = localidades.map(lc => ({
    value: lc.key,
    label: `${lc.nombre} (${lc.ubicacion}, ${lc.provincia})`,
    raw: lc
}));

export const provinciasOptions = provincias.map(pv => ({
    value: pv.key,
    label: pv.nombre,
    shortLabel: pv.label,
    raw: pv
}));

// Tipos

export const llavesOptions = () => {
    return [
        { value: "RETIRA", label: "RETIRA LLAVES" },
        { value: "ENTREGA", label: "ENTREGA LLAVES" },
    ];
};

export const porteriaOptions = (filtro = null) => {
    if (filtro === "llaves") {
        return llavesOptions();
    }
    return [
        { value: "ENTRADA", label: "ENTRADA AL PREDIO" },
        { value: "SALIDA", label: "SALIDA DEL PREDIO" },
    ];
};

export const satelitalOptions = () => {
    return [
        { value: "ACCIDENTE", label: "ACCIDENTE" },
        { value: "ALARMA", label: "ALARMA" },
        { value: "AUXILIO", label: "AUXILIO" },
        { value: "CAMBIO", label: "CAMBIO" },
        { value: "CONVOY", label: "CONVOY" },
        { value: "CORTE", label: "CORTE DE COMBUSTIBLE" },
        { value: "ROBO", label: "ROBO" },
        { value: "ROTURA", label: "ROTURA" },
        { value: "SATELITAL", label: "SATELITAL" },
    ]
}

export const tractoresOptions = (filtro = null) => {
    if (filtro === "llaves") {
        return llavesOptions();
    }
    return [
        { value: "CAMBIO", label: "CAMBIO" },
        { value: "REVISION", label: "REVISION" },
        { value: "SERVICE", label: "SERVICE" },
        { value: "ALINEACION Y BALANCEO", label: "ALINEACION Y BALANCEO" },
    ];
};

export const furgonesOptions = () => {
    return [
        { value: "CAMBIO", label: "CAMBIO" },
        { value: "REVISION", label: "REVISION" },
        { value: "SERVICE", label: "SERVICE" },
    ];
}

export const typeFurgonesOptions = () => {
    return [
        { value: "BITREN-D-PLAYO", label: "BITREN DELANTERO (PLAYO)" },
        { value: "BITREN-T-PLAYO", label: "BITREN TRASERO (PLAYO)" },
        { value: "BITREN-D-SEMI", label: "BITREN DELANTERO (SEMI)" },
        { value: "BITREN-T-SEMI", label: "BITREN TRASERO (SEMI)" },
    ];
}

export const stockTypeOptions = () => {
    return {
        "AC": { "tipo": "ACCESORIO", "descripcion": "COMPONENTES ADICIONALES O DECORATIVOS DEL VEHÍCULO" },
        "CA": { "tipo": "CARROCERIA", "descripcion": "PARTES EXTERNAS Y ESTRUCTURALES DEL CAMIÓN" },
        "CB": { "tipo": "COMBUSTIBLE", "descripcion": "ELEMENTOS DEL SISTEMA DE ALIMENTACIÓN Y FILTRADO DE COMBUSTIBLE" },
        "EL": { "tipo": "ELECTRICIDAD", "descripcion": "SISTEMA ELÉCTRICO, ILUMINACIÓN Y SENSORES" },
        "FL": { "tipo": "FLUIDO", "descripcion": "ACEITES, GRASAS Y TODO LÍQUIDO DESTINADO AL MANTENIMIENTO/FUNCIONAMIENTO DEL VEHÍCULO." },
        "FR": { "tipo": "FRENOS", "descripcion": "COMPONENTES DEL SISTEMA DE FRENOS Y AIRE" },
        "HI": { "tipo": "HIDRAULICA", "descripcion": "SISTEMAS HIDRÁULICOS Y NEUMÁTICOS AUXILIARES" },
        "HE": { "tipo": "HERRAMIENTA", "descripcion": "TODO TIPO DE ELEMENTOS, UTENSILIOS Y EQUIPOS UTILIZADOS PARA EL MANTENIMIENTO, REPARACIÓN O AJUSTE DE LOS VEHÍCULOS" },
        "IN": { "tipo": "INSUMO", "descripcion": "MATERIALES Y PRODUCTOS DE USO RECURRENTE EN TAREAS DE MANTENIMIENTO, LIMPIEZA O REPARACIÓN DE LOS VEHÍCULOS" },
        "MT": { "tipo": "MOTOR", "descripcion": "PARTES Y ACCESORIOS DEL MOTOR" },
        "RC": { "tipo": "RECUPERADO", "descripcion": "COMPONENTE, ELEMENTO, PARTE O ACCESORIO TOMADO DE UN VEHICULO PARA USAR EN OTRO." },
        "RF": { "tipo": "REFRIGERACION", "descripcion": "SISTEMA DE ENFRIAMIENTO DEL MOTOR Y RADIADORES" },
        "RO": { "tipo": "RODADO", "descripcion": "RUEDAS, CUBIERTAS, LLANTAS Y RODAMIENTOS" },
        "SP": { "tipo": "SUSPENSION", "descripcion": "AMORTIGUADORES, BUJES, FUELLES Y RESORTES" },
        "TR": { "tipo": "TRANSMISION", "descripcion": "EMBRAGUE, CAJA DE CAMBIOS Y DIFERENCIAL" },
        "SV": { "tipo": "SERVICIO", "descripcion": "TAREAS DE MANTENIMIENTO, REVISIÓN, DIAGNÓSTICO O INTERVENCIÓN REALIZADAS SOBRE EL VEHÍCULO" }
    };
}

export const unidadesOptions = () => {
    return {
        "UN": { "descripcion": "UNIDADES" },
        "LT": { "descripcion": "LITROS" },
        "MT": { "descripcion": "METROS" },
        "KG": { "descripcion": "KILOGRAMOS" },
        "GR": { "descripcion": "GRAMOS" },
        "ML": { "descripcion": "METROS LINEALES" },
        "CM": { "descripcion": "CENTIMETROS" },
        "MM": { "descripcion": "MILIMETROS" },
        "RL": { "descripcion": "ROLLOS" },
        "M3": { "descripcion": "METROS CUBICOS" },
        "TN": { "descripcion": "TONELADAS" }
    }
}

export const tipoCuentaCorrienteOptions = () => {
    return {
        "COBRO": { key: "COBRO", "descripcion": "COBRO (INGRESO DE DINERO A CAJA)" },
        "PAGO": { key: "PAGO", "descripcion": " PAGO (ANTICIPOS, PAGOS, ETC)" }
    }
}

export const puestosOptions = () => {
    return {
        "ADMINISTRATIVO": { key: "ADMINISTRATIVO", "descripcion": "ADMINISTRATIVO" },
        "CHOFER": { key: "CHOFER", "descripcion": "CHOFER (LARGA / MOVIMIENTO)" },
        //"MAESTRANZA" : { key: "MAESTRANZA", "descripcion": "PERSONAL DE MAESTRANZA"},
        //"TALLER" : { key: "TALLER", "descripcion": "TALLER (MECANICOS, ELECTRICISTAS, GOMEROS, ETC)"},
        //"TRAFICO" : {key: "TRAFICO", "descripcion" : "PERSONAL DE TRÁFICO"}
    }
}

export const tipoEmpleadoOptions = () => {
    return {
        "EMPLEADO": { "key": "EMPLEADO", "descripcion": "EMPLEADO (TRANSCAN)" },
        //"PROVEEDOR" : { "key": "PROVEEDOR", "descripcion" : "PROVEEDOR"},
    }
}
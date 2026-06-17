//------------------------------------------------------ externos
import Swal from "sweetalert2";
import { Timestamp } from "firebase/firestore";
//------------------------------------------------------ funciones
import { stockTypeOptions, unidadesOptions, puestosOptions, tipoEmpleadoOptions, personasOptions, tipoCuentaCorrienteOptions, provinciasOptions, localidadesOptions, viajesOptions, typeFurgonesOptions, tipoEmpresasOptions } from "../components/formularios/data/OptionsContent";
import { useData } from "../contexto/DataContext";
//------------------------------------------------------ 


export const convertirFecha = (fecha) => {
  if (!fecha) return new Date(0);

  // Firestore timestamp
  if (fecha.seconds) {
    return new Date(fecha.seconds * 1000);
  }

  // Date nativo
  if (fecha instanceof Date) {
    return fecha;
  }

  // String ISO
  return new Date(fecha);
};

export const limpiarFecha = (fecha) => {
  // para comparar fechas 

  if (!fecha) return 0;

  if (typeof fecha.toDate === "function") {
    return fecha.toDate().getTime();
  }
  if (fecha.seconds) {
    return fecha.seconds * 1000;
  }

  if (fecha instanceof Date) {
    return fecha.getTime();
  }

  if (typeof fecha === "string") {
    return new Date(fecha).getTime();
  }

  return 0;
};

export const formatearCampoFirestore = (valor, soloFecha = false) => {

  // de firestore al front
  if (valor === null || valor === undefined) return "-";

  if (typeof valor === "boolean") return valor ? "Activo" : "Inactivo";

  // fechas (INICIO)
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/; // formato 2025-08-22T08:00:00Z
  const isoRegex2 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{3}Z$/; // formato 2025-08-22T08:00:000Z (error)

  if (typeof valor === "string" && isoRegex.test(valor)) {
    return new Date(valor).toLocaleDateString("es-AR");
  }
  if (typeof valor === "string" && isoRegex2.test(valor)) {
    // corregir y eliminar el 0 de más en 000Z (debe ser 00Z)
    const corregido = valor.replace(
      /T(\d{2}:\d{2}):(\d{3})Z$/,
      "T$1:00.$2Z"
    );

    return new Date(corregido).toLocaleDateString("es-AR");
  }
  if (typeof valor.toDate === "function") {
    return soloFecha
      ? valor.toDate().toLocaleDateString("es-AR")  // solo fecha
      : valor.toDate().toLocaleString();             // fecha + hora
  }
  if (valor?.seconds) {
    const fecha = new Date(valor.seconds * 1000);

    return soloFecha
      ? fecha.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      : fecha.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
  }

  if (valor instanceof Date) {
    return soloFecha
      ? valor.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      : valor.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
  }
  // fechas (FIN)}

  // array y objetos
  if (Array.isArray(valor)) {
    return valor
      .map(v => (typeof v === "object" ? "[obj]" : v))
      .join(", ");
  }
  if (typeof valor === "object") {
    if (valor.nombre) return valor.nombre;
    if (valor.id) return valor.id;
    // fechas
    if (typeof valor._seconds === "number") {
      const fecha = new Date(valor._seconds * 1000);
      return fecha.toLocaleDateString("es-AR");
    }

    if (typeof valor.seconds === "number") {
      const fecha = new Date(valor.seconds * 1000);
      return fecha.toLocaleDateString("es-AR");
    }

    if (typeof valor.toDate === "function") {
      return valor.toDate().toLocaleDateString("es-AR");
    }



    //return JSON.stringify(valor);


    return "[Objeto]";
  }

  return valor.toString();
};

export const formatearCampoParaCarga = (valor, tipo) => {
  if (valor === "" || valor === null || valor === undefined) return null;

  switch (tipo) {
    case "number":
      return Number(valor);

    case "boolean":
      if (typeof valor === "boolean") return valor;
      return valor === "true" || valor === "1";

    case "date":
      console.log("date recibido:", valor, typeof valor);

      if (typeof valor?.toDate === "function") return valor; // ya es Timestamp, no tocar
      if (typeof valor === "string") return Timestamp.fromDate(new Date(valor + "T12:00:00"));
      if (valor instanceof Date) return Timestamp.fromDate(valor);
      return null;

    case "array":
      return Array.isArray(valor) ? valor : [valor];

    case "text":
    default:
      return String(valor).toUpperCase().trim();
  }
};

// del front al firestore
export const parsearFechaATimestamp = (valor) => {
  if (!valor) return null;
  if (typeof valor.toDate === "function") return valor; // ya es Timestamp, no tocar
  if (typeof valor === "string") {
    const fecha = new Date(valor + "T12:00:00");
    if (isNaN(fecha.getTime())) return null; // ← fecha inválida, no explotar
    return Timestamp.fromDate(fecha);
  }
  return null;
};

export const capitalizarTexto = (texto) => {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

export const renderizarValor = (valor, col, style = "normal") => {
  if (valor === null || valor === undefined) return "-";

  // 🔥 Firestore timestamp
  if (valor?.seconds || valor?._seconds) {
    return new Date(
      (valor.seconds || valor._seconds) * 1000
    ).toLocaleString("es-AR");
  }

  // Date nativo
  if (valor instanceof Date) {
    return valor.toLocaleString("es-AR");
  }

  // Boolean
  if (typeof valor === "boolean") {
    return valor ? "ACTIVO" : "INACTIVO";
  }

  // Array
  if (Array.isArray(valor)) {
    return valor.join(", ");
  }

  // Objeto dinámico
  if (typeof valor === "object" && col) {
    return valor[col] ?? "[Objeto]";
  }

  // Estilos
  let valorFinal;

  switch (style) {
    case "upper":
      valorFinal = typeof valor === "string" ? valor.toUpperCase() : valor;
      break;
    case "lower":
      valorFinal = typeof valor === "string" ? valor.toLowerCase() : valor;
      break;
    default:
      valorFinal = valor;
      break;
  }

  return valorFinal;
};

export const minimizarVehiculo = (tipoVehiculo) => {
  if (!tipoVehiculo) {
    return "";
  }
  let tipo;
  switch (tipoVehiculo.toUpperCase()) {
    case "TRACTORES": tipo = "TRACTOR"; break;
    case "FURGONES": tipo = "FURGON"; break;
    default: tipo = "VEHICULO"; break;
  }
  return tipo;
};

export const cargarOpciones = (campos, dataContext) => {
  try {

    const collectionsToLoad = [
      ...new Set(
        campos
          .filter(c => c.inputType === "inputOptions")
          .map(c => c.optionsConfig.collection)
      )
    ];

    const resultado = {};

    collectionsToLoad.forEach((collection) => {
      resultado[collection] = dataContext?.[collection] || [];
    });

    return resultado;

  } catch (error) {
    console.error("[Error] cargando opciones:", error);
    return {};
  }
};

export const cargarSelects = (tipo, listado = []) => {
  if (!tipo) return [];

  let lista = [];

  switch (tipo) {
    case "viajes":
      lista = listado.map(vj => ({
        value: vj.id,
        label: vj.label,
        raw: vj
      }));
      break;
    case "personas":
      lista = listado.map(ps => ({
        value: ps.id,
        label: `${ps.apellido.toUpperCase()}, ${ps.nombres.toUpperCase()} (${ps.id})`,
        raw: ps
      })); break;

    case "tractores":
      lista = listado.map(tr => ({
        value: tr.id,
        label: `${tr.id} (${tr.dominio.toUpperCase()})`,
        raw: tr
      })); break;
    case "furgones":
      console.log("furgones para select: ", listado);
      lista = listado.map(fg => ({
        value: fg.id,
        label: `${fg.id} (${fg.dominio.toUpperCase()})`,
        raw: fg
      })); break;
    case "cuentas":
      lista = listado.map(ct => ({
        value: ct.id,
        label: `${ct.nombre.toUpperCase()}`,
        raw: ct
      })); break;
    case "empresas":
      lista = listado.map(em => ({
        value: em.id,
        label: `${em.nombre.toUpperCase()}`,
        raw: em
      })); break;
    case "clientes":
      lista = listado.map(em => ({
        value: em.id,
        label: `${em.nombre.toUpperCase()}`,
        raw: em
      })); break;
    case "tipoEmpleado":
      lista = Object.values(tipoEmpleadoOptions()).map((te) => ({
        value: te.key,
        label: te.descripcion.toUpperCase(),
        raw: te,
      })); break;
    case "tipoEmpresa":
      lista = Object.values(tipoEmpresasOptions()).map((te) => ({
        value: te.key,
        label: te.descripcion.toUpperCase(),
        raw: te,
      })); break;
    case "puestos":
      lista = Object.values(puestosOptions()).map((ps) => ({
        value: ps.key,
        label: ps.descripcion.toUpperCase(),
        raw: ps,
      })); break;
    case "ubicaciones":
      lista = listado.map(ub => ({
        value: ub.id,
        label: `${ub.nombre.toUpperCase()}`,
        raw: ub
      })); break;
    case "tipoCuentaCorriente":
      lista = Object.values(tipoCuentaCorrienteOptions()).map((te) => ({
        value: te.key,
        label: te.descripcion.toUpperCase(),
        raw: te,
      })); break;
    case "localidades":
      lista = localidadesOptions; break;
    case "provincias":
      lista = provinciasOptions; break;
    case "tipoFurgones": lista = typeFurgonesOptions(); break;
    default: lista = [];
  }

  return lista;
};

export const formatearFechaInput = (valor) => {
  if (!valor) return "";

  let fecha;

  // Timestamp Firestore
  if (typeof valor?.toDate === "function") {
    fecha = valor.toDate();
  }
  // Objeto serializado de Firestore
  else if (valor.seconds !== undefined) {
    fecha = new Date(valor.seconds * 1000);
  }
  // Compatibilidad con _seconds
  else if (valor._seconds !== undefined) {
    fecha = new Date(valor._seconds * 1000);
  }
  // String
  else if (typeof valor === "string") {
    fecha = new Date(valor);
  }
  // Date
  else if (valor instanceof Date) {
    fecha = valor;
  }
  else {
    return "";
  }

  if (isNaN(fecha.getTime())) return "";

  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const buscarCampo = (coleccion, index, campo) => {
  if (!Array.isArray(coleccion) || index === undefined || !campo) return "";

  const valor = coleccion.find((item) => String(item.id) === String(index));

  return valor?.[campo] ?? "";
}

export const idCorrelativo = (listado) => {
  if (!Array.isArray(listado)) return "01";

  const ids = listado.map((item) => Number(item?.id)).filter((id) => !isNaN(id));

  const maxId = ids.length > 0 ? Math.max(...ids) : 0;
  const codigo = maxId + 1;
  return (codigo) < 10 ? `0${codigo}` : String(codigo);
}

export const verificarCamposObligatorios = (campos, formData) => {
  // verificación para forms
  const cantObligatorios = campos.filter((cp) => cp.important);
  const cantCompletados = campos.filter(
    (cp) =>
      cp.important &&
      formData[cp.key] !== null &&
      formData[cp.key] !== undefined &&
      formData[cp.key].toString().trim() !== "",
  );

  if (cantObligatorios.length !== cantCompletados.length) {
    Swal.fire({
      title: "Faltan datos",
      text: "Complete los campos obligatorios.",
      icon: "question",
      confirmButtonText: "Entendido",
      confirmButtonColor: "#4161bd",
    });

    return false;
  }

  return true;
}

export const estandarizarCampo = (campo) => {
  let valor;

  switch (campo) {
    case "number":
      valor = valor === "" ? null : Number(valor);
      break;

    case "text":
      valor = valor === "" ? null : String(valor).toUpperCase();
      break;

    case "date":
      valor = valor ? formatearCampoFirestore(valor) : null;
      break;

    case "boolean":
      valor = Boolean(valor);
      break;

    default:
      valor = valor === "" ? null : valor;
      break;
  }

  return valor;
}

export const formatearMonto = (valor) => {
  const numero = parseFloat(valor);
  if (isNaN(numero)) return valor;

  return numero.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

}

/*
export const generarCodigoStock = async (tipo, proveedor) => {
  const { stock } = useData();
  if (!tipo || !proveedor) return null;
  
  // 1 -------------------------------------- DEFINIR TIPO | EJ: "AC"
  const stockTypes = stockTypeOptions();
  const codTipo = Object.entries(stockTypes).find(
    ([_, value]) =>
      value.tipo.toLowerCase() === tipo.toLowerCase()
  )?.[0]; 
  // 2 -------------------------------------- DEFINIR CODIGO PROVEEDOR | EJ: "07"
  const codProv = String(proveedor).padStart(2,"0");
  const prefijo = `${codTipo}${codProv}` // PREFIJO EJ: "AC07"
  
  // 3 -------------------------------------- DEFINIR ORDEN | EJ: "0012"
  
  const codigos = stock.map(st => st.id).filter(id => id.slice(0,4) === prefijo);
  
  let ultimo = 0;
  
  if(codigos.length > 0) {
    ultimo = Math.max(...codigos.map(codigo => Number(codigo.slice(-4))));
  };
  
  const correlativo = String(ultimo + 1).padStart(4, "0");
  
  // 4 -------------------------------------- CODIGO FINAL | EJ: "AC070012"
  
  const codigo = `${prefijo}${correlativo}`;
  
  return codigo;
};
*/
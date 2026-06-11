/*
let localidadSalidaLlegada = {
  localidadOrigen,
  fechaCarga,
  horaCarga,

  localidadDestino,
  fechaDescarga,
  horaDescarga,
};

let cliente = {
  nombre,
  contenidoFurgon,
  observaciones
};

let anticipo = {
  fecha,
  numero,
  importe
};

let ordenDeCruce = {
  fecha,
  numero
};


let carga = {
  numeroViaje: "",
  fechaSalida: "",
  chofer: "",
  tractor: "",

  furgones: [
    {
      furgon:""
    },
    {
      furgon:""
    }
  ],

  recorridos: [
    {
      localidadOrigen: "",
      fechaCarga: "",
      horaCarga: "",

      localidadDestino: "",
      fechaDescarga: "",
      horaDescarga: ""
    },
    {
      localidadOrigen: "",
      fechaCarga: "",
      horaCarga: "",

      localidadDestino: "",
      fechaDescarga: "",
      horaDescarga: ""
    },
    {
      localidadOrigen: "",
      fechaCarga: "",
      horaCarga: "",

      localidadDestino: "",
      fechaDescarga: "",
      horaDescarga: ""
    },
    {
      localidadOrigen: "",
      fechaCarga: "",
      horaCarga: "",

      localidadDestino: "",
      fechaDescarga: "",
      horaDescarga: ""
    }
  ],

  clientes: [
    {
      nombre: "",
      contenidoFurgon: "",
      observaciones: ""
    },
    {
      nombre: "",
      contenidoFurgon: "",
      observaciones: ""
    },
    {
      nombre: "",
      contenidoFurgon: "",
      observaciones: ""
    },
    {
      nombre: "",
      contenidoFurgon: "",
      observaciones: ""
    }
  ],

  anticipos: [
    {
      fecha: "",
      numero: "",
      importe: ""
    },
    {
      fecha: "",
      numero: "",
      importe: ""
    },
    {
      fecha: "",
      numero: "",
      importe: ""
    },
    {
      fecha: "",
      numero: "",
      importe: ""
    },
    {
      fecha: "",
      numero: "",
      importe: ""
    }
  ],

  ordenesDeCruce: [
    {
      fecha: "",
      numero: ""
    },
    {
      fecha: "",
      numero: ""
    },
    {
      fecha: "",
      numero: ""
    },
    {
      fecha: "",
      numero: ""
    }
  ]
};
*/

import { elementos } from "../components/formularios/data/FormContent";
import provincias from "./data/provincias.json";

const normalizarDatosPdf = (viaje) => {
  // 1. Asegurar furgones (Mínimo 2 posiciones vacías)
  const furgones = Array.isArray(viaje.furgonCompleto) ? viaje.furgonCompleto : [viaje.furgonCompleto];
  const furgonFinal = [furgones[0] || "", furgones[1] || ""];


  const fechaHora = new Date();

  // 2. Normalizar Tramos -> Recorridos (Obligatorio 4 posiciones)
  const recorridos = Array.from({ length: 4 }, (_, i) => {
    const tramo = viaje.tramos && viaje.tramos[i] ? viaje.tramos[i] : null;

    if (tramo !== null) {
      
      const provinciaOrigen = provincias.find(
        (loc) => String(loc.key) === String(tramo?.lugarSalida),
      );
      const provinciaDestino = provincias.find(
        (loc) => String(loc.key) === String(tramo?.lugarLlegada),
      );

      debugger;

      return {
        localidadOrigen: provinciaOrigen || {},

        fechaCarga: fechaHora.toLocaleDateString("es-ES"),
        horaCarga: fechaHora.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),

        localidadDestino: provinciaDestino || {},
        fechaDescarga: "",
        horaDescarga: "",
      };
    }
  });

  // 3. Normalizar Clientes (Obligatorio 4 posiciones)
  const clientesOriginales = Array.isArray(viaje.cliente)
    ? viaje.cliente
    : [viaje.cliente];

  const clientes = Array.from({ length: 4 }, (_, i) => ({
    nombre: clientesOriginales[i] || "",
    contenidoFurgon: "",
    observaciones: "",
  }));

  // 4. Normalizar Anticipos (Obligatorio 5 posiciones)
  const anticipos = Array.from({ length: 5 }, (_, i) => {
    // Si hay un adelanto cargado, lo ponemos en la primera posición
    if (i === 0 && viaje.adelanto > 0) {
      return {
        fecha: fechaHora.toLocaleDateString("es-ES"),
        numero: viaje.id,
        importe: `$${viaje.adelanto}`,
      };
    }
    return { fecha: "", numero: "", importe: "" };
  });

  // 5. Normalizar Ordenes de Cruce (Obligatorio 4 posiciones)
  const ordenesDeCruce = Array.from({ length: 4 }, (_, i) => {
    // Si hay una orden de cruce cargada, la ponemos en la primera posición
    if (i === 0 && viaje.ordenesDeCruce > 0) {
      return {
        fecha: fechaHora.toLocaleDateString("es-ES"),
        numero: viaje.id,
      };
    }
    return { fecha: "", numero: "" };
  });

  debugger;

  // Retornamos el objeto con el nombre de variables exacto que lee el PDF
  let aux = viaje.personaCompleta.split(' ');
  let dni = "fallo >:(";
  let nombre = "";
  for (let x = 0; x < aux.length; x++) {
    const element = aux[x];
    if (x === (aux.length-1)) {
      dni = element;
    } else {
      nombre += element + " ";
    }
  }

  return {
    numeroViaje: viaje.id || "",
    fechaSalida: fechaHora.toLocaleDateString("es-ES"), // Podrías formatear viaje.fecha aquí
    chofer: [nombre, dni],
    tractor: viaje.tractorCompleto || "",
    furgon: furgonFinal,
    recorridos,
    clientes,
    anticipos,
    ordenesDeCruce,
  };
};

export const generarDocumentos = async (tipo, datos, urlPlantilla) => {
  let resultado = false;

  switch (tipo) {
    case "pdf":
      resultado = await generarPDFHojaRuta(datos, urlPlantilla);

      break;
    case "excel":
      break;
    case "word":
      break;

    default:
      break;
  }
  return resultado;
};

const generarPDFHojaRuta = async (datos, urlPlantilla) => {
  if (datos) {
    const carga = normalizarDatosPdf(datos);

    const { jsPDF } = window.jspdf;

    //210mm x 297mm

    debugger;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const img = new Image();
    img.src = urlPlantilla;

    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (err) =>
        reject(new Error("Error al cargar la plantilla: " + err));
    });

    doc.addImage(img, "PNG", 0, 0, 210, 297);

    doc.setFontSize(10);
    doc.setFont("Helvetica", "bold");

    doc.text(`${carga.numeroViaje}`, 170, 29.5);
    doc.text(`${carga.fechaSalida}`, 170, 35.7);
    doc.text(`${carga.chofer[0]}`, 15, 55.5);
    doc.text(`${carga.chofer[1]}`, 15, 61);
    doc.text(`${carga.tractor}`, 85, 55.5); 
    if(carga.furgon[0] !== undefined && carga.furgon[0] !== null);
      doc.text(`${carga.furgon[0]}`, 150.5, 52.7);
    if(carga.furgon[1] !== undefined && carga.furgon[1] !== null);
      doc.text(`${carga.furgon[1]}`, 150.5, 61);


    doc.text(`${carga.recorridos[0].localidadOrigen.nombre}`, 15, 85.5);
    doc.text(`${carga.recorridos[0].fechaCarga}`, 61.3, 85.5);
    doc.text(`${carga.recorridos[0].horaCarga}`, 83, 85.5);

    doc.text(`${carga.recorridos[0].localidadDestino.nombre}`, 100, 85.5);
    doc.text(`${carga.recorridos[0].fechaDescarga}`, 168.7, 85.5);
    doc.text(`${carga.recorridos[0].horaDescarga}`, 190, 85.5);

    if(carga.recorridos[1] !== undefined){
      doc.text(`${carga.recorridos[1].localidadOrigen.nombre}`, 15, 94.3);
      doc.text(`${carga.recorridos[1].fechaCarga}`, 61.3, 94.3);
      doc.text(`${carga.recorridos[1].horaCarga}`, 83, 94.3);
      
      doc.text(`${carga.recorridos[1].localidadDestino.nombre}`, 100, 94.3);
      doc.text(`${carga.recorridos[1].fechaDescarga}`, 168.7, 94.3);
      doc.text(`${carga.recorridos[1].horaDescarga}`, 190, 94.3);
    }

    if(carga.recorridos[2] !== undefined){
      doc.text(`${carga.recorridos[2].localidadOrigen.nombre}`, 15, 101.5);
      doc.text(`${carga.recorridos[2].fechaCarga}`, 61.3, 101.5);
      doc.text(`${carga.recorridos[2].horaCarga}`, 83, 101.5); 
      
      doc.text(`${carga.recorridos[2].localidadDestino.nombre}`, 100, 101.5);
      doc.text(`${carga.recorridos[2].fechaDescarga}`, 168.7, 101.5);
      doc.text(`${carga.recorridos[2].horaDescarga}`, 190, 101.5);
    }

    if(carga.recorridos[3] !== undefined){ 
      doc.text(`${carga.recorridos[3].localidadOrigen.nombre}`, 15, 109.3);
      doc.text(`${carga.recorridos[3].fechaCarga}`, 61.3, 109.3);
      doc.text(`${carga.recorridos[3].horaCarga}`, 83, 109.3);
      
      doc.text(`${carga.recorridos[3].localidadDestino.nombre}`, 100, 109.3);
      doc.text(`${carga.recorridos[3].fechaDescarga}`, 168.7, 109.3);
      doc.text(`${carga.recorridos[3].horaDescarga}`, 190, 109.3);
    }

    doc.text(`${carga.clientes[0].nombre}`, 40, 120.7);
    doc.text(`${carga.clientes[0].contenidoFurgon}`, 95, 120.7);
    doc.text(`${carga.clientes[0].observaciones}`, 40, 130.2);

    doc.text(`${carga.clientes[1].nombre}`, 40, 142);
    doc.text(`${carga.clientes[1].contenidoFurgon}`, 95, 142);
    doc.text(`${carga.clientes[1].observaciones}`, 40, 150.6);

    doc.text(`${carga.clientes[2].nombre}`, 40, 162);
    doc.text(`${carga.clientes[2].contenidoFurgon}`, 95, 162);
    doc.text(`${carga.clientes[2].observaciones}`, 40, 170.8);

    doc.text(`${carga.clientes[3].nombre}`, 40, 184);
    doc.text(`${carga.clientes[3].contenidoFurgon}`, 95, 184);
    doc.text(`${carga.clientes[3].observaciones}`, 40, 193);

    doc.setFontSize(8);
    doc.text(`${carga.anticipos[0].fecha}`, 15, 227);
    doc.setFontSize(10);
    doc.text(`${carga.anticipos[0].numero}`, 35, 227);
    doc.text(`${carga.anticipos[0].importe}`, 63, 227);

    doc.setFontSize(8);
    doc.text(`${carga.anticipos[1].fecha}`, 15, 236.9);
    doc.setFontSize(10);
    doc.text(`${carga.anticipos[1].numero}`, 35, 236.9);
    doc.text(`${carga.anticipos[1].importe}`, 63, 236.9);

    doc.setFontSize(8);
    doc.text(`${carga.anticipos[2].fecha}`, 15, 246);
    doc.setFontSize(10);
    doc.text(`${carga.anticipos[2].numero}`, 35, 246);
    doc.text(`${carga.anticipos[2].importe}`, 63, 246);

    doc.setFontSize(8);
    doc.text(`${carga.anticipos[3].fecha}`, 15, 255);
    doc.setFontSize(10);
    doc.text(`${carga.anticipos[3].numero}`, 35, 255);
    doc.text(`${carga.anticipos[3].importe}`, 63, 255);

    doc.setFontSize(8);
    doc.text(`${carga.anticipos[4].fecha}`, 15, 264);
    doc.setFontSize(10);
    doc.text(`${carga.anticipos[4].numero}`, 35, 264);
    doc.text(`${carga.anticipos[4].importe}`, 63, 264);

    doc.text(`${carga.ordenesDeCruce[0].fecha}`, 135, 227);
    doc.text(`${carga.ordenesDeCruce[0].numero}`, 170, 227);

    doc.text(`${carga.ordenesDeCruce[1].fecha}`, 135, 236.9);
    doc.text(`${carga.ordenesDeCruce[1].numero}`, 170, 236.9);

    doc.text(`${carga.ordenesDeCruce[2].fecha}`, 135, 246);
    doc.text(`${carga.ordenesDeCruce[2].numero}`, 170, 246);

    doc.text(`${carga.ordenesDeCruce[3].fecha}`, 135, 255);
    doc.text(`${carga.ordenesDeCruce[3].numero}`, 170, 255);

    doc.save(`Hoja de ruta ${carga.chofer} ${carga.fechaSalida}.pdf`);

    return true;
  }

  return false;
};

export const generarPDFCruceBarcaza = async (carga, urlPlantilla) => {};

export const generarPDFAdelanto = async (carga, urlPlantilla) => {};

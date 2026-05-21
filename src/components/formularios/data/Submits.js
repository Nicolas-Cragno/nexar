//------------------------------------------------------ externos
import Swal from "sweetalert2";
//------------------------------------------------------ funciones
import {
    verificarCamposObligatorios,
    formatearCampoParaCarga,
    formatearCampoFirestore
} from "../../../functions/dataFunctions";
import { submit, update, statusOptions } from "../../../functions/abmFunctions";


export const submitTractor = async (formData, campos, loading, onGuardar, onClose, modoEdicion = false, idElemento = null) => {
    const verificacion = verificarCamposObligatorios(campos, formData);
    if (!verificacion) return;

    loading(true); // ahora si empieza a cargar ...

    let campoId;

    const elementoAGuardar = campos.reduce((acc, cp) => {
        if (cp.use !== "database") return acc; // solo se guardan los campos que tengan el "use" = "database" en elementos["tractores"]
        if (cp.isId) campoId = formData[cp.key];

        // let valor = formData[cp.key];
        let valor = formatearCampoParaCarga(formData[cp.key], cp.dato);

        acc[cp.key] = valor;
        return acc;
    }, {});

    try {
        if (modoEdicion) {
            const result = await confirmDataSwal("Modificación de Tractor", elementoAGuardar);

            if (!result.isConfirmed) {
                loading(false);
                return;
            }

            const modificacion = await update(idElemento, "tractores", elementoAGuardar, onGuardar);

            statusOptions(modificacion);
        } else {
            const result = await confirmDataSwal("Nuevo Tractor", elementoAGuardar);

            if (!result.isConfirmed) {
                loading(false);
                return;
            }

            // avanzar con la carga
            const carga = await submit("tractores", { id: campoId, ...elementoAGuardar, estado: true }, onGuardar);
            statusOptions(carga);
        }
        onClose();
    } catch (error) {
        console.error("[Error] al intentar guardar", error);

        Swal.fire({
            title: "Error",
            text: "No hemos podido procesar la solicitud.",
            icon: "error",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#4161bd",
        });
    } finally {
        loading(false);
    }
}
export const submitFurgon = async (formData, campos, loading, onGuardar, onClose, modoEdicion = false, idElemento = null) => {
    const verificacion = verificarCamposObligatorios(campos, formData);
    if (!verificacion) return;

    loading(true); // ahora si empieza a cargar ...

    let campoId;

    const elementoAGuardar = campos.reduce((acc, cp) => {
        if (cp.use !== "database") return acc; // solo se guardan los campos que tengan el "use" = "database" en elementos["tractores"]
        if (cp.isId) campoId = formData[cp.key];

        // let valor = formData[cp.key];
        let valor = formatearCampoParaCarga(formData[cp.key], cp.dato);

        acc[cp.key] = valor;
        return acc;
    }, {});

    try {
        if (modoEdicion) {
            const result = await confirmDataSwal("Modificación de Furgón", elementoAGuardar);

            if (!result.isConfirmed) {
                loading(false);
                return;
            }

            const modificacion = await update(idElemento, "furgones", elementoAGuardar, onGuardar);

            statusOptions(modificacion);
        } else {
            const result = await confirmDataSwal("Nuevo Furgón", elementoAGuardar);

            if (!result.isConfirmed) {
                loading(false);
                return;
            }

            // avanzar con la carga
            const carga = await submit("furgones", { id: campoId, ...elementoAGuardar, estado: true }, onGuardar);
            statusOptions(carga);
        }
        onClose();
    } catch (error) {
        console.error("[Error] al intentar guardar", error);

        Swal.fire({
            title: "Error",
            text: "No hemos podido procesar la solicitud.",
            icon: "error",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#4161bd",
        });
    } finally {
        loading(false);
    }
}
export const submitPersona = async (formData, campos, loading, onGuardar, onClose, modoEdicion = false, idElemento = null) => {
    const verificacion = verificarCamposObligatorios(campos, formData);
    if (!verificacion) return;

    loading(true); // ahora si empieza a cargar ...

    let campoId;

    const elementoAGuardar = campos.reduce((acc, cp) => {
        if (cp.use !== "database") return acc; // solo se guardan los campos que tengan el "use" = "database" en elementos["tractores"]
        if (cp.isId) campoId = formData[cp.key];

        // let valor = formData[cp.key];
        let valor = formatearCampoParaCarga(formData[cp.key], cp.dato);

        acc[cp.key] = valor;
        return acc;
    }, {});

    // guardar elemento
    try {
        if (modoEdicion) {
            // preguntar al usuario si quiere confirmar
            const result = await confirmDataSwal("Edición de Persona", elementoAGuardar);

            if (!result.isConfirmed) {
                loading(false);
                return;
            }
            // avanzar a modificar
            const modificacion = await update(idElemento, "personas", elementoAGuardar, onGuardar);

            statusOptions(modificacion);
        } else {
            // preguntar al usuario si quiere confirmar
            const result = await confirmDataSwal("Ingreso de Persona", elementoAGuardar);

            if (!result.isConfirmed) {
                loading(false);
                return;
            }

            // avanzar con la carga
            const carga = await submit("personas", { id: campoId, ...elementoAGuardar, estado: true }, onGuardar);
            statusOptions(carga);

        }
        onClose();
    } catch (error) {
        console.error("[Error] al intentar guardar", error);

        Swal.fire({
            title: "Error",
            text: "No hemos podido procesar la solicitud.",
            icon: "error",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#4161bd",
        });
    } finally {
        loading(false);
    }
}

// swal/ficha que muestra lo que se está por cargar

const confirmDataSwal = async (title, data) => {
    const htmlCampos = Object.entries(data)
        .map(
            ([key, value]) => `
        <div style="
          display:flex;
          justify-content:space-between;
          padding:8px 0;
          border-bottom:1px solid #eee;
        ">
          <strong>${key.toUpperCase()}</strong>
          <span>
            ${formatearCampoFirestore(value)}
          </span>
        </div>
        `
        )
        .join("");

    return await Swal.fire({
        title,
        html: `
      <div style="
        text-align:left;
        max-height:350px;
        overflow:auto;
      ">
        ${htmlCampos}
      </div>
    `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#4161bd",
    });
};
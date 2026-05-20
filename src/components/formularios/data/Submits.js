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

        /*
            await updateTractor(idElemento, {
                ...elementoAGuardar,
                ultimaModificacion: formatearCampoFirestore(new Date()),
            });
        */
        try {
        if (modoEdicion) {
            // crear uno nuevo

            Swal.fire(
            "Actualizado",
            `Elemento ${idElemento} de /tractores actualizado correctamente.`,
            "success",
            );
        } else {
            const result = await Swal.fire({
            title: "Confirmar carga",
            html: `
            <pre style="text-align:left; max-height:300px; overflow:auto;">
            ${JSON.stringify({ id: campoId, ...elementoAGuardar }, null, 2)}
                </pre>
    `,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#4161bd",
            });

            if (!result.isConfirmed) {
            loading(false);
            return;
            }
            /*
            await createTractor({
                id: campoId,
                ...elementoAGuardar,
            });
            
            */
            Swal.fire(
            "Carga correcta",
            `Elemento ${elementoAGuardar.id} de /tractores creado correctamente.`,
            "success",
            );

            if (onGuardar) await onGuardar();
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

        // guardar elemento
        try {
        if (modoEdicion) {
            /*
            await updateFurgon(idElemento, {
                ...elementoAGuardar,
                ultimaModificacion: formatearCampoFirestore(new Date()),
            });
            */

            Swal.fire(
            "Actualizado",
            `Elemento ${idElemento} de /furgones actualizado correctamente.`,
            "success",
            );
        } else {
            const result = await Swal.fire({
            title: "Confirmar carga",
            html: `
            <pre style="text-align:left; max-height:300px; overflow:auto;">
            ${JSON.stringify({ id: campoId, ...elementoAGuardar }, null, 2)}
                </pre>
    `,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#4161bd",
            });

            if (!result.isConfirmed) {
            loading(false);
            return;
            }
            /*
            await createFurgon({
                id: campoId,
                ...elementoAGuardar,
            });
            */

            Swal.fire(
            "Carga correcta",
            `Elemento ${elementoAGuardar.id} de /furgones creado correctamente.`,
            "success",
            );

            if (onGuardar) await onGuardar();
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
            const result = await confirmDataSwal("Confirmar carga", elementoAGuardar);

            if (!result.isConfirmed) {
                loading(false);
                return;
            }
            // avanzar a modificar
            const modificacion = await update(idElemento, "personas", formData, onGuardar);
            
            statusOptions(modificacion);
        } else {
            // preguntar al usuario si quiere confirmar
            const result = await confirmDataSwal("Confirmar carga", elementoAGuardar);

            if (!result.isConfirmed) {
                loading(false);
                return;
            }
            
            // avanzar con la carga
            const carga = await submit("personas", {id: campoId, ...elementoAGuardar}, onGuardar);
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
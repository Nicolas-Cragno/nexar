import Swal from "sweetalert2";

export const confirmLogout = async (logout) => {
  const result = await Swal.fire({
    title: "Cerrar sesión",
    text: "¿Está seguro de que desea cerrar sesión?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, cerrar sesión",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#4161bd",
  });

  if (result.isConfirmed) {
    await logout();
  }
};

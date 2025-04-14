document.getElementById("formCifrado").addEventListener("submit", async function (e) {
    e.preventDefault();

    const mensaje = document.getElementById("mensaje").value.trim();
    const clave = document.getElementById("clave").value.trim();

    // Expresión regular actualizada para permitir letras con acento y signos comunes
    const caracteresValidos = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s.,!¡¿?()":;]+$/;

    // Validaciones
    if (!mensaje || !clave) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    if (clave.length < 4) {
        alert("La clave debe tener al menos 4 caracteres.");
        return;
    }

    if (!caracteresValidos.test(mensaje) || !caracteresValidos.test(clave)) {
        alert("Debes de ingresar caracteres válidos (letras, números y signos básicos).");
        return;
    }

    try {
        const response = await fetch('/cifrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mensaje, clave })
        });

        if (!response.ok) {
            const data = await response.json();
            alert(data.error || "Error al cifrar el mensaje.");
            return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "mensaje_cifrado.txt";
        a.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error(err);
        alert("Ocurrió un error inesperado.");
    }
});

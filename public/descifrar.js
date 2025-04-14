document.getElementById("formDescifrado").addEventListener("submit", async function (e) {
    e.preventDefault();

    const archivo = document.getElementById("archivo").files[0];
    const clave = document.getElementById("claveDescifrar").value.trim();
    const resultado = document.getElementById("resultado");

    const caracteresValidos = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s.,!¡¿?()":;]+$/;
    const extensionesValidas = ['.txt', '.enc'];
    const maxSizeMB = 5;

    if (!archivo) {
        alert("Por favor, selecciona un archivo cifrado.");
        return;
    }

    // Validar extensión
    const extension = archivo.name.slice(archivo.name.lastIndexOf('.')).toLowerCase();
    if (!extensionesValidas.includes(extension)) {
        alert("Solo se permiten archivos .txt o .enc.");
        return;
    }

    // Validar tamaño
    const sizeMB = archivo.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
        alert("El archivo excede el tamaño máximo de 5 MB.");
        return;
    }

    if (!clave) {
        alert("Por favor, ingresa una clave.");
        return;
    }

    if (clave.length < 4) {
        alert("La clave debe tener al menos 4 caracteres.");
        return;
    }

    if (!caracteresValidos.test(clave)) {
        alert("Debes de ingresar caracteres válidos (letras, números y signos comunes).");
        return;
    }

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("clave", clave);

    try {
        const response = await fetch('/descifrar', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const data = await response.json();
            alert(data.error || "No se pudo descifrar el archivo.");
            return;
        }

        const textoDescifrado = await response.text();
        resultado.value = textoDescifrado;
    } catch (err) {
        console.error(err);
        alert("Ocurrió un error al descifrar el archivo.");
    }
});

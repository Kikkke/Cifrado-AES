const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path'); 
const crypto = require('crypto');
const multer = require('multer');
const upload = multer();

const app = express();
const port = 3000;

// Configuración de sesión
app.use(session({
    secret: "clave_secreta",
    resave: false,
    saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); 


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/cifrar', (req, res) => {
    const { mensaje, clave } = req.body;

    if (!mensaje || !clave || clave.length < 4) {
        return res.status(400).json({ error: 'Mensaje o clave inválidos.' });
    }

    try {
        const algoritmo = 'aes-256-cbc';
        const iv = crypto.randomBytes(16);
        const key = crypto.scryptSync(clave, 'salto_unico', 32);
        const cipher = crypto.createCipheriv(algoritmo, key, iv);
        let resultado = cipher.update(mensaje, 'utf8', 'hex');
        resultado += cipher.final('hex');

        const contenido = `${iv.toString('hex')}:${resultado}`;
        res.set({
            'Content-Disposition': 'attachment; filename="mensaje_cifrado.txt"',
            'Content-Type': 'text/plain'
        });
        res.send(contenido);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cifrar el mensaje.' });
    }
});


app.post('/descifrar', upload.single('archivo'), (req, res) => {
    const clave = req.body.clave;
    const archivoBuffer = req.file?.buffer;

    if (!clave || clave.length < 4 || !archivoBuffer) {
        return res.status(400).json({ error: 'Clave o archivo inválido.' });
    }

    try {
        const contenido = archivoBuffer.toString();
        const partes = contenido.split(':');

        if (partes.length !== 2) {
            return res.status(400).json({ error: 'Formato de archivo inválido.' });
        }

        const ivHex = partes[0];
        const contenidoCifrado = partes[1];

        const algoritmo = 'aes-256-cbc';
        const key = crypto.scryptSync(clave, 'salto_unico', 32);
        const iv = Buffer.from(ivHex, 'hex');

        const decipher = crypto.createDecipheriv(algoritmo, key, iv);
        let resultado = decipher.update(contenidoCifrado, 'hex', 'utf8');
        resultado += decipher.final('utf8');

        res.send(resultado);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al descifrar. Verifica que la clave y el archivo sean correctos.' });
    }
});



// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
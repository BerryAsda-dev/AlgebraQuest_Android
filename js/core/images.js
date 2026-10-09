/*
==================================================================
    IMÁGENES: SELECCIÓN ALEATORIA DE PERSONAJE
==================================================================
    Lista de imágenes disponibles para mostrar como "personaje"
    en las vistas de introducción de nivel y selección de nivel.
    Cada vez que se llama a ImagenAleatoria.personaje(), se elige
    una al azar (sin repetir la anterior si es posible).
==================================================================
*/

const ImagenAleatoria = {

    opciones: [
        "img/personaje3.jpg",
        "img/imagen3.jpeg",
        "img/imagen4.jpeg",
        "img/imagen5.jpeg",
        "img/imagen6.jpeg",
        "img/imagen7.jpeg"
    ],

    ultima: null,

    personaje() {
        let opciones = this.opciones;

        if (opciones.length > 1 && this.ultima !== null) {
            opciones = opciones.filter(o => o !== this.ultima);
        }

        const elegida = opciones[Math.floor(Math.random() * opciones.length)];
        this.ultima = elegida;
        return elegida;
    }

};

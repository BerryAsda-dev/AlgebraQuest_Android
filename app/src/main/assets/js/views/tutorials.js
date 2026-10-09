/*
==================================================================
    VISTA: BIBLIOTECA DE TEMAS
==================================================================
*/

const TutorialsView = {

    nombre: "tutorials",

    render(container) {
        HUD.montar();
        HUD.mostrar();

        const temas = WORLDS.flatMap(mundo => mundo.niveles.map(nivel => `
            <article class="topic-entry" data-world="${mundo.id}" data-search="${(mundo.nombre + " " + nivel.titulo).toLowerCase()}">
                <div class="topic-entry-icon" style="--topic-color:${mundo.color}">${nivel.icono}</div>
                <div class="topic-entry-copy">
                    <span>${mundo.nombre}</span>
                    <h2>${nivel.titulo}</h2>
                    <p>${nivel.teoria.ejemplo}</p>
                </div>
                <button class="topic-open" data-world="${mundo.id}" data-level="${nivel.id}" type="button" aria-label="Abrir tutorial de ${nivel.titulo}">▶</button>
            </article>
        `)).join("");

        const filtros = WORLDS.map(mundo => `
            <button class="topic-filter" data-filter="${mundo.id}" type="button">${mundo.icono} ${mundo.nombre}</button>
        `).join("");

        container.innerHTML = `
            <main class="tutorial-library">
                <header class="tutorial-library-heading">
                    <div>
                        <p class="tutorial-kicker">ARCHIVO DE CONOCIMIENTO</p>
                        <h1>Temas para repasar</h1>
                        <p>Elige una lección, mira el repaso y prueba una pregunta.</p>
                    </div>
                    <button class="library-back" id="btnMenu" type="button">← Menú</button>
                </header>
                <div class="topic-controls">
                    <label class="topic-search-wrap">
                        <span aria-hidden="true">⌕</span>
                        <input id="topicSearch" type="search" placeholder="Buscar un tema" aria-label="Buscar tema">
                    </label>
                    <div class="topic-filters" role="group" aria-label="Filtrar por mundo">
                        <button class="topic-filter active" data-filter="todos" type="button">Todos</button>
                        ${filtros}
                    </div>
                </div>
                <section id="topicList" class="topic-list" aria-live="polite">
                    ${temas}
                </section>
                <p id="topicEmpty" class="topic-empty" hidden>No hay temas con ese nombre.</p>
            </main>
        `;

        let filtroActual = "todos";
        const input = container.querySelector("#topicSearch");
        const entradas = [...container.querySelectorAll(".topic-entry")];
        const filtrar = () => {
            const texto = input.value.trim().toLowerCase();
            let visibles = 0;

            entradas.forEach(entrada => {
                const coincideMundo = filtroActual === "todos" || entrada.dataset.world === filtroActual;
                const coincideTexto = entrada.dataset.search.includes(texto);
                entrada.hidden = !(coincideMundo && coincideTexto);
                if (!entrada.hidden) visibles++;
            });

            container.querySelector("#topicEmpty").hidden = visibles > 0;
        };

        container.querySelectorAll(".topic-filter").forEach(boton => {
            boton.addEventListener("click", () => {
                filtroActual = boton.dataset.filter;
                container.querySelectorAll(".topic-filter").forEach(filtro => {
                    const activo = filtro === boton;
                    filtro.classList.toggle("active", activo);
                    filtro.setAttribute("aria-pressed", String(activo));
                });
                filtrar();
            });
        });

        input.addEventListener("input", filtrar);
        container.querySelectorAll(".topic-open").forEach(boton => {
            boton.addEventListener("click", () => {
                Router.navegar(`/level/${boton.dataset.world}/${boton.dataset.level}/tutorial`);
            });
        });
        container.querySelector("#btnMenu").addEventListener("click", () => Router.navegar("/menu"));
    }

};
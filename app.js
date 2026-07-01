const API = "https://biblioteca-blt2.onrender.com/libros";
const API_CHAT   = "https://biblioteca-blt2.onrender.com/chat";
let allBooks = []; // Almacén en memoria local para búsquedas ultra rápidas

// 1. Obtener libros de la API (Maneja el mensaje de carga)
async function getBooks() {
  try {
    const tbody = document.getElementById("tbody");
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="loading-status">
          <i class="fas fa-spinner fa-spin"></i> Sincronizando con el servidor de Render...
        </td>
      </tr>
    `;

    const res = await fetch(API);
    allBooks = await res.json();
    
    renderBooks(allBooks); // Dibujamos los libros recibidos
    calculateStats(allBooks); // NUEVO: Calcula estadísticas de la lista global
  } catch (error) {
    console.error("Error al obtener libros:", error);
    document.getElementById("tbody").innerHTML = `
      <tr>
        <td colspan="5" class="loading-status" style="color: #e74c3c;">
          <i class="fas fa-exclamation-triangle"></i> Error al conectar con el servidor. Reintenta más tarde.
        </td>
      </tr>
    `;
  }
}

// 2. Renderizar (dibujar) las filas de libros en la tabla
function renderBooks(booksList) {
  const tbody = document.getElementById("tbody");
  tbody.innerHTML = "";

  if (booksList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="color: #a0aec0; padding: 20px;">No se encontraron libros registrados.</td>
      </tr>
    `;
    return;
  }

  booksList.forEach(book => {
    tbody.innerHTML += `
      <tr>
        <td><strong>${book.id}</strong></td>
        <td>${book.titulo}</td>
        <td>${book.autor}</td>
        <td><span style="background: #edf2f7; padding: 4px 8px; border-radius: 4px;">${book.anio}</span></td>
        <td>
          <button class="edit" onclick="startEdit(${book.id}, '${book.titulo}', '${book.autor}', ${book.anio})">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="delete" onclick="deleteBook(${book.id})">
            <i class="fas fa-trash-alt"></i> Eliminar
          </button>
        </td>
      </tr>
    `;
  });
}

// 3. Filtrar en tiempo real y actualizar estadísticas del filtro activo
function filterBooks() {
  const query = document.getElementById("buscador").value.toLowerCase().trim();
  
  const filtered = allBooks.filter(book => {
    return book.autor.toLowerCase().includes(query) || 
           book.titulo.toLowerCase().includes(query);
  });

  renderBooks(filtered);
  calculateStats(filtered); // Las estadísticas se recalculan en tiempo real según el filtro
}

// 4. NUEVO: Función matemática para calcular las estadísticas analíticas
function calculateStats(booksList) {
  const total = booksList.length;
  
  // Si no hay libros, reiniciamos los campos visuales
  if (total === 0) {
    document.getElementById("stat-total").innerText = "0";
    document.getElementById("stat-antiguo").innerText = "N/A";
    document.getElementById("stat-reciente").innerText = "N/A";
    document.getElementById("stat-autor").innerText = "N/A";
    return;
  }

  // A. Total de libros
  document.getElementById("stat-total").innerText = total;

  // B. Encontrar libro más antiguo y más reciente basándonos en el año
  let antiguo = booksList[0];
  let reciente = booksList[0];

  booksList.forEach(book => {
    if (Number(book.anio) < Number(antiguo.anio)) antiguo = book;
    if (Number(book.anio) > Number(reciente.anio)) reciente = book;
  });

  document.getElementById("stat-antiguo").innerText = `${antiguo.anio} (${antiguo.titulo})`;
  document.getElementById("stat-reciente").innerText = `${reciente.anio} (${reciente.titulo})`;

  // C. Encontrar el autor que más se repite (Moda estadística)
  const autorCounts = {};
  let maxCount = 0;
  let topAutor = "";

  booksList.forEach(book => {
    const autor = book.autor.trim();
    if (autor) {
      autorCounts[autor] = (autorCounts[autor] || 0) + 1;
      if (autorCounts[autor] > maxCount) {
        maxCount = autorCounts[autor];
        topAutor = autor;
      }
    }
  });

  document.getElementById("stat-autor").innerText = topAutor ? `${topAutor} (${maxCount})` : "N/A";
}

// 5. Agregar un libro a la colección
async function addBook() {
  const titulo = document.getElementById("titulo").value.trim();
  const autor = document.getElementById("autor").value.trim();
  const anio = document.getElementById("anio").value.trim();

  if (!titulo || !autor || !anio) {
    alert("⚠️ Por favor, rellena todos los campos antes de agregar.");
    return;
  }

  await fetch(API, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ titulo, autor, anio })
  });

  clearInputs();
  getBooks();
}

function clearInputs() {
  document.getElementById("titulo").value = "";
  document.getElementById("autor").value = "";
  document.getElementById("anio").value = "";
}

// 6. Eliminar un libro
async function deleteBook(id) {
  if (confirm("¿Estás seguro de que deseas eliminar permanentemente este libro?")) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    getBooks();
  }
}

// 7. Cambiar fila al modo edición integrado
function startEdit(id, titulo, autor, anio) {
  const tbody = document.getElementById("tbody");

  tbody.innerHTML = `
    <tr style="background-color: #fef9e7;">
      <td><strong>${id}</strong></td>
      <td><input id="editTitulo" value="${titulo}" style="width:90%;"></td>
      <td><input id="editAutor" value="${autor}" style="width:90%;"></td>
      <td><input id="editAnio" type="number" value="${anio}" style="width:90%;"></td>
      <td>
        <button class="save" onclick="saveEdit(${id})">
          <i class="fas fa-save"></i> Guardar
        </button>
        <button class="delete" onclick="getBooks()">
          <i class="fas fa-times"></i> Cancelar
        </button>
      </td>
    </tr>
  `;
}

// 8. Guardar los cambios editados
async function saveEdit(id) {
  const titulo = document.getElementById("editTitulo").value.trim();
  const autor = document.getElementById("editAutor").value.trim();
  const anio = document.getElementById("editAnio").value.trim();

  if (!titulo || !autor || !anio) {
    alert("⚠️ Los campos no pueden estar vacíos.");
    return;
  }

  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ titulo, autor, anio })
  });

  getBooks();
}


// ==========================================
// 🤖 SECCIÓN DEL CHATBOT INTELIGENTE
// ==========================================

// Alternar visibilidad de la ventana de chat
function toggleChat() {
  const chatWindow = document.getElementById("chatWindow");
  if (chatWindow.style.display === "none" || chatWindow.style.display === "") {
    chatWindow.style.display = "flex";
  } else {
    chatWindow.style.display = "none";
  }
}

// Enviar mensaje al presionar Enter
function handleChatKey(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}


// Imprimir burbujas de texto en el historial del chat
function appendMessage(text, sender) {
  const chatMessages = document.getElementById("chatMessages");
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${sender}`;
  msgDiv.innerHTML = text;
  
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll al último mensaje
}

// Inteligencia y lógica de respuesta del Bot
// Procesar el mensaje enviado por el usuario
async function sendMessage() {
  const inputElement = document.getElementById("chatInput");
  const query = inputElement.value.trim();
  
  if (!query) return;

  // 1. Mostrar mensaje del usuario en pantalla
  appendMessage(query, "user");
  inputElement.value = ""; // Limpiar input

  // 2. Mostrar un mensaje temporal de que el bot está "escribiendo"
  appendMessage("<i class='fas fa-spinner fa-spin'></i> Pensando...", "bot-loading");

  // 3. Llamar al Backend para obtener la respuesta del LLM
  const response = await generateBotResponse(query);
  
  // Quitar el mensaje de carga y poner la respuesta real
  const loadingMsg = document.querySelector(".bot-loading");
  if (loadingMsg) loadingMsg.remove();

  appendMessage(response, "bot");
}

// NUEVA VERSIÓN: Conexión real con el Backend de IA
async function generateBotResponse(msg) {
  try {
    // NOTA: Cuando me pases tu Backend, definiremos exactamente esta ruta (ej: /chat o /bot)
    // Por ahora apuntamos a una ruta relativa en tu mismo servidor backend
    const URL_BACKEND_CHAT = "https://biblioteca-blt2.onrender.com/chat"; 

    const res = await fetch(URL_BACKEND_CHAT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pregunta: msg }) // Enviamos la pregunta al servidor
    });

    if (!res.ok) throw new Error("Error en la respuesta del servidor");

    const data = await res.json();
    return data.respuesta; // Retornamos la respuesta que nos dé el LLM

  } catch (error) {
    console.error("Error al conectar con el bot IA:", error);
    return "❌ Uy, tuve un problema al conectarme con mi cerebro de IA. Asegúrate de que el backend esté encendido.";
  }
}

// Conexión real con el Backend de IA utilizando la constante global
async function generateBackendBotResponse(msg) {
  try {
    const res = await fetch(API_CHAT, { // 👈 Ahora usa la constante global ordenada
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pregunta: msg })
    });

    if (!res.ok) throw new Error("Error en la respuesta del servidor");

    const data = await res.json();
    return data.respuesta;

  } catch (error) {
    console.error("Error al conectar con el bot IA:", error);
    return "❌ Uy, tuve un problema al conectarme con mi cerebro de IA. Asegúrate de que el backend esté encendido.";
  }
}
// Encendido inicial
getBooks();
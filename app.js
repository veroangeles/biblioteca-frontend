const API = "https://biblioteca-blt2.onrender.com/libros";
let allBooks = []; // Almacén en memoria local para búsquedas ultra rápidas

// 1. Obtener libros de la API (Maneja el mensaje de carga)
async function getBooks() {
  try {
    // Mostramos visualmente el spinner de carga antes de la petición
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
    updateCounter(allBooks.length); // Actualizamos el contador dinámico
  } catch (error) {
    console.error("Error al obtener libros:", error);
    document.getElementById("tbody").html = `
      <tr>
        <td colspan="5" class="loading-status" style="color: #e74c3c;">
          <i class="fas fa-exclamation-triangle"></i> Error al conectar con el servidor. Reintenta más tarde.
        </td>
      </tr>
    `;
  }
}

// 2. Renderizar (dibujar) las filas de libros en la tabla con iconos modernos
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

// 3. Filtrar en tiempo real y actualizar el contador simultáneamente
function filterBooks() {
  const query = document.getElementById("buscador").value.toLowerCase().trim();
  
  const filtered = allBooks.filter(book => {
    return book.autor.toLowerCase().includes(query) || 
           book.titulo.toLowerCase().includes(query);
  });

  renderBooks(filtered);
  updateCounter(filtered.length); // El contador baja si hay filtros activos
}

// 4. Actualizar el texto del contador dinámico
function updateCounter(total) {
  const contadorElemento = document.getElementById("contador");
  if (total === 1) {
    contadorElemento.innerHTML = `📚 Tienes <strong style="color: #667eea;">1 libro</strong> registrado en tu colección`;
  } else {
    contadorElemento.innerHTML = `📚 Tienes <strong style="color: #667eea;">${total} libros</strong> registrados en tu colección`;
  }
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

// 6. Eliminar un libro (Con confirmación nativa)
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

// Encendido inicial de la aplicación al cargar la página
getBooks();
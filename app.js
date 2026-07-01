const API = "https://biblioteca-blt2.onrender.com/libros";

async function getBooks() {
  const res = await fetch(API);
  const data = await res.json();

  const tbody = document.getElementById("tbody");
  tbody.innerHTML = "";

  data.forEach(book => {
    tbody.innerHTML += `
      <tr>
        <td>${book.id}</td>
        <td>${book.titulo}</td>
        <td>${book.autor}</td>
        <td>${book.anio}</td>
        <td>
          <button class="edit" onclick="startEdit(${book.id}, '${book.titulo}', '${book.autor}', ${book.anio})">Editar</button>
          <button class="delete" onclick="deleteBook(${book.id})">Eliminar</button>
        </td>
      </tr>
    `;
  });
}

async function addBook() {
  const titulo = document.getElementById("titulo").value;
  const autor = document.getElementById("autor").value;
  const anio = document.getElementById("anio").value;

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

async function deleteBook(id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });
  getBooks();
}

function startEdit(id, titulo, autor, anio) {
  const tbody = document.getElementById("tbody");

  tbody.innerHTML = `
    <tr>
      <td>${id}</td>
      <td><input id="editTitulo" value="${titulo}"></td>
      <td><input id="editAutor" value="${autor}"></td>
      <td><input id="editAnio" value="${anio}"></td>
      <td>
        <button class="save" onclick="saveEdit(${id})">Guardar</button>
      </td>
    </tr>
  `;
}

async function saveEdit(id) {
  const titulo = document.getElementById("editTitulo").value;
  const autor = document.getElementById("editAutor").value;
  const anio = document.getElementById("editAnio").value;

  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ titulo, autor, anio })
  });

  getBooks();
}

getBooks();
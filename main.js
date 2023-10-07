// Referencias de los elementos del formulario
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const birthdateInput = document.getElementById('birthdate');
const addButton = document.getElementById('add-btn');
const errorMessage = document.getElementById('error-message');
const confirmMessage = document.getElementById('confirm-message');
const contactsListSection = document.getElementById('contacts-list');

// función para validar datos con regex
function validateInput(value, regex, errorMessageElement, errorMessage) {
  if (!value.match(regex)) {
    errorMessageElement.textContent = errorMessage;
    errorMessageElement.style.display = 'block';
    return false;
  }
  return true;
}

// Evento para el botón "Agregar" del form de contacto
addButton.addEventListener('click', () => {
  const name = nameInput.value;
  const email = emailInput.value;
  const birthdate = birthdateInput.value;

  // Validación del nombre
  const nameRegex = /^[A-ZÁÉÍÓÚÜÑ][a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]{2,}( [A-ZÁÉÍÓÚÜÑ][a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]{1,}){0,5}$/;
  if (!validateInput(name, nameRegex, errorMessage, 'El nombre debe comenzar con mayúscula.')) {
    return;
  }

  // Validación del mail
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!validateInput(email, emailRegex, errorMessage, 'El email no tiene un formato válido.')) {
    return;
  }

  // Validación de la fecha de nacimiento
  const birthdateRegex = /^[\d\/-]{8,}$/;
  if (!validateInput(birthdate, birthdateRegex, errorMessage, 'La fecha de nacimiento debe tener el formato dd/mm/yyyy.')) {
    return;
  }

  // Datos del contacto a agregar
  const contactData = {
    name,
    email,
    birthdate,
  };


  // Función agregar contacto
  function addContactToUI(contact) {
    const contactElement = document.createElement('div');
    contactElement.classList.add('contacts');
    contactElement.innerHTML = `
      <article>
        <p class="category">Nombre:</p>
        <p>${contact.name}</p>
      </article>
      <article>
        <p class="category">Email:</p>
        <p>${contact.email}</p>
      </article>
      <article>
        <p class="category">Fecha de Nacimiento:</p>
        <p>${contact.birthdate}</p>
      </article>
      <button class="edit-btn" data-key="${contact.key}">Editar</button>
      <button class="delete-btn" data-key="${contact.key}">Eliminar</button>
    `;
    // Agregar evento click para el botón "Editar"
    const editButton = contactElement.querySelector('.edit-btn');
    editButton.addEventListener('click', () => {
      editContact(contact.key);
    });

    // Agregar evento click para el botón "Eliminar"
    const deleteButton = contactElement.querySelector('.delete-btn');
    deleteButton.addEventListener('click', () => {    
      deleteContact(contact.key);
    });      

    // Agregar el nuevo contacto a la lista de contactos en el DOM
    contactsListSection.appendChild(contactElement);
  }

  // Solicitud POST a Firebase con fetch
  fetch('https://lista-contactos-bc-d12-default-rtdb.firebaseio.com/contactos.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contactData),
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error('Error al agregar el contacto.');
    }
    return response.json();
  })
  .then(() => {
    // Msj que se agregó el contacto correctamente
    confirmMessage.textContent = 'Contacto agregado correctamente!';
    confirmMessage.style.display = 'block';
    errorMessage.style.display = 'none'; 
    // Limpiar los campos del formulario
    nameInput.value = '';
    emailInput.value = '';
    birthdateInput.value = '';      
    // Ocultar el mensaje de éxito desp de 3 segundos
    setTimeout(() => {
      confirmMessage.style.display = 'none';
    }, 3000); 
    // Agregar el nuevo contacto a la lista de contactos
    const newContact = {
      name,
      email,
      birthdate,
      key: 'nuevo' 
    };
    addContactToUI(newContact);

    showContacts();
  })
  .catch((error) => {
    // Error al agregar el contacto
    errorMessage.textContent = `Error al agregar el contacto: ${error.message}`;
    errorMessage.style.display = 'block';
    confirmMessage.style.display = 'none';
  }); 
});

// Función para mostrar la lista de contactos y agregarles botones de "Editar" y "Eliminar"
function showContacts() {
  fetch('https://lista-contactos-bc-d12-default-rtdb.firebaseio.com/contactos.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error('Error al obtener los contactos.');
    }
    return response.json();
  })
  .then((data) => {
    // Borra cualquier contenido previo en la sección de la lista de contactos
    contactsListSection.innerHTML = '';
    // Itera a través de los datos de los contactos y crea elementos HTML para cada contacto
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const contact = data[key];
        const contactElement = document.createElement('div');
        contactElement.classList.add('contacts');
        contactElement.innerHTML = `
          <article>
            <p class="category">Nombre:</p>
            <p>${contact.name}</p>
          </article>
          <article>
            <p class="category">Email:</p>
            <p>${contact.email}</p>
          </article>
          <article>
            <p class="category">Fecha de Nacimiento:</p>
            <p>${contact.birthdate}</p>
          </article>
          <button class="edit-btn" data-key="${key}">Editar</button>
          <button class="delete-btn" data-key="${key}">Eliminar</button>
          <div id="confirm-message-${key}" style="display: none;"></div>
        `;
        contactsListSection.appendChild(contactElement);

        // Agregar evento click para el botón "Editar"
        const editButton = contactElement.querySelector('.edit-btn');
        editButton.addEventListener('click', () => {
          // Llama a la función de edición y pasa la clave (key) del contacto
          const contactKey = editButton.getAttribute('data-key');
          editContact(contactKey);
          // Llama a la función para mostrar el mensaje de confirmación
          showEditConfirmationMessage(contactKey);
        });

        // Agregar evento click para el botón "Eliminar"
        const deleteButton = contactElement.querySelector('.delete-btn');
        deleteButton.addEventListener('click', () => {
          // Llama a la función de eliminación
          const contactKey = deleteButton.getAttribute('data-key');
          deleteContact(contactKey);
        });
      }
    }
  });
}
// Llama a la función para mostrar los contactos al cargar la página
showContacts();

// Función para mostrar el mensaje de confirmación al hacer clic en "Editar"
function showEditConfirmationMessage(key) {
  const confirmationMessage = document.getElementById(`confirm-message-${key}`);
  confirmationMessage.textContent = 'Editar en el formulario de arriba';
  confirmationMessage.style.display = 'block';
}
// Función para ocultar el mensaje de confirmación de edición
function hideEditConfirmationMessage(key) {
  const confirmationMessage = document.getElementById(`confirm-message-${key}`);
  confirmationMessage.style.display = 'none';
}

// Función para editar un contacto
function editContact(key) {        
  // Obtener el contacto existente de Firebase usando la clave (key)
  fetch(`https://lista-contactos-bc-d12-default-rtdb.firebaseio.com/contactos/${key}.json`)
  .then((response) => {
    if (!response.ok) {
      throw new Error('Error al obtener el contacto para editar.');
    }
    return response.json();
  })
  .then((contact) => {
    const editContainer = document.createElement('article');
    editContainer.classList.add('container');
    // Clonar el formulario de agregar contacto y modificarlo para la edición
    const editForm = document.getElementById('contact-form').cloneNode(true);
      editForm.id = 'edit-contact-form';
      editForm.querySelector('h1').textContent = 'Editar Contacto';
      editForm.querySelector('button').textContent = 'Modificar';
      editForm.querySelector('button').id = 'save-edit-btn';
      editForm.querySelector('#name').value = contact.name;
      editForm.querySelector('#email').value = contact.email;
      editForm.querySelector('#birthdate').value = contact.birthdate;
      
      // Agregar evento click para el botón "Modificar"
      editForm.querySelector('#save-edit-btn').addEventListener('click', () => {
        const editedName = editForm.querySelector('#name').value;
        const editedEmail = editForm.querySelector('#email').value;
        const editedBirthdate = editForm.querySelector('#birthdate').value;      

        // Obtener los elementos de mensaje de error y éxito en el formulario de edición
        const editErrorMessage = editForm.querySelector('#error-message');
        const editSuccessMessage = editForm.querySelector('#confirm-message');

        // Validación del nombre
        const nameRegex = /^[A-ZÁÉÍÓÚÜÑ][a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]{2,}( [A-ZÁÉÍÓÚÜÑ][a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]{1,}){0,5}$/;
        if (!validateInput(editedName, nameRegex, editErrorMessage, 'El nombre debe comenzar con mayúscula.')) {
          return;
        }

        // Validación del mail
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (!validateInput(editedEmail, emailRegex, editErrorMessage, 'El email no tiene un formato válido.')) {
          return;
        }

        // Validación de la fecha de nacimiento
        const birthdateRegex = /^[\d\/-]{8,}$/;
        if (!validateInput(editedBirthdate, birthdateRegex, editErrorMessage, 'La fecha de nacimiento debe tener el formato dd/mm/yyyy.')) {
          return;
        }

        // Mensaje de éxito en el formulario de edición
        editSuccessMessage.textContent = 'Modificado correctamente.';
        editSuccessMessage.style.display = 'block';   
        
        // Actualización de contacto
        const updatedContactData = {
          name: editedName,
          email: editedEmail,
          birthdate: editedBirthdate,
        };

        // Subir contacto actualizado a Firebase con fetch
        fetch(`https://lista-contactos-bc-d12-default-rtdb.firebaseio.com/contactos/${key}.json`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedContactData),
        })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Error al actualizar el contacto.');
          }
          // Ocultar el formulario de edición
          editContainer.style.display = 'none';
          editForm.style.display = 'none';
          
          // Actualizar la lista de contactos con los datos modificados
          showContacts();

        })
        .catch((error) => {
          console.error(`Error al actualizar el contacto: ${error.message}`);
        });
      });

      // Agregar el formulario de edición al DOM
      const editFormContainer = document.getElementById('edit-container');
      editFormContainer.innerHTML = '';
      editFormContainer.appendChild(editForm);
  })
  .catch((error) => {
    console.error(`Error al obtener el contacto para editar: ${error.message}`);
  });
}

// Función para eliminar un contacto
function deleteContact(key) {
  // Mostrar un msj de alerta con confirmación antes de eliminar
  const confirmDelete = window.confirm('¿Estás seguro que quieres eliminar este contacto?');

  if (confirmDelete) {
    // Si el usuario hizo clic en "Aceptar", realiza la eliminación
    fetch(`https://lista-contactos-bc-d12-default-rtdb.firebaseio.com/contactos/${key}.json`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al eliminar el contacto.');
        }
        // Vuelve a mostrar la lista de contactos después de eliminar el contacto
        showContacts();
      })
      .catch((error) => {
        console.error(`Error al eliminar el contacto: ${error.message}`);
      });
  }
  // Si el usuario hizo clic en "Cancelar", no hace nada
}
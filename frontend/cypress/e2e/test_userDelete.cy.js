let uniqueEmail;
let uniqueName;


//Flujo E2E: crear usuario y luego eliminarlo verificando que desaparece del listado.
//Reutiliza el patrón del test de creación existente y añade intercepts para robustez.

describe('E2E eliminación de usuario (estudiante) creado en el flujo', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8081');
    const timestamp = Date.now();
    uniqueName = `Estudiante Delete ${timestamp}`;
    uniqueEmail = `estudiante_delete_${timestamp}@example.com`;
  });

  it('Crea y elimina un estudiante y valida que se elimina del listado', () => {
    // Interceptar listado de usuarios para capturar ID luego
    cy.intercept('GET', '**/api/users*').as('getUsers');

    // Login como admin (patrón existente en test_studentCreate)
    cy.get('[data-testid="teacher-login-button"]').click();
    cy.get('[data-testid="teacher-email-input"]').type('admin@app.com');
    cy.get('[data-testid="teacher-password-input"]').type('Hola1234');
    cy.get('[data-testid="login-submit-button"]').click();

    // Abrir menú de creación y entrar a crear estudiante
    cy.get('[data-testid="creation-menu-button"]').click();
    cy.get('[data-testid="create-student-button"]').click();

    // Completar formulario de creación
    cy.get('[data-testid="name-input"]').type(uniqueName);
    cy.get('[data-testid="email-input"]').type(uniqueEmail);

    // Seleccionar pictogramas contraseña
    const password = ['Perro', 'Perro', 'Perro', 'Perro'];
    password.forEach(picto => {
      cy.get(`[data-testid="pictogram-${picto}"]`).scrollIntoView().should('be.visible').click();
    });

    // Seleccionar tutor (el primero disponible)
    cy.get('[data-testid^="tutor-card-"]').first().click();

    // Enviar formulario
    cy.get('[data-testid="submit-create-student"]').click();

    // Verificar que aparece el nuevo estudiante en la lista
    cy.get(`[data-testid="user-name-${uniqueName}"]`, { timeout: 15000 }).should('exist');

    // Esperar última carga de usuarios y obtener el ID del recién creado
    cy.wait('@getUsers');

    // Capturar ID del usuario recién creado desde la respuesta de la API
    let createdUserId;
    cy.get('@getUsers').then((interception) => {
      const body = interception.response?.body || [];
      const found = body.find(u => u.name === uniqueName && u.email === uniqueEmail);
      expect(found, 'Usuario creado debe existir en respuesta /api/users').to.exist;
      createdUserId = found.id; // API shape según fetchUsers -> id
      expect(createdUserId, 'ID del usuario creado').to.be.ok;
    });

    // Preparar intercept para la eliminación
    cy.intercept('DELETE', '**/api/users/*').as('deleteUser');

    // Aceptar confirmación automáticamente y verificar el mensaje
    cy.on('window:confirm', (msg) => {
      expect(msg).to.contain('¿Seguro');
      return true; // Confirmar
    });

    // Click en botón eliminar usando el testID añadido
    cy.then(() => {
      cy.get(`[data-testid="delete-user-${createdUserId}"]`).scrollIntoView().click();
    });

    // Esperar la petición DELETE y validar status
    cy.wait('@deleteUser').its('response.statusCode').should('eq', 200);

    // Esperar refetch de usuarios posterior a eliminación
    cy.wait('@getUsers');

    // Aserción final: el nombre ya no existe
    cy.get(`[data-testid="user-name-${uniqueName}"]`).should('not.exist');
  });
});

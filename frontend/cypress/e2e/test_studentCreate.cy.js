let uniqueEmail;

describe('E2E flujo completo de creación de estudiante', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8081'); 
    uniqueEmail = `juan_${Date.now()}@example.com`;
  });

  it('flujo completo: Admin --> Crear estudiante --> Completar datos --> Guardar', () => {

    // Paso 1️⃣: Ir a la sección de creación de estudiantes
    cy.get('[data-testid="teacher-login-button"]').click();

    // Paso 2️⃣: ingresar credenciales o saltar al menú principal (ajusta según tu UI)
    cy.get('[data-testid="teacher-email-input"]').type('admin@app.com');
    cy.get('[data-testid="teacher-password-input"]').type('Hola1234');
    cy.get('[data-testid="login-submit-button"]').click();

    // Paso 3️⃣: Navegar al listado o menú de estudiantes
    cy.get('[data-testid="creation-menu-button"]').click();

    // Paso 4️⃣: Entrar a la pantalla de creación
    cy.get('[data-testid="create-student-button"]').click();

    // Paso 5️⃣: Completar los campos del formulario
    cy.get('[data-testid="name-input"]').type('Juan Test');
    cy.get('[data-testid="email-input"]').type(uniqueEmail);

    // Paso 6️⃣: Seleccionar pictogramas de contraseña
    const password = ['Perro', 'Perro', 'Perro', 'Perro'];
    password.forEach((picto) => {
      cy.get(`[data-testid="pictogram-${picto}"]`)
        .scrollIntoView()
        .should('be.visible')
        .click();
    });

    // Paso 7️⃣: Seleccionar un tutor
    cy.get('[data-testid^="tutor-card-"]').first().click();

    // Paso 8️⃣: Enviar formulario
    cy.get('[data-testid="submit-create-student"]').click();

    // Paso 🔟: Verificar que vuelve al listado o muestra detalles del nuevo estudiante
    cy.get(`[data-testid="user-name-Juan Test"]`).should('exist');

  });
});

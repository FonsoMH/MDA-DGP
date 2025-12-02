// E2E: Login de estudiante (Leo Reader) y cambio de perfil
// Escenarios cubiertos:
// 1. Login correcto con Leo Reader (contraseña pictograma Pelota x4)
// 2. Manejo de error con contraseña incorrecta y posterior éxito
// 3. Cambio de perfil en mismo dispositivo (logout implícito vía BackButton en GameMenu)

function selectPictograms(sequence) {
  sequence.forEach((pic) => {
    cy.get(`[data-testid="pictogram-${pic}"]`)
      .scrollIntoView()
      .should('be.visible')
      .click();
  });
}

describe('E2E Login Estudiante', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8081');
  });

  it('Login correcto con Leo Reader usando Pelota x4', () => {
    cy.intercept('GET', '**/api/students').as('getStudents');
    cy.intercept('POST', '**/api/login').as('login');

    // Ir a flujo estudiantes
    cy.get('[data-testid="student-login-button"]').click();

    // Esperar carga de estudiantes
    cy.wait('@getStudents').its('response.statusCode').should('eq', 200);

    // Seleccionar perfil Leo Reader
    cy.get('[data-testid="student-card-Leo-Reader"]', { timeout: 15000 })
      .should('exist')
      .click();

    // Ingresar contraseña correcta (Pelota x4)
    selectPictograms(['Pelota','Pelota','Pelota','Pelota']);

    // Enviar
    cy.get('[data-testid="enter-password-button"]').click();

    // Verificar login (esperar petición)
    cy.wait('@login').its('response.statusCode').should('eq', 200);

    // Aserción: estamos en el menú de juegos
    cy.contains('Toca el número que suena', { timeout: 10000 }).should('be.visible');
  });

  it('Manejo de error con contraseña incorrecta y luego éxito', () => {
    cy.intercept('GET', '**/api/students').as('getStudents');
    cy.intercept('POST', '**/api/login').as('login');

    cy.get('[data-testid="student-login-button"]').click();
    cy.wait('@getStudents');
    cy.get('[data-testid="student-card-Leo-Reader"]').click();

    // Contraseña incorrecta (4 pictos distintos)
    selectPictograms(['Estrella','Casa','Perro','Libro']);
    cy.get('[data-testid="enter-password-button"]').click();

    // Esperar login y confirmar error (status 401 o mensaje controlado)
    cy.wait('@login').then(({ response }) => {
      expect([401, 400]).to.include(response.statusCode);
    });

    // Mensaje de error visible y contraseña limpiada
    cy.contains('Inténtalo de nuevo').should('be.visible');

    // Intento correcto
    selectPictograms(['Pelota','Pelota','Pelota','Pelota']);
    cy.get('[data-testid="enter-password-button"]').click();
    cy.wait('@login').its('response.statusCode').should('eq', 200);
    cy.contains('Toca el número que suena').should('be.visible');
  });

  it('Cambio de perfil en mismo dispositivo (Leo Reader -> Eva Student)', () => {
    cy.intercept('GET', '**/api/students').as('getStudents');
    cy.intercept('POST', '**/api/login').as('login');

    // Login primero con Leo Reader
    cy.get('[data-testid="student-login-button"]').click();
    cy.wait('@getStudents');
    cy.get('[data-testid="student-card-Leo-Reader"]').click();
    selectPictograms(['Pelota','Pelota','Pelota','Pelota']);
    cy.get('[data-testid="enter-password-button"]').click();
    cy.wait('@login').its('response.statusCode').should('eq', 200);
    cy.contains('Toca el número que suena').should('be.visible');

  // Logout vía BackButton en pantalla home (usa testID para evitar elementos ocultos)
  cy.get('[data-testid="back-button"]').should('be.visible').click();

    // Flujo segundo perfil
    cy.get('[data-testid="student-login-button"]').click();
    cy.wait('@getStudents');
    cy.get('[data-testid="student-card-Eva-Student"]').click();
    selectPictograms(['Perro','Perro','Perro','Perro']);
    cy.get('[data-testid="enter-password-button"]').click();
    cy.wait('@login').its('response.statusCode').should('eq', 200);
    cy.contains('Toca el número que suena').should('be.visible');
  });
});

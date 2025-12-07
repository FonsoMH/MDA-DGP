describe('E2E Crear Administrador', () => {
  it('crea un administrador, refresca la lista y permite login', () => {
    // Ir a la app
    cy.visit('http://localhost:8081');

    // Login como admin existente (patrón del test_userDelete)
    cy.get('[data-testid="teacher-login-button"]').click();
    cy.get('[data-testid="teacher-email-input"]').type('admin@app.com');
    cy.get('[data-testid="teacher-password-input"]').type('Hola1234');
    cy.get('[data-testid="login-submit-button"]').click();

  // Abrir menú de creación
    cy.get('[data-testid="creation-menu-button"]').click();

    // Abrir creación de administrador
    cy.get('[data-testid="create-admin-button"]').click();

    const uniqueEmail = `admin_e2e_${Date.now()}@app.com`;

    // Rellenar formulario
    cy.get('[data-testid="name-input"]').type('Admin E2E');
    cy.get('[data-testid="email-input"]').type(uniqueEmail);
    // Campo contraseña con testID
    cy.get('[data-testid="password-input"]').type('Secret123');

    // Enviar
    cy.get('[data-testid="submit-create-admin"]').click();

    // Verificar que vuelve al listado y refresca
    cy.contains('Gestión de Usuarios');
    cy.contains('Administradores');
    cy.contains(uniqueEmail);

    // Login del nuevo admin por la UI
    // Volver al formulario de login usando BackButton para hacer logout e ir atrás
    cy.get('[data-testid="back-button"]').should('be.visible').click();
    
    cy.get('[data-testid="teacher-login-button"]').click();
    cy.get('[data-testid="teacher-email-input"]').type(uniqueEmail);
    cy.get('[data-testid="teacher-password-input"]').type('Secret123');
    cy.get('[data-testid="login-submit-button"]').click();

    // Verificar que accede al área de administración (por ejemplo, botón de creación visible)
    cy.get('[data-testid="creation-menu-button"]', { timeout: 15000 }).should('exist');
  });
});
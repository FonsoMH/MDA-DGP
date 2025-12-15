let uniqueEmail;
let uniqueName;


describe('E2E flujo completo de edicion de estudiante', () => {
 beforeEach(() => {
  cy.visit('http://localhost:8081'); 
    const timestamp = Date.now();
    uniqueName = `Estudiante edit ${timestamp}`;
    uniqueEmail = `estudiante_edit_${timestamp}@example.com`;
 });

 it('flujo completo → administrador entra, abre perfil, edita datos, guarda, confirma cambios reflejados en la base de datos.', () => {
  cy.intercept('GET', '**/api/users*').as('getUsers');


  cy.get('[data-testid="teacher-login-button"]').click();

  cy.get('[data-testid="teacher-email-input"]').type('admin@app.com');
  cy.get('[data-testid="teacher-password-input"]').type('Hola1234');
  cy.get('[data-testid="login-submit-button"]').click();


  cy.get('[data-testid="creation-menu-button"]').click();
  cy.get('[data-testid="create-student-button"]').click();

  cy.get('[data-testid="name-input"]').type(uniqueName);
  cy.get('[data-testid="email-input"]').type(uniqueEmail);

  const password = ['Perro', 'Perro', 'Perro', 'Perro'];
  password.forEach(picto => {
    cy.get(`[data-testid="pictogram-${picto}"]`).scrollIntoView().should('be.visible').click();
});


  cy.get('[data-testid^="tutor-card-"]').first().click();
  cy.get('[data-testid="submit-create-student"]').click();


    cy.get(`[data-testid="user-name-${uniqueName}"]`, { timeout: 15000 }).should('exist');
    cy.wait('@getUsers'); 
    cy.get('@getUsers').then((interception) => {
      const body = interception.response?.body || [];
      const found = body.find(u => u.name === uniqueName && u.email === uniqueEmail);
      expect(found).to.exist;
      const createdUserId = found.id;
      expect(createdUserId, 'ID del usuario creado').to.be.ok; 


   
      cy.get(`[data-testid="edit-user-${createdUserId}"]`).scrollIntoView().click();


      const newName = 'EDITADO';
      const newEmail = 'editado@example.com';
      cy.get('[data-testid="name-input"]').clear().type(newName);
      cy.get('[data-testid="email-input"]').clear().type(newEmail);


      cy.get('[data-testid="submit-create-student"]').click();
      cy.wait('@getUsers');


      cy.get(`[data-testid="user-name-${newName}"]`, { timeout: 15000 }).should('exist');
      cy.get(`[data-testid="user-email-${newEmail}"]`, { timeout: 15000 }).should('exist');
  });


 });



 it('Debe mostrar errores de validación si se intenta guardar con un email ya existente', () => {

  cy.intercept('GET', '**/api/users*').as('getUsers');


  cy.get('[data-testid="teacher-login-button"]').click();

  cy.get('[data-testid="teacher-email-input"]').type('admin@app.com');
  cy.get('[data-testid="teacher-password-input"]').type('Hola1234');
  cy.get('[data-testid="login-submit-button"]').click();


  cy.get('[data-testid="creation-menu-button"]').click();
  cy.get('[data-testid="create-student-button"]').click();

  cy.get('[data-testid="name-input"]').type(uniqueName);
  cy.get('[data-testid="email-input"]').type(uniqueEmail);

  const password = ['Perro', 'Perro', 'Perro', 'Perro'];
  password.forEach(picto => {
    cy.get(`[data-testid="pictogram-${picto}"]`).scrollIntoView().should('be.visible').click();
});


  cy.get('[data-testid^="tutor-card-"]').first().click();
  cy.get('[data-testid="submit-create-student"]').click();

  cy.get(`[data-testid="user-name-${uniqueName}"]`, { timeout: 15000 }).should('exist');
    cy.wait('@getUsers'); 
    cy.get('@getUsers').then((interception) => {
      const body = interception.response?.body || [];
      const found = body.find(u => u.name === uniqueName && u.email === uniqueEmail);
      expect(found).to.exist;
      const createdUserId = found.id;
      expect(createdUserId, 'ID del usuario creado').to.be.ok; 


      cy.get(`[data-testid="edit-user-${createdUserId}"]`).scrollIntoView().click();

      // Editar datos
      const newName = 'EDITADO';
      const newEmail = 'editado@example.com';
      cy.get('[data-testid="name-input"]').clear().type(newName);
      cy.get('[data-testid="email-input"]').clear().type(newEmail);

      cy.get('[data-testid="submit-create-student"]').click();
      cy.wait('@getUsers');


      cy.on('window:alert', (msg) => {
        expect(msg).to.contain('Email already in use');
        });
    });

  
});



});
const CONFIGS = {
 'toca-numero': {
  min_value: 10,
  max_value: 50,
  num_elements: 3,
 },
 'ordena-secuencia': {
  min_value: 10,
  max_value: 20,
  num_elements: 5,
 },
 'reparte-igual': {
  min_value: 20,
  max_value: 40,
  num_elements: 4,
  num_containers: 2,
 },
 'deja-igual': {
  min_value: 0,
  max_value: 35,
  num_containers: 3,
 },
};

describe('E2E flujo completo de la configuracion de rangos', () => {
 beforeEach(() => {
  cy.visit('http://localhost:8081'); 
 });

 it('flujo completo: Crear nuevo prof y nuevo estudiante. -> Entrar como profesor --> Configurar rangos --> Guardar --> entrar como estudiante --> comprobar con los juegos', () => {

  // Paso 1️: Logear como profesor
  cy.get('[data-testid="teacher-login-button"]').click();

  // Paso 2️: ingresar credenciales
  cy.get('[data-testid="teacher-email-input"]').type('paul@app.com');
  cy.get('[data-testid="teacher-password-input"]').type('Hola1234');
  cy.get('[data-testid="login-submit-button"]').click();

  // Paso 11: Entrar en la configuración del estudiante creado
  cy.get('[data-testid="configure-student-button"]').first().click();


  const config_tocaNUM = CONFIGS['toca-numero'];
    // Tomamos el card del juego
  cy.get('[data-testid="game-card-1"]').within(() => {
   
   // Metemos los valores 
   cy.get('[data-testid="min_value-input"]').clear().type(config_tocaNUM.min_value);
   cy.get('[data-testid="max_value-input"]').clear().type(config_tocaNUM.max_value);
   cy.get('[data-testid="num_elements-input"]').clear().type(config_tocaNUM.num_elements);

   // Guardamos la configuración
   cy.get('[data-testid="save-config-1"]').click();
  });


  const config_ordenaSec = CONFIGS['ordena-secuencia'];
  cy.get('[data-testid="game-card-2"]').within(() => {
   cy.get('[data-testid="min_value-input"]').clear().type(config_ordenaSec.min_value);
   cy.get('[data-testid="max_value-input"]').clear().type(config_ordenaSec.max_value);
   cy.get('[data-testid="num_elements-input"]').clear().type(config_ordenaSec.num_elements);

   cy.get('[data-testid="save-config-2"]').click();
  });


  const config_reparteIgual = CONFIGS['reparte-igual'];
  cy.get('[data-testid="game-card-3"]').within(() => {
   cy.get('[data-testid="min_value-input"]').clear().type(config_reparteIgual.min_value);
   cy.get('[data-testid="max_value-input"]').clear().type(config_reparteIgual.max_value);
   cy.get('[data-testid="num_elements-input"]').clear().type(config_reparteIgual.num_elements);
   cy.get('[data-testid="num_containers-input"]').clear().type(config_reparteIgual.num_containers);

   cy.get('[data-testid="save-config-3"]').click();
  });

    const config_dejaIgual = CONFIGS['deja-igual'];
  cy.get('[data-testid="game-card-4"]').within(() => {
   cy.get('[data-testid="min_value-input"]').clear().type(config_dejaIgual.min_value);
   cy.get('[data-testid="max_value-input"]').clear().type(config_dejaIgual.max_value);
   cy.get('[data-testid="num_containers-input"]').clear().type(config_dejaIgual.num_containers);

   cy.get('[data-testid="save-config-4"]').click();
  });

  // Paso 12: Cerrar sesión como profesor y loggearse como estudiante para ver los cambios
  cy.get('[data-testid="back-button"]:visible').click();

  cy.get('[data-testid="back-button"]:visible').click();


  cy.get('[data-testid="student-login-button"]').click();

  cy.get('[data-testid="student-card-Eva-Student"]').click();

  const password = ['Perro', 'Perro', 'Perro', 'Perro'];

  password.forEach((pictogram) => {
   cy.get(`[data-testid="pictogram-${pictogram}"]`)
    .scrollIntoView()
    .should('be.visible')
    .click();
  });

  cy.get('[data-testid="enter-password-button"]').click();


  // Paso 5: seleccionar el juego dentro del menu de juegos
  cy.contains('Toca el número que suena')
  .first()
  .scrollIntoView()
  .click();

  cy.get('[data-testid="option-box"]').should('have.length', config_tocaNUM.num_elements);

  cy.get('[data-testid="option-box"]').each(($box) => {
   cy.wrap($box)
    .invoke('text')
    .then((text) => {
     const num = Number(text.trim());
     expect(num).to.be.within(config_tocaNUM.min_value, config_tocaNUM.max_value);
    });
  });

  cy.wait(1000);


  cy.get('[data-testid="back-button"]:visible').click();

  cy.contains('Ordena la secuencia')
  .scrollIntoView()
  .click();

  cy.get('[data-testid="sequence-item"]').should('have.length', config_ordenaSec.num_elements);


  cy.get('[data-testid="sequence-item"]').each(($box) => {
   cy.wrap($box)
    .invoke('text')
    .then((text) => {
     const num = Number(text.trim());
     expect(num).to.be.within(config_ordenaSec.min_value, config_ordenaSec.max_value);
    });
  });



  cy.wait(1000);



  cy.get('[data-testid="back-button"]:visible').click();


  cy.contains('Reparte el mismo número')
  .scrollIntoView()
  .click();


  cy.get('[data-testid="option-item"]').should('have.length', config_reparteIgual.num_elements);
  cy.get('[data-testid="container-item"]').should('have.length', config_reparteIgual.num_containers);



  cy.get('[data-testid="option-item"]').each(($box) => {
   cy.wrap($box)
    .invoke('text')
    .then((text) => {
     const num = Number(text.trim());
     expect(num).to.be.within(config_reparteIgual.min_value, config_reparteIgual.max_value);
    });
  });

  cy.wait(1000);



  cy.get('[data-testid="back-button"]:visible').click();

  cy.contains('Deja el mismo número')
  .scrollIntoView()
  .click();


  cy.get('[data-testid="container-item"]').should('have.length', config_dejaIgual.num_containers);

  cy.get('[data-testid^="opt-"]').each(($item) => {
    cy.wrap($item)
      .invoke('text')
      .then((text) => {
        const cleanedText = text.trim(); 
        const num = Number(cleanedText);
      
        expect(cleanedText).to.not.be.empty;
        expect(num).to.be.within(config_dejaIgual.min_value, config_dejaIgual.max_value);
      });
  });

  cy.wait(1000);


 });
});
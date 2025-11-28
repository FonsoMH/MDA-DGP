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
    upward: false,
  },
  'reparte-igual': {
    min_value: 20,
    max_value: 40,
    num_elements: 4,
    num_containers: 2,
    sum: true,
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
    cy.get('[data-testid="game-card-toca-numero"]').within(() => {
      
      // Metemos los valores 
      cy.get('[data-testid="min_value-input"]').clear().type(config_tocaNUM.min_value);
      cy.get('[data-testid="max_value-input"]').clear().type(config_tocaNUM.max_value);
      cy.get('[data-testid="num_elements-input"]').clear().type(config_tocaNUM.num_elements);

      // Guardamos la configuración
      cy.get('[data-testid="save-config-toca-numero"]').click();
    });


    const config_ordenaSec = CONFIGS['ordena-secuencia'];
    cy.get('[data-testid="game-card-ordena-secuencia"]').within(() => {
      cy.get('[data-testid="min_value-input"]').clear().type(config_ordenaSec.min_value);
      cy.get('[data-testid="max_value-input"]').clear().type(config_ordenaSec.max_value);
      cy.get('[data-testid="num_elements-input"]').clear().type(config_ordenaSec.num_elements);
      
      // Switch "upward"
      cy.get('[data-testid="upward-switch"]').invoke('prop', 'value').then((current) => {
        if (current !== false) {
          cy.get('[data-testid="upward-switch"]').click();
        }
      });

      cy.get('[data-testid="save-config-ordena-secuencia"]').click();
    });


    const config_reparteIgual = CONFIGS['reparte-igual'];
    cy.get('[data-testid="game-card-reparte-igual"]').within(() => {
      cy.get('[data-testid="min_value-input"]').clear().type(config_reparteIgual.min_value);
      cy.get('[data-testid="max_value-input"]').clear().type(config_reparteIgual.max_value);
      cy.get('[data-testid="num_elements-input"]').clear().type(config_reparteIgual.num_elements);
      cy.get('[data-testid="num_containers-input"]').clear().type(config_reparteIgual.num_containers);

      // Switch "sum"
      cy.get('[data-testid="sum-switch"]').invoke('prop', 'value').then((current) => {
        if (current !== true) {
          cy.get('[data-testid="sum-switch"]').click();
        }
      });

      cy.get('[data-testid="save-config-reparte-igual"]').click();
    });

    // Paso 12: Cerrar sesión como profesor y loggearse como estudiante para ver los cambios
    cy.get('[data-testid="back-button"]').first().click({ force: true });
    cy.get('[data-testid="back-button"]').first().click({ force: true });

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


    //TODO mirar bien esto maboy
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





  });
});

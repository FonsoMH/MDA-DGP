let previousTarget = null;

function playRound() {
  // Obtengo el número objetivo de la ronda
  cy.get('[data-testid="target-number"]', { timeout: 10000 })
    .should('exist')
    .invoke('text')
    .then((targetNumber) => {
      // Esperar hasta que el targetNumber sea diferente al anterior
      if (targetNumber === previousTarget) {
        cy.wait(500);
        playRound();
        return;
      }
      previousTarget = targetNumber;
      cy.get(`[data-testid="option-${targetNumber}"]`).scrollIntoView().click();
    });
}

describe('E2E TapNumberGame flujo completo', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8081'); 
  });

  it('flujo completo: Inicio --> Soy estudiante --> Eva Student --> contraseña --> juego --> feedback', () => {
    // Paso 1: elegir rol
    cy.get('[data-testid="student-login-button"]').click();

    // Paso 2: seleccionar estudiante
    cy.get('[data-testid="student-card-Eva-Student"]').click();

    // Paso 3: ingresar pictogramas de contraseña
    const password = ['Perro', 'Perro', 'Perro', 'Perro'];

    password.forEach((pictogram) => {
      cy.get(`[data-testid="pictogram-${pictogram}"]`)
        .scrollIntoView()
        .should('be.visible')
        .click();
    });

    // Paso 4:presionar Entrar
    cy.get('[data-testid="enter-password-button"]').click();

    // Paso 5: seleccionar el juego dentro del menu de juegos
    cy.contains('Toca el número que suena')
    .scrollIntoView()
    .click();

    // Paso 6: verificar que se abre el juego correctamente seleccionando el botón de TTS
    cy.get('[data-testid="tts-button"]').click();

    // Repetir 5 rondas
    for (let i = 0; i < 5; i++) {
      playRound();
    }

    // Verificar que aparece el FeedbackScreen al final
    cy.get('[data-testid="feedback-screen"]').should('be.visible');


    // TODO : Agregar tests para verificar el texto alternativo 
  });
});

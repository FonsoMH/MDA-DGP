import 'cypress-wait-until';

function getSequence() {
  return cy.get('[data-testid^="sequence-item-"]', { timeout: 10000 }).then(($items) => {
    return [...$items].map((el) =>
      parseInt(el.getAttribute('data-testid').replace('sequence-item-', ''))
    );
  });
}

describe('SequenceGame - Verifica randomización entre rondas', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8081');

    // --- LOGIN ---
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

    // --- SELECCIONAR JUEGO ---
    cy.contains('Ordena la secuencia').scrollIntoView().click();
  });

  it('Debería generar una secuencia distinta entre la primera y la segunda ronda', () => {
    let firstSequence;

    // --- Capturar la primera secuencia ---
    getSequence().then((seq) => {
      firstSequence = seq;

      // --- Resolver la primera ronda ---
      const sorted = [...seq].sort((a, b) => a - b);
      sorted.forEach((num) => {
        cy.get(`[data-testid="sequence-item-${num}"]`).click();
      });

      // --- Esperar a que cambie la secuencia ---
      cy.log('Esperando a que cambie la secuencia...');
      cy.waitUntil(() =>
        getSequence().then((newSeq) => newSeq.join() !== firstSequence.join())
      , {
        timeout: 10000,
        interval: 500,
        errorMsg: 'La secuencia no cambió después de 10 segundos',
      });

      // --- Capturar la nueva secuencia ---
      getSequence().then((secondSequence) => {
        cy.log('Primera secuencia:', firstSequence);
        cy.log('Segunda secuencia:', secondSequence);
        expect(secondSequence).not.to.deep.equal(firstSequence);
      });
    });
  });
});

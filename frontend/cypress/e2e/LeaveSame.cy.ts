
describe('ContainerSort E2E Test (Modo Click)', () => {


    beforeEach(() => {
        
        cy.visit("http://localhost:8081");
        
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
        
        // Entrar al juego
        cy.contains('Deja el mismo número').scrollIntoView().click();

    });

    
    // --- Tests ---

    it('debe resolver el puzle', () => {
       Cypress.env('E2E_DATA', 'FIXED_CONTAINERS');


        cy.get('[aria-label="Container-Area-0"]', { timeout: 10000 })
        .should('exist');

        cy.get('[data-testid="opt-3"]').trigger('pointerdown', { force: true })
            .trigger('pointerup', { force: true });

        cy.get('[data-testid="opt-9"]').trigger('pointerdown', { force: true })
            .trigger('pointerup', { force: true });

        cy.get('[data-testid="opt-1"]').trigger('pointerdown', { force: true })
            .trigger('pointerup', { force: true });

        cy.get('[aria-label="round-message"]', { timeout: 10000 })
        .should('be.visible');


    });
});
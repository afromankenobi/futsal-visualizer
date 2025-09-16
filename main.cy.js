describe('Futsal Visualizer', () => {
  it('loads main page and toggles controls', () => {
    // Use the baseUrl defined in cypress.config.js; visiting '/' navigates
    // to the deployed site or local dev server depending on configuration.
    cy.visit('/');

    // Verify page loads by checking for the main heading
    cy.contains('Futsal Trainer').should('be.visible');

    // Verify workshop selector is present (shows "Sin guardar" initially)
    cy.contains('Sin guardar').should('be.visible');

    // Test play/pause button using title attribute for better targeting
    cy.get('button[title="Reproducir"]').should('be.visible').click();
    cy.get('button[title="Pausar"]').should('exist');

    // Toggle arrows using title attribute
    cy.get('button[title="Mostrar flechas"], button[title="Ocultar flechas"]').click();

    // Toggle 3D mode using title attribute
    cy.get('button[title="Vista 2D"], button[title="Vista 3D"]').click();

    // Verify that the randomizer textarea for teams exists
    cy.get('textarea').should('exist');

    // Test workshop functionality - click dropdown to open it
    cy.contains('Sin guardar').click();

    // Verify dropdown opened and shows "Nuevo workshop" button
    cy.contains('Nuevo workshop').should('be.visible');

    // Close dropdown by clicking outside
    cy.get('body').click(0, 0);
  });
});
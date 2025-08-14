describe('Futsal Visualizer', () => {
  it('loads main page and toggles controls', () => {
    // Use the baseUrl defined in cypress.config.js; visiting '/' navigates
    // to the deployed site or local dev server depending on configuration.
    cy.visit('/');

    // Ensure the Play button exists and click it. It may toggle to Pause.
    cy.contains('Play').should('be.visible').click();

    // After clicking, either Play or Pause should exist. Assert existence.
    cy.contains(/Play|Pause/).should('exist');

    // Toggle hide/show arrows. The text may change from Ocultar to Mostrar.
    cy.contains(/Ocultar flechas|Mostrar flechas/).click();

    // Toggle 3D mode.
    cy.contains('Modo 3D').click();

    // Verify that the randomizer input for teams exists.
    cy.get('input').should('exist');
  });
});
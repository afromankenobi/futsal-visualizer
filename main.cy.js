describe('Futsal Visualizer', () => {
  it('loads main page and toggles controls', () => {
    // Use the baseUrl defined in cypress.config.js; visiting '/' navigates
    // to the deployed site or local dev server depending on configuration.
    cy.visit('/');

    // Verify page loads by checking for the main heading
    cy.contains('Futsal Trainer').should('be.visible');

    // Find the play button by looking for buttons and clicking the first one (play/pause button)
    cy.get('button').first().should('be.visible').click();

    // Verify the button still exists after clicking (it should toggle)
    cy.get('button').first().should('exist');

    // Toggle arrows - find button with arrow-related functionality
    cy.get('button').eq(1).click();

    // Toggle 3D mode - find the third button
    cy.get('button').eq(2).click();

    // Verify that the randomizer textarea for teams exists.
    cy.get('textarea').should('exist');
  });
});
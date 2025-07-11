describe('LofiMusic App', () => {
  it('should render the media player and show Now Playing', () => {
    cy.visit('/');
    cy.contains('Now Playing').should('be.visible');
  });
}); 
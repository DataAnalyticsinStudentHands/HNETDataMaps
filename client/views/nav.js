Template.navItems.helpers({
  activeIfTemplateIs(template) {
    const currentRoute = Router.current();
    return currentRoute &&
      template === currentRoute.lookupTemplate() ? 'active' : '';
  },
});

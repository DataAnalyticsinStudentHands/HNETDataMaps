Accounts.config(
  {
    sendVerificationEmail: true,
    forbidClientAccountCreation: false
  }
);

Accounts.ui.config({
  passwordSignupFields: 'EMAIL_ONLY',
  extraSignupFields: [
    {
      fieldName: 'first-name',
      fieldLabel: 'First name',
      inputType: 'text',
      visible: true,
      validate: function (value, errorFunction) {
        if (!value) {
          errorFunction('Please write your first name');
          return false;
        } else {
          return true;
        }
      }
    }, {
      fieldName: 'last-name',
      fieldLabel: 'Last name',
      inputType: 'text',
      visible: true
    }
  ]
});

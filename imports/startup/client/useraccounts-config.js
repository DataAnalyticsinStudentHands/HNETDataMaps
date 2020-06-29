import { Accounts } from 'meteor/accounts-base';

Accounts.config(
  {
    sendVerificationEmail: true,
    forbidClientAccountCreation: true
  }
);

Accounts.emailTemplates.siteName = 'HNET';
Accounts.emailTemplates.from = 'HNET Admin <dashadmin@uh.edu>';

Accounts.emailTemplates.resetPassword.from = () => {
  // Overrides the value set in `Accounts.emailTemplates.from` when resetting
  // passwords.
  return 'HNET Password Reset <no-reply@hnet.uh.edu>';
};

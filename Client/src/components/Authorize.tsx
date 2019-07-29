import React from 'react';
import AuthorizeServise from 'src/services/AuthorizeServise';

const Authorize: any = () => {
  const win: any = window;
  const securityObject = AuthorizeServise.getSecurityData(win.config.oauthCode).then(e => localStorage.setItem('securityObjecy', JSON.stringify(e)));
  return null;
};

export default Authorize;

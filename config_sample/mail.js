import mailgunJs from 'mailgun-js';

import { domain } from './service.js';

const apiKey = 'XXXXXXXXXXXXXXXXXXXXXXX';

const mailgun = mailgunJs({
  apiKey,
  domain,
});
 
export default mailgun;

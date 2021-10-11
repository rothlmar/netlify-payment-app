const config = require('./config');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = function(event, context, callback) {
  if (event.httpMethod != 'POST') {
    return callback(null, {statusCode: 404, body: '{"error": "Not found"}'});
  }
  const req_body_incoming = JSON.parse(event.body);
  if (!('email_address' in req_body_incoming)) {
    return callback(null, {statusCode: 400, body: '{"error": "Missing required field: address"}'});
  }
  if (!('payment_id' in req_body_incoming)) {
    return callback(null, {statusCode: 400, body: '{"error": "Missing required field: payment_id"}'});
  }
  if (!process.env.SENDGRID_API_KEY) {
    return callback(null, {statusCode: 500, body: '{"error": "Email not configured"}'});
  }

  const text = `Thank you for your reservation!  To review or update, please visit
${config.APPLICATION_BASE}/payments/${req_body_incoming.payment_id}`;

  const html = `Thank you for your reservation!  To review or update, please visit ` +
        `<a href="${config.APPLICATION_BASE}/payments/${req_body_incoming.payment_id}">this link</a>`;

  const msg = {
    to: req_body_incoming.email_address,
    from: config.EMAIL_FROM,
    subject: `Equipment Rental Reservation`,
    text,
    html,
  }

  sgMail.send(msg).then(rsp =>
    callback(null, {statusCode: 200, body: '{"status": "success"}'}));
}

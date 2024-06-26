This is an awesome web application that shows off features of the Payments API.

Inspired by recent events, the application is for a business that rents medical equipment to
people recovering from injuries.  The payment flow includes an authorization with separate
capture, and includes a refundable deposit in addition to the cost of the rental.  When the
equipment is "returned," the deposit can be zeroed out by (using the "edit amount down")
alpha functionality of the Payment API.  We also allow the customer to add a tip for the
technician that delivers and picks up the equipment, and to edit that tip any time before the
payment is captured.

Because this is a hack week project, we're going to use all the coolest things:
* Netlify (hosting, functions, CI/CD)
* FaunaDB (database)
* Vue.js (front end)
* Bulma (CSS framework)
* Gulp (Static file build, maybe not the coolest)

The following environment variables need to be defined:
* FAUNADB_ACCESS_KEY
* SENDGRID_API_KEY
* SQUARE_ACCESS_TOKEN
* SQUARE_APPLICATION_ID
* SQUARE_ENV (`sandbox` or `prod`)

Activity log:

1. Sign up at `app.netlify.com` and verify email.
1. Push code to github, add repository to netlify.
1. Use Netlify settings to specify invite-only registration.
1. Use Netlify identity tab to create a user and grant "admin" role.
1. Add Netlify environment variables for access token, application id, square environment.
1. Log in to https://fauna.com (Netlify oAuth), make a database with a collection named "rentals".
1. Create a faunaDB key and add it to Netlify environment variables.
1. Create a SendGrid account, make an API key and add to Netlify (optional).

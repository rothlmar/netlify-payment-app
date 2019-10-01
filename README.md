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

Activity log:

1. Sign up at app.netlify.com and verify email.
2. Push code to github, add to netlify.
3. Use Netlify settings to specify invite-only registration.
4. Use Netlify identity tab to create and grant "admin" role
5. Add Netlify environment variables for access token, application id, base path (for sandbox)

Notes:

* Can't use Square Connect SDK because something doesn't play nice with Netlify's function bundler (possibly a conflict between superagent dependency and webpack?)

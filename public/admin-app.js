function getPayments() {
  if (netlifyIdentity.currentUser()) {
    return netlifyIdentity.currentUser().jwt().then(token => {
      return fetch('/.netlify/functions/payments',
                   { method: 'GET',
                     headers: {'Authorization': `Bearer ${token}`}})})
      .then(response => response.json())
      .then(response => {data.payments = response['payments']});
  }
}

const data = {
  payments: []
};

const app = new Vue({
  el: '#adminApp',
  data: data
});

netlifyIdentity.on('init', getPayments);
netlifyIdentity.on('login', getPayments);
netlifyIdentity.on('logout', () => { data.payments = []; })

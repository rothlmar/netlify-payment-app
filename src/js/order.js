const LOCATION_ID = '#{ square_location_id }';

const data = {
  rental_length: 3,
  deposit_amount: "2.00",
  payment_id: null,
  start_date: new Date().toISOString().slice(0, 10),
  rental_address: '',
  contact_name: '',
  contact_number: '',
  rental_options: ['Medical Device', 'Bouncy Castle'],
  rental_selected: '',
  email_address: '',
  order_id: null
};

let card;

const computed = {
  rental_price: function() { return Number.parseFloat(this.rental_length).toFixed(2) },
  rental_period: function() { return this.rental_selected == 'Bouncy Castle' ? 'days' : 'weeks' },
  total_price: function() { return compute_total_price(this.rental_length) },
  order_created: function() { return this.order_id != null }

}

function compute_total_price(rental_length, delivery_tip) {
  deposit_amount = 2;
  total_amount = deposit_amount + Number.parseFloat(rental_length);
  return total_amount.toFixed(2);
}

function call_create_order(data) {
  const req_body = {
    rental_length: data.rental_length,
    start_date: data.start_date,
    rental_address: data.rental_address,
    contact_name: data.contact_name,
    contact_number: data.contact_number,
    rental_selected: data.rental_selected,
    location_id: LOCATION_ID
  }

  return fetch('/.netlify/functions/create-order', {
    method: 'POST',
    body: JSON.stringify(req_body)
  })
    .then(response => response.json())
    .then(response => data.order_id = response['order']['id']);
}



async function submitCreateOrder(event) {
  event.preventDefault();
  call_create_order(data);
};

function sendEmail(payment_id, email_address) {
  return fetch('/.netlify/functions/send-email', {
    method: 'POST',
    body: JSON.stringify({ payment_id, email_address })
  });
}

const app = new Vue({
  el: '#app',
  data: data,
  computed: computed,
  methods: { sendEmail, submitCreateOrder }
});

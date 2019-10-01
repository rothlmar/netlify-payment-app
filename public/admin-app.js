const data = {
  identity: null
};

const app = new Vue({
  el: '#adminApp',
  data: data
});

netlifyIdentity.on('init', user => {data.identity = user; });
netlifyIdentity.on('login', user => {data.identity = user; });

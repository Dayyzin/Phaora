/* PHAORA — Cart module (localStorage) */
(function(){
  var KEY = 'phaora_cart';

  function _read(){
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch(e){ return []; }
  }
  function _write(arr){ localStorage.setItem(KEY, JSON.stringify(arr)); }

  window.PhaoraCart = {
    getCart: function(){ return _read(); },

    getItemCount: function(){ return _read().length; },

    addToCart: function(slug, name, price, stripeId){
      var cart = _read();
      for(var i=0;i<cart.length;i++){
        if(cart[i].slug===slug) return false; /* already in cart */
      }
      cart.push({slug:slug, name:name, price:price, stripeId:stripeId||null});
      _write(cart);
      this.renderCartCount();
      return true;
    },

    removeFromCart: function(slug){
      var cart = _read().filter(function(item){ return item.slug!==slug; });
      _write(cart);
      this.renderCartCount();
    },

    clearCart: function(){
      localStorage.removeItem(KEY);
      this.renderCartCount();
    },

    renderCartCount: function(){
      var count = _read().length;
      var badges = document.querySelectorAll('.cart-badge');
      for(var i=0;i<badges.length;i++){
        badges[i].textContent = count;
        badges[i].style.display = count > 0 ? 'flex' : 'none';
      }
    }
  };

  /* Init on load */
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', function(){ window.PhaoraCart.renderCartCount(); });
  } else {
    window.PhaoraCart.renderCartCount();
  }
})();

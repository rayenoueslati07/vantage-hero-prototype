/* Vantage Config Loader
 * Sayfa açılışında api/config.php'den verileri çeker,
 * data-vt="key" attribute'lı elementleri günceller.
 *
 * Kullanım:
 * <span data-vt="phone"></span>
 * <a href="#" data-vt-href="whatsapp">...</a>
 * <iframe data-vt-src="map_embed"></iframe>
 * <a href="#" data-vt-href="social.facebook">...</a>
 */
(function(){
  'use strict';

  function get(obj, path){
    var parts = path.split('.');
    var v = obj;
    for(var i=0; i<parts.length; i++){
      if(v == null) return '';
      v = v[parts[i]];
    }
    return v == null ? '' : v;
  }

  function applyConfig(cfg){
    // İçerik
    document.querySelectorAll('[data-vt]').forEach(function(el){
      var key = el.getAttribute('data-vt');
      var val = get(cfg, key);
      if(val !== '' && val != null){
        if(key === 'address' || key === 'address_line1' || key === 'address_line2'){
          el.innerHTML = String(val).replace(/\n/g, '<br>');
        } else {
          el.textContent = val;
        }
      }
    });

    // href
    document.querySelectorAll('[data-vt-href]').forEach(function(el){
      var key = el.getAttribute('data-vt-href');
      var val = get(cfg, key);
      if(val) el.href = val;
    });

    // src
    document.querySelectorAll('[data-vt-src]').forEach(function(el){
      var key = el.getAttribute('data-vt-src');
      var val = get(cfg, key);
      if(val) el.src = val;
    });

    // Adres iki satırlı özel format
    document.querySelectorAll('[data-vt-address]').forEach(function(el){
      var l1 = cfg.address_line1 || '';
      var l2 = cfg.address_line2 || '';
      el.innerHTML = l1 + (l2 ? '<br>' + l2 : '');
    });
  }

  fetch('/api/config.php', { cache: 'no-store' })
    .then(function(r){ return r.json(); })
    .then(applyConfig)
    .catch(function(){});
})();

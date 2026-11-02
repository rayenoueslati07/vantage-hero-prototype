/* Vantage Form Handler - tüm formları mail.php üzerinden gönderir
 *
 * - Gönderim öncesi HTML5 doğrulaması + KVKK onay kutusu kontrolü
 * - Başarılı gönderimde dataLayer'a 'form_submit' olayı basılır (GTM/GA4)
 * - Ardından /tesekkurler sayfasına yönlendirilir (URL değişir, dönüşüm ölçülebilir)
 */
(function(){
  'use strict';

  // Form tipine göre teşekkür sayfası adresi
  var REDIRECT = {
    contact: '/tesekkurler?tip=iletisim',
    apply:   '/tesekkurler?tip=bilgi-formu',
    katalog: '/tesekkurler?tip=katalog&dl=1'
  };

  function consentOk(form){
    var box = form.querySelector('input[name="kvkk"]');
    if(box && !box.checked){
      showMsg(form, 'error', 'Devam edebilmek için KVKK Aydınlatma Metni\'ni kabul etmeniz gerekmektedir.');
      try { box.focus(); } catch(e){}
      return false;
    }
    return true;
  }

  function handleForm(form, formType){
    form.addEventListener('submit', function(e){
      e.preventDefault();

      // Tarayıcı doğrulaması (zorunlu alanlar + onay kutusu)
      if(typeof form.checkValidity === 'function' && !form.checkValidity()){
        if(typeof form.reportValidity === 'function') form.reportValidity();
        return;
      }
      if(!consentOk(form)) return;

      var data = new FormData(form);
      data.append('form_type', formType);

      var btn = form.querySelector('button[type="submit"]');
      var oldText = btn ? btn.innerHTML : '';
      if(btn){
        btn.disabled = true;
        btn.innerHTML = 'Gönderiliyor...';
      }

      fetch('mail.php', { method: 'POST', body: data })
        .then(function(r){ return r.json(); })
        .then(function(res){
          if(res.ok){
            showMsg(form, 'success', res.msg || 'Mesajınız gönderildi.');
            form.reset();

            // GTM / GA4 olayı
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'form_submit', form_type: formType });

            var to = REDIRECT[formType];
            if(to){
              setTimeout(function(){ window.location.href = to; }, 400);
              return;
            }
          } else {
            showMsg(form, 'error', res.msg || 'Bir hata oluştu.');
          }
        })
        .catch(function(){
          showMsg(form, 'error', 'Sunucuya ulaşılamadı.');
        })
        .finally(function(){
          if(btn){
            btn.disabled = false;
            btn.innerHTML = oldText;
          }
        });
    });
  }

  function showMsg(form, type, text){
    var msg = form.querySelector('.vt-form-msg');
    if(!msg){
      msg = document.createElement('div');
      msg.className = 'vt-form-msg';
      msg.style.cssText = 'margin-top:15px;padding:12px 18px;font-size:0.9em;border-radius:3px;';
      form.appendChild(msg);
    }
    if(type === 'success'){
      msg.style.background = 'rgba(37,211,102,0.15)';
      msg.style.color = '#25D366';
      msg.style.border = '1px solid rgba(37,211,102,0.3)';
    } else {
      msg.style.background = 'rgba(220,53,69,0.15)';
      msg.style.color = '#ff6b6b';
      msg.style.border = '1px solid rgba(220,53,69,0.3)';
    }
    msg.textContent = text;
    setTimeout(function(){ msg.textContent = ''; msg.style.border = 'none'; msg.style.background = 'transparent'; }, 6000);
  }

  document.addEventListener('DOMContentLoaded', function(){
    // İletişim formu (sayfa içi)
    document.querySelectorAll('.js-ajax-form').forEach(function(form){
      handleForm(form, 'contact');
    });

    // Başvuru modalı
    var applyForm = document.querySelector('#vtBasvuruModal form');
    if(applyForm){
      handleForm(applyForm, 'apply');
    }

    // Katalog modalı - PDF indirme teşekkür sayfasında başlar
    var katalogForm = document.querySelector('#vtKatalogModal form');
    if(katalogForm){
      katalogForm.removeAttribute('onsubmit');
      handleForm(katalogForm, 'katalog');
    }
  });

})();

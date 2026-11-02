document.addEventListener('DOMContentLoaded', function(){
  var bar = document.getElementById('cookieConsent');
  if(!bar) return;

  // Her zaman göster test için localStorage kontrolü
  if(localStorage.getItem('cookieConsent')){
    bar.style.display = 'none';
    return;
  }

  setTimeout(function(){ bar.classList.add('show'); }, 800);

  var acceptBtn = document.getElementById('cookieAccept');
  var settingsBtn = document.getElementById('cookieSettingsBtn');
  var modal = document.getElementById('cookieModal');
  var modalClose = document.getElementById('cookieModalClose');
  var modalSave = document.getElementById('cookieModalSave');

  if(acceptBtn){
    acceptBtn.addEventListener('click', function(){
      localStorage.setItem('cookieConsent', 'all');
      bar.classList.remove('show');
    });
  }

  if(settingsBtn && modal){
    settingsBtn.addEventListener('click', function(){
      modal.classList.add('show');
    });
  }

  if(modalClose && modal){
    modalClose.addEventListener('click', function(){
      modal.classList.remove('show');
    });
  }

  if(modalSave && modal){
    modalSave.addEventListener('click', function(){
      var analytics = document.getElementById('cookieAnalytics');
      var marketing = document.getElementById('cookieMarketing');
      var prefs = {
        necessary: true,
        analytics: analytics ? analytics.checked : false,
        marketing: marketing ? marketing.checked : false
      };
      localStorage.setItem('cookieConsent', JSON.stringify(prefs));
      modal.classList.remove('show');
      bar.classList.remove('show');
    });
  }

  if(modal){
    modal.addEventListener('click', function(e){
      if(e.target === this) this.classList.remove('show');
    });
  }
});

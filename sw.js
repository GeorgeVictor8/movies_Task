const staticCacheName = 'site-static';
const dynamicCacheName = 'site-dynamic';
const assets = [
  '/',
  '/index.html',
  '/app/src/scss/globals/_index.scss',
  '/app/src/scss/globals/layout.scss',
  '/app/src/scss/utilities/_index.scss',
  '/app/src/scss/utilities/breakpoints.scss',
  '/dist/custom.js',
  '/dist/custom.js.map',
  '/dist/style.css',
  '/dist/style.css.map',
  '/node_modules/@fortawesome/fontawesome-free/css/all.min.css',
  '/node_modules/owl.carousel/dist/assets/owl.carousel.min.css',
  '/node_modules/owl.carousel/dist/assets/owl.theme.default.min.css',
  '/node_modules/bootstrap/dist/css/bootstrap.min.css',
  '/dist/style.css',
  '/node_modules/jquery/dist/jquery.min.js',
  '/node_modules/owl.carousel/dist/owl.carousel.min.js',
  '/app/src/scss/js/app.js',
  '/app/src/scss/js/custom.js'
];

// cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if(keys.length > size){
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};

// install event
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      cache.addAll(assets);
    })
  );
});

// activate event
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== staticCacheName && key !== dynamicCacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});

// fetch events
self.addEventListener('fetch', evt => {
  console.log('fetch event', evt);
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request).then(fetchRes => {
        return caches.open(dynamicCacheName).then(cache => {
          cache.put(evt.request.url, fetchRes.clone());
          // check cached items size
          limitCacheSize(dynamicCacheName, 15);
          return fetchRes;
        })
      });
    }).catch(() => {
      if(evt.request.url.indexOf('.html') > -1){
        return caches.match('/pages/fallback.html');
      } 
    })
  );
});
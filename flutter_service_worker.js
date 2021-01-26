'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "1b9094f7a22349d2ae6370ffcddd2b2b",
"index.html": "faf3570787ecb4ba464be4a3ba9de71a",
"/": "faf3570787ecb4ba464be4a3ba9de71a",
"main.dart.js": "ecdea7c76cd0ee9c3898f83bb40233a8",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "6f2b7f3c4920502dbda8f49277f8ae1c",
"assets/AssetManifest.json": "85abe04b8a1204b941070257fe42c96c",
"assets/NOTICES": "1e427f7fcc026b7397238f3e5327b874",
"assets/FontManifest.json": "cd04616d624ccae473953a3f27419d46",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/assets/images/ic_trash.png": "49d8d965e08f0860dbe916b8ab7bc4cb",
"assets/assets/images/photo_grid.jpg": "cf7075c710a08c12e79c0eeddac7df18",
"assets/assets/images/avatar5.jpg": "e34fd9913665d9ee06d24451a2cb078b",
"assets/assets/images/ic_more.png": "19c7cd1e15aaad984b903e6423b79b11",
"assets/assets/images/avatar4.jpg": "c6c1a11486a4bed87e03fd10d7b6279c",
"assets/assets/images/avatar.png": "e785080be11bf6454fc73d8fafd33b53",
"assets/assets/images/ic_star.png": "22e02443f36b7fabe91fe202ce61eb8e",
"assets/assets/images/ic_edit.png": "191d715b7cd4874029698c7ac1771f6c",
"assets/assets/images/avatar6.jpg": "474fcdd960e596829bb40e853a121aaa",
"assets/assets/images/avatar7.jpg": "8b80d2e4a9b551ee5b0e95f7629603c0",
"assets/assets/images/logo.png": "d7f6df618ce3ba373c17800f33171623",
"assets/assets/images/avatar3.jpg": "c86e8c613c3bb071062e93979bd20919",
"assets/assets/images/avatar2.jpg": "75f8341741fcf1f850558c9847c9f01f",
"assets/assets/images/ic_reply.png": "e0d3def2720e06df65b32e5fc93f856c",
"assets/assets/images/avatar0.jpg": "bdc072a78523319ca512067931a3501b",
"assets/assets/images/ic_send.png": "46e5c3a90eafd632d907070fab503e65",
"assets/assets/images/avatar1.jpg": "069baf494b10baf1c35b17073d58c868",
"assets/assets/images/photo4.jpg": "381a7cc725d2887fc6a5d724f1c6999f",
"assets/assets/images/ic_important.png": "13dc9b2d1a103ba7888b75f29391a82e",
"assets/assets/images/photo2.jpg": "c33228b85ad4785f3b7252f77a2a3f3f",
"assets/assets/images/photo3.jpg": "b4600cfd99c5f0ac085168becc51c161",
"assets/assets/images/photo1.jpg": "fcd06fd6d6b53c475a0748d4879fcb3e",
"assets/assets/images/photo0.jpg": "d0d75cde3e22230a66cc03605c3d9065",
"assets/assets/fonts/WorkSans-Regular.ttf": "30be604d29fd477c201fb1d6e668eaeb",
"assets/assets/fonts/WorkSans-Medium.ttf": "488b6f72b6183415e7a20aafa803a0c8",
"assets/assets/fonts/WorkSans-SemiBold.ttf": "6f8da6d25c25d58ef3ec1c8b7c0e69c3",
"assets/assets/fonts/WorkSans-Bold.ttf": "1fed2d8028f8f5356cbecedb03427405",
"assets/assets/flare/edit_reply.flr": "e4be7d9e1ee5cc99fe528a808ea0f365"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}

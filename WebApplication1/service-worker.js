"use strict";

console.log('WORKER: executing.');

/* A version number is useful when updating the worker logic,
   allowing you to remove outdated cache entries during the update.
*/
var version = 'v2::';

/* These resources will be downloaded and cached by the service worker
   during the installation process. If any resource fails to be downloaded,
   then the service worker won't be installed either.
*/
var offlineFundamentals = [
    
    './css/global.css',
    '/global.js'
];

/* The install event fires when the service worker is first installed.
   You can use this event to prepare the service worker to be able to serve
   files while visitors are offline.
*/
self.addEventListener("install", function (event) {
    console.log('WORKER: install event in progress.');
    /* Using event.waitUntil(p) blocks the installation process on the provided
       promise. If the promise is rejected, the service worker won't be installed.
    */
    event.waitUntil(
        /* The caches built-in is a promise-based API that helps you cache responses,
           as well as finding and deleting them.
        */
        caches
            /* You can open a cache by name, and this method returns a promise. We use
               a versioned cache name here so that we can remove old cache entries in
               one fell swoop later, when phasing out an older service worker.
            */
            .open(version + 'fundamentals')
            .then(function (cache) {
                /* After the cache is opened, we can fill it with the offline fundamentals.
                   The method below will add all resources in `offlineFundamentals` to the
                   cache, after making requests for them.
                */
               return cache.addAll(offlineFundamentals);
            })
            .then(function () {
                console.log('WORKER: install completed');
            }, function (err) {
                console.log('WORKER: error add'+ err);
            })
    );
});

/* The fetch event fires whenever a page controlled by this service worker requests
   a resource. This isn't limited to `fetch` or even XMLHttpRequest. Instead, it
   comprehends even the request for the HTML page on first load, as well as JS and
   CSS resources, fonts, any images, etc.
*/
self.addEventListener("fetch", function (event) {
    console.log('WORKER: fetch event in progress.');
    /* We should only cache GET requests, and deal with the rest of method in the
       client-side, by handling failed POST,PUT,PATCH,etc. requests.
    */
    if (event.request.method !== 'GET') {
        /* If we don't block the event as shown below, then the request will go to
           the network as usual.
        */
        console.log('WORKER: fetch event ignored.', event.request.method, event.request.url);
        return;
    }
    /* Similar to event.waitUntil in that it blocks the fetch event on a promise.
       Fulfillment result will be used as the response, and rejection will end in a
       HTTP response indicating failure.
    */
    event.respondWith(
        caches
            /* This method returns a promise that resolves to a cache entry matching
               the request. Once the promise is settled, we can then provide a response
               to the fetch request.
            */
            .match(event.request)
            .then(function (cached) {
                /* Even if the response is in our cache, we go to the network as well.
                   This pattern is known for producing "eventually fresh" responses,
                   where we return cached responses immediately, and meanwhile pull
                   a network response and store that in the cache.
        
                   Read more:
                   https://ponyfoo.com/articles/progressive-networking-serviceworker
                */
                var networked = fetch(event.request)
                    // We handle the network request with success and failure scenarios.
                    .then(fetchedFromNetwork, unableToResolve)
                    // We should catch errors on the fetchedFromNetwork handler as well.
                    .catch(unableToResolve);

                /* We return the cached response immediately if there is one, and fall
                   back to waiting on the network as usual.
                */
                console.log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
                return cached || networked;

                function fetchedFromNetwork(response) {
                    /* We copy the response before replying to the network request.
                       This is the response that will be stored on the ServiceWorker cache.
                    */
                    var cacheCopy = response.clone();

                    console.log('WORKER: fetch response from network.', event.request.url);

                    caches
                        // We open a cache to store the response for this request.
                        .open(version + 'pages')
                        .then(function add(cache) {
                            /* We store the response for this request. It'll later become
                               available to caches.match(event.request) calls, when looking
                               for cached responses.
                            */
                            cache.put(event.request, cacheCopy);
                        })
                        .then(function () {
                            console.log('WORKER: fetch response stored in cache.', event.request.url);
                        });

                    // Return the response so that the promise is settled in fulfillment.
                    return response;
                }

                /* When this method is called, it means we were unable to produce a response
                   from either the cache or the network. This is our opportunity to produce
                   a meaningful response even when all else fails. It's the last chance, so
                   you probably want to display a "Service Unavailable" view or a generic
                   error response.
                */
                function unableToResolve() {
                    /* There's a couple of things we can do here.
                       - Test the Accept header and then return one of the `offlineFundamentals`
                         e.g: `return caches.match('/some/cached/image.png')`
                       - You should also consider the origin. It's easier to decide what
                         "unavailable" means for requests against your origins than for requests
                         against a third party, such as an ad provider.
                       - Generate a Response programmaticaly, as shown below, and return that.
                    */

                    console.log('WORKER: fetch request failed in both cache and network.');

                    /* Here we're creating a response programmatically. The first parameter is the
                       response body, and the second one defines the options for the response.
                    */
                    return new Response('<h1>Service Unavailable</h1>', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/html'
                        })
                    });
                }
            })
    );
});

/* The activate event fires after a service worker has been successfully installed.
   It is most useful when phasing out an older version of a service worker, as at
   this point you know that the new worker was installed correctly. In this example,
   we delete old caches that don't match the version in the worker we just finished
   installing.
*/
var our_db, form_data, FOLDER_NAME = "post_requests";
openDatabase();

function openDatabase() {
    // if `flask-form` does not already exist in our browser (under our site), it is created
    var indexedDBOpenRequest = indexedDB.open('MyServiceTable', 123)
    indexedDBOpenRequest.onerror = function (error) {
        // error creating db
        console.error('IndexedDB error:', error)
    }
    indexedDBOpenRequest.onupgradeneeded = function () {
        // This should only executes if there's a need to 
        // create/update db.
        this.result.createObjectStore(FOLDER_NAME, {
            autoIncrement: true, keyPath: 'id'
        })
    }
    // This will execute each time the database is opened.
    indexedDBOpenRequest.onsuccess = function () {
        our_db = this.result
    }
}

self.addEventListener('message', function (event) {
   // console.log('form data', event.data)
    if (event.data.hasOwnProperty('formdata')) {
        // receives form data from script.js upon submission
        form_data = event.data.formdata;
    }
});
self.addEventListener("activate", function (event) {
    /* Just like with the install event, event.waitUntil blocks activate on a promise.
       Activation will fail unless the promise is fulfilled.
    */
    console.log('WORKER: activate event in progress.');

    event.waitUntil(
        caches
            /* This method returns a promise which will resolve to an array of available
               cache keys.
            */
            .keys()
            .then(function (keys) {
                // We return a promise that settles when all outdated caches are deleted.
                return Promise.all(
                    keys
                        .filter(function (key) {
                            // Filter by keys that don't start with the latest version prefix.
                            return !key.startsWith(version);
                        })
                        .map(function (key) {
                            /* Return a promise that's fulfilled
                               when each outdated cache is deleted.
                            */
                            return caches.delete(key);
                        })
                );
            })
            .then(function () {
                console.log('WORKER: activate completed.');
            })
    );
});
function getObjectStore(storeName, mode) {
    // retrieve our object store
    return our_db.transaction(storeName, mode
    ).objectStore(storeName)
}
function savePostRequests(url, payload) {
    // get object_store and save our payload inside it
    var request = getObjectStore(FOLDER_NAME, 'readwrite').add({
        url: url,
        payload: payload,
        method: 'POST'
    })
    request.onsuccess = function (event) {
        //console.log('a new pos_ request has been added to indexedb')
    }
    request.onerror = function (error) {
        console.error(error)
    }
}

self.addEventListener('fetch', function (event) {
    // every request from our site, passes through the fetch handler
    // I have proof
    console.log('I am a request with url: ',
        event.request.clone().url)
    if (event.request.clone().method === 'GET') {
        event.respondWith(
            // check all the caches in the browser and find
            // out whether our request is in any of them
            caches.match(event.request.clone())
                .then(function (response) {
                    if (response) {
                        // if we are here, that means there's a match
                        //return the response stored in browser
                        return response;
                    }
                    // no match in cache, use the network instead
                    return fetch(event.request.clone());
                }
                )
        );
    } else if (event.request.clone().method === 'POST') {
        // attempt to send request normally
        event.respondWith(fetch(event.request.clone()).catch(function
            (error) {
            // only save post requests in browser, if an error occurs
            savePostRequests(event.request.clone().url, form_data)
        }))
    }
});
function sendPostToServer() {
    var savedRequests = []
    var req = getObjectStore(FOLDER_NAME).openCursor() // FOLDERNAME
    req.onsuccess = async function (event) {
        var cursor = event.target.result
        if (cursor) {
            // Keep moving the cursor forward and collecting saved
            // requests.
            savedRequests.push(cursor.value)
            cursor.continue()
        } else {
            // At this point, we have collected all the post requests in
            // indexedb.
            for (let savedRequest of savedRequests) {
                // send them to the server one after the other
              
                var requestUrl = savedRequest.url
                var payload = JSON.stringify(savedRequest.payload)
                var method = savedRequest.method;
               
                var headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                } // if you have any other headers put them here
                fetch(requestUrl, {
                    headers: headers,
                    method: method,
                    body: payload
                }).then(function (response) {
                   
                    if (response.status < 400) {
                        // If sending the POST request was successful, then
                        // remove it from the IndexedDB.
                        getObjectStore(FOLDER_NAME,
                            'readwrite').delete(savedRequest.id)
                    }
                }).catch(function (error) {                  
                    console.error('Send to Server failed:', error);                   
                    throw error
                })
            }
        }
    }
}
self.addEventListener('sync', function (event) {
    console.log('now online');
    if (event.tag === 'sendFormData') {
        // event.tag name checked
        // here must be the same as the one used while registering sync
        event.waitUntil(
            sendPostToServer()
        )
    }
});




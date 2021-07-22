window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || { READ_WRITE: "readwrite" };
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}
var db;
var msg = {
    Success: true,
    Info: false,
    Detail: "Request processed successfully",
    //Error: "Something went wrong. Please try again"
};
openDatabase();
async function openDatabase() {
    return new Promise((resolve, reject) => {
        //var req = indexedDB.deleteDatabase("TestDatabase");       
        const request = indexedDB.open("iposDB", 2);
        request.onsuccess = function (event) {
            db = event.target.result;
            resolve(event.target.result);
        }
        request.onupgradeneeded = function (event) {
            db = event.target.result;
            // db.deleteObjectStore("products");
            // db.createObjectStore("salePreBind", { autoIncrement: true });
            if (!db.objectStoreNames.contains("salePreBind")) {
                db.createObjectStore("salePreBind", { keyPath: "key" });
            }
            if (!db.objectStoreNames.contains("products")) {
                db.createObjectStore("products", { keyPath: "key" });
            }
            if (!db.objectStoreNames.contains("customers")) {
                db.createObjectStore("customers", { keyPath: "key" });
            }
            if (!db.objectStoreNames.contains("navBarBind")) {
                db.createObjectStore("navBarBind", { keyPath: "key" });
            }
            if (!db.objectStoreNames.contains("bookingRequests")) {
                db.createObjectStore("bookingRequests", { keyPath: "key", autoIncrement: true });
            }
            if (!db.objectStoreNames.contains("salesRequests")) {
                db.createObjectStore("salesRequests", { keyPath: "key", autoIncrement: true });
            }

        }
    })
}

function storeOfflineData(tbl, data, key) {
    if (isOnline()) {
        if (db != undefined) {
            var transaction = db.transaction([tbl], "readwrite");
            var objStore = transaction.objectStore(tbl);
            if (tbl == "customers") {
                for (var i in data) {
                    var userData = data[i];
                    objStore.add({
                        userData,
                        key: userData.Data.AccessCode,
                    });
                }

            }
            else {
                objStore.add({
                    key: key,
                    data
                });
            }

        }
    }
}
async function PullOfflineData(url, data, method) {
    return new Promise((resolve, reject) => {
        if (db == undefined) {
            openDatabase()
                .then(dbase => {
                    db = dbase;
                    if (method == "Post")
                        savePostRequests(url, data, resolve)
                    else
                        pulldata(url, resolve);
                });
        }
        else {
            if (method == "Post")
                savePostRequests(url, data, resolve)
            else
                pulldata(url, resolve);
        }
    })
}
function pulldata(url, resolve) {
    // debugger
    var objStore, objectStoreRequest;
    if (db != undefined) {
        if (url.split('?')[0] == "/Sale/PreBind") {
            objStore = db.transaction('salePreBind').objectStore('salePreBind');
            objectStoreRequest = objStore.get("saleData");
            objectStoreRequest.onsuccess = function () {
                resolve(objectStoreRequest.result.data);
            };
        }
        else if (url.split('?')[0] == "/Generic/NavbarShop") {
            objStore = db.transaction('navBarBind').objectStore('navBarBind');
            objectStoreRequest = objStore.get("navbar");
            objectStoreRequest.onsuccess = function () {
                resolve(objectStoreRequest.result.data);
            };
        }
        else if (url.split('?')[0] == "/Sale/FetchUser") {
            var data = FetchParameterByName("code", url, false);
            objStore = db.transaction('customers').objectStore('customers');
            objectStoreRequest = objStore.get(data);
            objectStoreRequest.onsuccess = function () {
                resolve(objectStoreRequest.result.userData);
            };
        }
        else if (url.split('?')[0] == "/Generic/FindProduct") {
            var custCode = FetchParameterByName("customerCode", url, false);
            var val = FetchParameterByName("value", url, false);
            objStore = db.transaction('products').objectStore('products');
            objectStoreRequest = objStore.get("prod");
            objectStoreRequest.onsuccess = function () {
                var fetchedProducts = objectStoreRequest.result.data;
                fetchedProducts.Data = fetchedProducts.Data.filter(x => x.CustomerCode == custCode && x.Name.match(val)).slice(0, 4);
                // fetchedProducts.Data = fetchedProducts.Data.slice(0,4);
                resolve(fetchedProducts);
            };

        }
    }

}

function ToggleOnlineOffline(obj) {
    UpdateStatus();
    if (isOnline()) {
        //sync objects
        Get("/Generic/OfflineData").then(function (d) {
            //  debugger
            storeOfflineData("customers", d.Data.saleFetchUser);
            storeOfflineData("products", d.Data.findProduct, "prod");
            // addLocal("salePreBind", d.Data.salePreBind);
            //addLocal("saleFetchUser", d.Data.saleFetchUser);
            //addLocal("findProduct", d.Data.findProduct);

        })
    }
    else {
        //push objects
    }
}

function savePostRequests(url, data, resolve) {
    debugger
    var tbl = "salesRequests";
    if (db != undefined) {
        //if (url.split('?')[0] == "/Sale/Booking") {
        //    tbl = "bookingRequests";        
        //}
        //else if (url.split('?')[0] == "/Sale/Save" || url.split('?')[0] == "/Sale/Update") {
        //    tbl = "salesRequests";
        //}
        var transaction = db.transaction([tbl], "readwrite");
        var objStore = transaction.objectStore(tbl);
        var request = objStore.add({
            url: url,
            data: data
            //method: 'POST'
        });
        request.onsuccess = function (event) {
            msg.Info = true;
            msg.Detail = "Your order is stored offline";
            resolve(msg);
        }
        request.onerror = function (error) {
            msg.Success = false;
            msg.Detail = "Something went wrong.Please try again";
            console.error(error);
            resolve(msg);
        }
    }

}





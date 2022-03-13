// const indexedDB =
//   window.indexedDB ||
//   window.mozIndexedDB ||
//   window.webkitIndexedDB ||
//   window.msIndexedDB ||
//   window.shimIndexedDB;

let db;
const request = indexedDB.open("Budget-Tracker", 1);

request.onupgradeneeded = ({ target }) => {
  let db = target.result;
  db.createObjectStore("new_sheet", { autoIncrement: true });
};

request.onsuccess = ({ target }) => {
  db = target.result;

 
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  console.log("You Made a Whoopsy! " + event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["new_sheet"], "readwrite");
  const store = transaction.objectStore("new_sheet");

  store.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(["new_sheet"], "readwrite");
  const store = transaction.objectStore("new_sheet");
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => {        
        return response.json();
      })
      .then(() => {
        const transaction = db.transaction(["new_sheet"], "readwrite");
        const store = transaction.objectStore("new_sheet");
        store.clear();
      });
    }
  };
}



window.addEventListener("online", checkDatabase);
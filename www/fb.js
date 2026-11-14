/* One-Board : adaptateur Firebase (Auth + Firestore) pour la synchro.
   Définit window.OB_SYNC si window.OB_FIREBASE existe. Le SDK n'est chargé qu'au besoin. */
(function () {
  var CFG = window.OB_FIREBASE;
  if (!CFG) return;
  var BASE = 'https://www.gstatic.com/firebasejs/10.12.2/';
  var cbs = [], user, ready = null, auth = null, db = null;
  function load(src) {
    return new Promise(function (ok, ko) {
      var s = document.createElement('script');
      s.src = src; s.onload = ok; s.onerror = function () { ko({ code: 'network-request-failed' }); };
      document.head.appendChild(s);
    });
  }
  function init() {
    if (ready) return ready;
    ready = load(BASE + 'firebase-app-compat.js')
      .then(function () { return Promise.all([load(BASE + 'firebase-auth-compat.js'), load(BASE + 'firebase-firestore-compat.js')]); })
      .then(function () {
        firebase.initializeApp(CFG);
        auth = firebase.auth(); db = firebase.firestore();
        try { db.settings({ experimentalAutoDetectLongPolling: true, merge: true }); } catch (e) {}
        auth.onAuthStateChanged(function (u) {
          user = u ? { email: u.email, uid: u.uid } : null;
          cbs.forEach(function (cb) { cb(user); });
        });
      });
    ready.catch(function () { ready = null; });
    return ready;
  }
  function ref() { return db.collection('users').doc(auth.currentUser.uid).collection('data').doc('main'); }
  window.OB_SYNC = {
    onAuth: function (cb) { cbs.push(cb); if (user !== undefined) cb(user); init().catch(function () {}); },
    signIn: function (e, p) { return init().then(function () { return auth.signInWithEmailAndPassword(e, p); }); },
    signUp: function (e, p) { return init().then(function () { return auth.createUserWithEmailAndPassword(e, p); }); },
    /* Connexion Google : retire le préfixe « _ » une fois le fournisseur activé dans la console Firebase. */
    _google: function () { return init().then(function () { return auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); }); },
    reset: function (e) { return init().then(function () { return auth.sendPasswordResetEmail(e); }); },
    signOut: function () { return init().then(function () { return auth.signOut(); }); },
    transact: function (fn) {
      return init().then(function () {
        var r = ref();
        return db.runTransaction(function (tx) {
          return tx.get(r).then(function (snap) {
            var out = fn(snap.exists ? snap.data().d : null);
            if (out !== null && out !== undefined) tx.set(r, { d: out, t: Date.now(), v: 1 });
          });
        });
      });
    },
    listen: function (cb) {
      var un = null;
      init().then(function () { un = ref().onSnapshot(function () { cb(); }, function () {}); }).catch(function () {});
      return function () { if (un) un(); };
    }
  };
})();

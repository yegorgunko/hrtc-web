import { register } from "register-service-worker";
import { auth, firestore, messaging } from "boot/firebase";
import { vapidKey } from "../src/firebase.config";

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register("firebase-messaging-sw.js", {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready(/* registration */) {
    // console.log('Service worker is active.')
  },

  registered(registration) {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = firestore.collection("users").doc(auth.currentUser.uid);
        const data = await userRef.get();
        if (data.exists && !data.tokenId) {
          userRef.set(
            {
              tokenId: await messaging.getToken({
                vapidKey,
                serviceWorkerRegistration: registration,
              }),
            },
            { merge: true }
          );
        }
      }
    });
  },

  cached(/* registration */) {
    // console.log('Content has been cached for offline use.')
  },

  updatefound(/* registration */) {
    // console.log('New content is downloading.')
  },

  updated(/* registration */) {
    // console.log('New content is available; please refresh.')
  },

  offline() {
    // console.log('No internet connection found. App is running in offline mode.')
  },

  error(/* err */) {
    // console.error('Error during service worker registration:', err)
  },
});

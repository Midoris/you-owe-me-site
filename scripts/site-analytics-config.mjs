export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDOsFoz3lixG5KA7aGu_IQg_N3Pc_tIpt4",
  authDomain: "you-owe-me-app.firebaseapp.com",
  databaseURL: "https://you-owe-me-app.firebaseio.com",
  projectId: "you-owe-me-app",
  storageBucket: "you-owe-me-app.firebasestorage.app",
  messagingSenderId: "1056899447246",
  appId: "1:1056899447246:web:9880554b4d5bf68003539f",
  measurementId: "G-TJDLPVM702",
};

export function isSiteAnalyticsHost(hostname) {
  return hostname === "you-owe-me.com" || hostname === "www.you-owe-me.com";
}

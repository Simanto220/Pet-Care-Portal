// Firebase disabled — using JWT-only authentication
// Google/Facebook login not configured

const auth = {
  currentUser: null,
};

const signOut = async () => {
  // handled by localStorage removal in App.jsx
};

const onAuthStateChanged = (auth, callback) => {
  // No Firebase — always returns null (JWT handles auth)
  callback(null);
  return () => {}; // unsubscribe noop
};

const provider = null;
const signInWithPopup = async () => {
  throw new Error("Google login is not configured.");
};

export { auth, provider, signInWithPopup, signOut, onAuthStateChanged };

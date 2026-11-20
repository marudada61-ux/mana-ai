import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile
} from './firebase-auth.js';

const screen = document.getElementById('authScreen');
const form = document.getElementById('authForm');
const title = document.getElementById('authTitle');
const nameField = document.getElementById('authName');
const message = document.getElementById('authMessage');
const submit = document.getElementById('authSubmit');

let mode = 'login';

function showMessage(text) {
  message.textContent = text;
}

function setMode(next) {
  mode = next;
  title.textContent = mode === 'login' ? 'Welcome Back' : 'Create Account';
  nameField.style.display = mode === 'signup' ? 'block' : 'none';
  submit.textContent = mode === 'login' ? 'Login' : 'Sign Up';
  showMessage('');
}

document.getElementById('showSignup').onclick = () => setMode('signup');
document.getElementById('showLogin').onclick = () => setMode('login');

document.getElementById('forgotPassword').onclick = async () => {
  const email = document.getElementById('authEmail').value.trim();
  if (!email) return showMessage('ముందుగా Email ఇవ్వండి.');
  try {
    await sendPasswordResetEmail(auth, email);
    showMessage('Password reset link మీ Email‌కు పంపించాం.');
  } catch (error) {
    showMessage(error.message);
  }
};

form.addEventListener('submit', async event => {
  event.preventDefault();
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  submit.disabled = true;
  try {
    if (mode === 'signup') {
      const name = nameField.value.trim();
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(result.user, { displayName: name });
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (error) {
    showMessage(error.message);
  } finally {
    submit.disabled = false;
  }
});

onAuthStateChanged(auth, user => {
  screen.style.display = user ? 'none' : 'grid';
  document.getElementById('appShell').style.display = user ? 'flex' : 'none';
  document.getElementById('userEmail').textContent = user?.email || '';
});

document.getElementById('logoutButton').onclick = () => signOut(auth);

// MANA AI Profile Menu
const profileMenu = document.getElementById('profileMenu');

document.getElementById('profileButton').onclick = () => {
  const user = auth.currentUser;

  document.getElementById('profileName').textContent =
    user?.displayName || 'My Profile';

  document.getElementById('profileEmail').textContent =
    user?.email || '';

  profileMenu.style.display =
    profileMenu.style.display === 'none' ? 'block' : 'none';
};

document.getElementById('closeProfile').onclick = () => {
  profileMenu.style.display = 'none';
};

const profilePhotoInput = document.getElementById('profilePhotoInput');
const profileAvatar = document.getElementById('profileAvatar');

function showProfilePhoto(photo) {
  profileAvatar.innerHTML =
    `<img src="${photo}" style="width:90px;height:90px;border-radius:50%;object-fit:cover;">`;
}

const savedPhoto = localStorage.getItem('manaProfilePhoto');
if (savedPhoto) showProfilePhoto(savedPhoto);

profilePhotoInput.onchange = event => {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('దయచేసి Image ఎంచుకోండి.');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const size = Math.min(img.width, img.height);
      ctx.drawImage(img,
        (img.width-size)/2, (img.height-size)/2,
        size, size, 0, 0, 256, 256);

      const photo = canvas.toDataURL('image/jpeg', 0.75);
      try {
        localStorage.setItem('manaProfilePhoto', photo);
        showProfilePhoto(photo);
        alert('Profile Picture Saved!');
      } catch (error) {
        alert('Photo Save కాలేదు. మరో చిన్న Image ప్రయత్నించండి.');
      }
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
};

// Dark and Light Theme
const themeButton = document.getElementById('themeButton');

if (localStorage.getItem('manaTheme') === 'light') {
  document.body.classList.add('light');
}

themeButton.onclick = () => {
  document.body.classList.toggle('light');

  const theme = document.body.classList.contains('light')
    ? 'light'
    : 'dark';

  localStorage.setItem('manaTheme', theme);

  themeButton.textContent = theme === 'light'
    ? '🌙 Switch to Dark Mode'
    : '☀️ Switch to Light Mode';
};

themeButton.textContent =
  document.body.classList.contains('light')
    ? '🌙 Switch to Dark Mode'
    : '☀️ Switch to Light Mode';

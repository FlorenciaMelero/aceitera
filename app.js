const DB_NAME = 'mpLubricentroDB';
const DB_VERSION = 2;
const STORE_CONFIG = [
  { name: 'vehicles', keyPath: 'id', indexes: ['license', 'owner'] },
  { name: 'oilChanges', keyPath: 'id', indexes: ['vehicleId', 'date'] },
  { name: 'maintenance', keyPath: 'id', indexes: ['vehicleId', 'date'] },
  { name: 'parts', keyPath: 'id', indexes: ['vehicleId', 'partCode'] },
  { name: 'users', keyPath: 'id', indexes: ['email'] }
];

let db;
let currentUser = null;

// Simulated password hashing (NOT for production)
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function initAuth() {
  const savedUser = localStorage.getItem('mpLubrAuth');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      if (!currentUser.role) currentUser.role = 'user';
      updateAuthUI();
    } catch (e) {
      localStorage.removeItem('mpLubrAuth');
    }
  }
}

function updateAuthUI() {
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const userMenu = document.getElementById('user-menu');
  const userName = document.getElementById('user-name');
  const bgDecoration = document.getElementById('bg-decoration');
  
  if (currentUser) {
    loginBtn.style.display = 'none';
    signupBtn.style.display = 'none';
    userMenu.style.display = 'block';
    userName.textContent = currentUser.name.split(' ')[0];
    document.querySelector('main').style.display = 'block';
    bgDecoration.style.display = currentUser.role === 'admin' ? 'block' : 'none';
  } else {
    loginBtn.style.display = 'block';
    signupBtn.style.display = 'block';
    userMenu.style.display = 'none';
    document.querySelector('main').style.display = 'none';
    bgDecoration.style.display = 'none';
    closeMenuDropdown();
  }
}

function toggleMenuDropdown() {
  const dropdown = document.getElementById('user-menu-dropdown');
  const toggle = document.getElementById('user-menu-toggle');
  dropdown.classList.toggle('active');
  toggle.classList.toggle('active');
}

function closeMenuDropdown() {
  const dropdown = document.getElementById('user-menu-dropdown');
  const toggle = document.getElementById('user-menu-toggle');
  dropdown.classList.remove('active');
  toggle.classList.remove('active');
}

function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

function showProfileModal() {
  document.getElementById('profile-name').textContent = currentUser.name;
  document.getElementById('profile-email').textContent = currentUser.email;
  const date = new Date().toLocaleDateString('es-AR');
  document.getElementById('profile-date').textContent = date;
  openModal('profile-modal');
  closeMenuDropdown();
}

function showEditProfileModal() {
  document.getElementById('edit-name').value = currentUser.name;
  document.getElementById('edit-email').value = currentUser.email;
  openModal('edit-profile-modal');
  closeMenuDropdown();
}

function showPasswordModal() {
  openModal('password-modal');
  closeMenuDropdown();
}

function showDeleteAccountModal() {
  openModal('delete-account-modal');
  closeMenuDropdown();
}

function showAuthModal() {
  document.getElementById('auth-modal').classList.add('active');
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.remove('active');
}

function switchToLogin() {
  document.getElementById('login-form-container').classList.add('active');
  document.getElementById('signup-form-container').classList.remove('active');
}

function switchToSignup() {
  document.getElementById('signup-form-container').classList.add('active');
  document.getElementById('login-form-container').classList.remove('active');
}

let db;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = event => {
      db = event.target.result;
      STORE_CONFIG.forEach(store => {
        if (!db.objectStoreNames.contains(store.name)) {
          const objectStore = db.createObjectStore(store.name, { keyPath: store.keyPath });
          store.indexes.forEach(index => objectStore.createIndex(index, index, { unique: false }));
        }
      });
    };

    request.onsuccess = event => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = () => reject(request.error);
  });
}

function saveRecord(storeName, record) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(record);
    request.onsuccess = () => resolve(record);
    request.onerror = () => reject(request.error);
  });
}

function loadAll(storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function generateId(prefix = '') {
  return `${prefix}${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function updateStatus(message, success = true) {
  const statusEl = document.getElementById('db-status');
  statusEl.textContent = message;
  statusEl.style.color = success ? '#1f8a5e' : '#d14343';
}

function setActiveTab(targetId) {
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.toggle('active', button.dataset.target === targetId);
  });
  document.querySelectorAll('.tab-section').forEach(section => {
    section.classList.toggle('active', section.id === targetId);
  });
}

function fillVehicleOptions() {
  loadAll('vehicles').then(vehicles => {
    const selects = document.querySelectorAll('#oil-vehicle, #maintenance-vehicle, #part-vehicle');
    selects.forEach(select => {
      select.innerHTML = '<option value="">Seleccionar vehículo</option>';
      vehicles.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle.id;
        option.textContent = `${vehicle.license} • ${vehicle.make} ${vehicle.model}`;
        select.appendChild(option);
      });
    });
    refreshTables();
  });
}

function refreshTables() {
  Promise.all([
    loadAll('vehicles'),
    loadAll('oilChanges'),
    loadAll('maintenance'),
    loadAll('parts')
  ]).then(([vehicles, oils, maintenance, parts]) => {
    const vehicleMap = new Map(vehicles.map(v => [v.id, v.license]));
    document.getElementById('vehicle-table').querySelector('tbody').innerHTML = vehicles.map(vehicle => `
      <tr>
        <td>${vehicle.license}</td>
        <td>${vehicle.make || '-'}</td>
        <td>${vehicle.model || '-'}</td>
        <td>${vehicle.year || '-'}</td>
        <td>${vehicle.km || '-'}</td>
        <td>${vehicle.owner || '-'}</td>
      </tr>
    `).join('');

    document.getElementById('oil-table').querySelector('tbody').innerHTML = oils.map(item => `
      <tr>
        <td>${vehicleMap.get(item.vehicleId) || 'Sin vehículo'}</td>
        <td>${item.date}</td>
        <td>${item.type || '-'}</td>
        <td>${item.km || '-'}</td>
        <td>${item.notes || '-'}</td>
      </tr>
    `).join('');

    document.getElementById('maintenance-table').querySelector('tbody').innerHTML = maintenance.map(item => `
      <tr>
        <td>${vehicleMap.get(item.vehicleId) || 'Sin vehículo'}</td>
        <td>${item.date}</td>
        <td>${item.description || '-'}</td>
        <td>${item.cost ? '$' + Number(item.cost).toFixed(2) : '-'}</td>
        <td>${item.status || '-'}</td>
      </tr>
    `).join('');

    document.getElementById('parts-table').querySelector('tbody').innerHTML = parts.map(item => `
      <tr>
        <td>${item.partName || '-'}</td>
        <td>${item.partCode || '-'}</td>
        <td>${vehicleMap.get(item.vehicleId) || 'Sin vehículo'}</td>
        <td>${item.quantity || '-'}</td>
        <td>${item.cost ? '$' + Number(item.cost).toFixed(2) : '-'}</td>
      </tr>
    `).join('');

    document.getElementById('report-vehicles').textContent = vehicles.length;
    document.getElementById('report-oil').textContent = oils.length;
    document.getElementById('report-maintenance').textContent = maintenance.length;
    document.getElementById('report-parts').textContent = parts.length;
  });
}

function attachForms() {
  document.getElementById('vehicle-form').addEventListener('submit', event => {
    event.preventDefault();
    const vehicle = {
      id: generateId('veh-'),
      license: document.getElementById('vehicle-license').value.trim().toUpperCase(),
      make: document.getElementById('vehicle-make').value.trim(),
      model: document.getElementById('vehicle-model').value.trim(),
      year: document.getElementById('vehicle-year').value.trim(),
      km: document.getElementById('vehicle-km').value.trim(),
      owner: document.getElementById('vehicle-owner').value.trim(),
      phone: document.getElementById('vehicle-phone').value.trim()
    };
    saveRecord('vehicles', vehicle).then(() => {
      event.target.reset();
      fillVehicleOptions();
    });
  });

  document.getElementById('oil-form').addEventListener('submit', event => {
    event.preventDefault();
    const record = {
      id: generateId('oil-'),
      vehicleId: document.getElementById('oil-vehicle').value,
      date: document.getElementById('oil-date').value,
      type: document.getElementById('oil-type').value.trim(),
      km: document.getElementById('oil-km').value.trim(),
      notes: document.getElementById('oil-notes').value.trim()
    };
    saveRecord('oilChanges', record).then(() => event.target.reset());
  });

  document.getElementById('maintenance-form').addEventListener('submit', event => {
    event.preventDefault();
    const record = {
      id: generateId('mnt-'),
      vehicleId: document.getElementById('maintenance-vehicle').value,
      date: document.getElementById('maintenance-date').value,
      description: document.getElementById('maintenance-description').value.trim(),
      cost: document.getElementById('maintenance-cost').value.trim(),
      status: document.getElementById('maintenance-status').value
    };
    saveRecord('maintenance', record).then(() => event.target.reset());
  });

  document.getElementById('parts-form').addEventListener('submit', event => {
    event.preventDefault();
    const record = {
      id: generateId('prt-'),
      partName: document.getElementById('part-name').value.trim(),
      partCode: document.getElementById('part-code').value.trim(),
      vehicleId: document.getElementById('part-vehicle').value,
      quantity: document.getElementById('part-quantity').value.trim(),
      cost: document.getElementById('part-cost').value.trim()
    };
    saveRecord('parts', record).then(() => event.target.reset());
  });

  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => setActiveTab(button.dataset.target));
  });
}

function seedSampleData() {
  loadAll('vehicles').then(vehicles => {
    if (vehicles.length > 0) return;
    const samples = [
      {
        id: generateId('veh-'),
        license: 'ABC123',
        make: 'Toyota',
        model: 'Corolla',
        year: '2018',
        km: '56000',
        owner: 'Juan Pérez',
        phone: '3511234567'
      },
      {
        id: generateId('veh-'),
        license: 'DEF456',
        make: 'Volkswagen',
        model: 'Amarok',
        year: '2021',
        km: '82000',
        owner: 'María López',
        phone: '3517654321'
      }
    ];
    Promise.all(samples.map(item => saveRecord('vehicles', item))).then(() => {
      fillVehicleOptions();
    });
  });
}

function seedSampleUsers() {
  loadAll('users').then(users => {
    if (users.length > 0) return;
    const adminUser = {
      id: generateId('usr-'),
      name: 'Administrador',
      email: 'admin@lubricentro.local',
      role: 'admin',
      passwordHash: hashPassword('Admin123!')
    };
    const regularUser = {
      id: generateId('usr-'),
      name: 'Cliente Ejemplo',
      email: 'usuario@lubricentro.local',
      role: 'user',
      passwordHash: hashPassword('Usuario123!')
    };

    Promise.all([saveRecord('users', adminUser), saveRecord('users', regularUser)]).then(() => {
      console.log('Usuarios de ejemplo creados');
    });
  });
}

function attachAuthHandlers() {
  const modal = document.getElementById('auth-modal');
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const modalClose = document.querySelector('.modal-close');
  const switchToSignupBtn = document.getElementById('switch-to-signup');
  const switchToLoginBtn = document.getElementById('switch-to-login');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  loginBtn.addEventListener('click', showAuthModal);
  signupBtn.addEventListener('click', () => {
    showAuthModal();
    switchToSignup();
  });
  logoutBtn.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('mpLubrAuth');
    updateAuthUI();
  });
  modalClose.addEventListener('click', closeAuthModal);
  switchToSignupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    switchToSignup();
  });
  switchToLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    switchToLogin();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeAuthModal();
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) return;

    try {
      const users = await loadAll('users');
      const user = users.find(u => u.email === email);
      
      if (!user) {
        showAuthError('Email o contraseña incorrectos');
        return;
      }

      if (user.passwordHash !== hashPassword(password)) {
        showAuthError('Email o contraseña incorrectos');
        return;
      }

      currentUser = { id: user.id, email: user.email, name: user.name, role: user.role || 'user' };
      localStorage.setItem('mpLubrAuth', JSON.stringify(currentUser));
      updateAuthUI();
      closeAuthModal();
      loginForm.reset();
    } catch (error) {
      showAuthError('Error al procesar el login');
    }
  });

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById('signup-password-confirm').value;

    if (!name || !email || !password || !passwordConfirm) return;

    if (password !== passwordConfirm) {
      showAuthError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      showAuthError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const users = await loadAll('users');
      if (users.find(u => u.email === email)) {
        showAuthError('Este email ya está registrado');
        return;
      }

      const newUser = {
        id: generateId('usr-'),
        name,
        email,
        role: 'user',
        passwordHash: hashPassword(password)
      };

      await saveRecord('users', newUser);
      currentUser = { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role };
      localStorage.setItem('mpLubrAuth', JSON.stringify(currentUser));
      updateAuthUI();
      closeAuthModal();
      signupForm.reset();
    } catch (error) {
      showAuthError('Error al crear la cuenta');
    }
  });

  // Menu dropdown handlers
  document.getElementById('user-menu-toggle').addEventListener('click', toggleMenuDropdown);
  document.getElementById('profile-btn').addEventListener('click', showProfileModal);
  document.getElementById('settings-btn').addEventListener('click', showEditProfileModal);
  document.getElementById('change-password-btn').addEventListener('click', showPasswordModal);
  document.getElementById('delete-account-btn').addEventListener('click', showDeleteAccountModal);

  // Modal close handlers
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal.id);
    });
  });

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) closeModal(modal.id);
    });
  });

  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) closeModal(modal.id);
    });
  });

  document.getElementById('close-profile-btn').addEventListener('click', () => closeModal('profile-modal'));

  // Edit profile form
  document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newName = document.getElementById('edit-name').value.trim();
    const newEmail = document.getElementById('edit-email').value.trim();

    if (!newName || !newEmail) return;

    try {
      const users = await loadAll('users');
      const emailExists = users.find(u => u.email === newEmail && u.id !== currentUser.id);
      
      if (emailExists) {
        showEditProfileError('Este email ya está en uso');
        return;
      }

      const user = users.find(u => u.id === currentUser.id);
      if (user) {
        user.name = newName;
        user.email = newEmail;
        await saveRecord('users', user);
        currentUser.name = newName;
        currentUser.email = newEmail;
        localStorage.setItem('mpLubrAuth', JSON.stringify(currentUser));
        updateAuthUI();
        closeModal('edit-profile-modal');
        showNotification('Perfil actualizado correctamente');
      }
    } catch (error) {
      showEditProfileError('Error al actualizar el perfil');
    }
  });

  // Change password form
  document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!currentPassword || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      showPasswordError('Las nuevas contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      showPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const users = await loadAll('users');
      const user = users.find(u => u.id === currentUser.id);
      
      if (!user || user.passwordHash !== hashPassword(currentPassword)) {
        showPasswordError('La contraseña actual es incorrecta');
        return;
      }

      if (currentPassword === newPassword) {
        showPasswordError('La nueva contraseña debe ser diferente');
        return;
      }

      user.passwordHash = hashPassword(newPassword);
      await saveRecord('users', user);
      closeModal('password-modal');
      document.getElementById('password-form').reset();
      showNotification('Contraseña cambiada correctamente');
    } catch (error) {
      showPasswordError('Error al cambiar la contraseña');
    }
  });

  // Delete account confirmation
  document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    const deletePassword = document.getElementById('delete-password').value;

    if (!deletePassword) {
      showDeleteError('Ingresa tu contraseña para confirmar');
      return;
    }

    try {
      const users = await loadAll('users');
      const user = users.find(u => u.id === currentUser.id);
      
      if (!user || user.passwordHash !== hashPassword(deletePassword)) {
        showDeleteError('Contraseña incorrecta');
        return;
      }

      // Delete user account
      const tx = db.transaction('users', 'readwrite');
      const store = tx.objectStore('users');
      await new Promise((resolve, reject) => {
        const request = store.delete(currentUser.id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      currentUser = null;
      localStorage.removeItem('mpLubrAuth');
      updateAuthUI();
      closeModal('delete-account-modal');
      document.getElementById('delete-password').value = '';
      showNotification('Cuenta eliminada permanentemente');
    } catch (error) {
      showDeleteError('Error al eliminar la cuenta');
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const userMenu = document.getElementById('user-menu');
    const dropdown = document.getElementById('user-menu-dropdown');
    const toggle = document.getElementById('user-menu-toggle');
    
    if (userMenu && !userMenu.contains(e.target)) {
      closeMenuDropdown();
    }
  });
}

function showEditProfileError(message) {
  showModalError('edit-profile-modal', message);
}

function showPasswordError(message) {
  showModalError('password-modal', message);
}

function showDeleteError(message) {
  showModalError('delete-account-modal', message);
}

function showModalError(modalId, message) {
  const modal = document.getElementById(modalId);
  const existingError = modal.querySelector('.auth-error');
  if (existingError) existingError.remove();
  
  const errorEl = document.createElement('div');
  errorEl.className = 'auth-error';
  errorEl.textContent = message;
  modal.querySelector('.modal-content').insertBefore(errorEl, modal.querySelector('.modal-content').children[1]);
  
  setTimeout(() => errorEl.remove(), 4000);
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    background: rgba(46, 204, 113, 0.2);
    border: 1px solid rgba(46, 204, 113, 0.4);
    color: #2ecc71;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    z-index: 2000;
    animation: slideDown 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 3000);
}

function showAuthError(message) {
  const activeContainer = document.querySelector('.auth-form-container.active');
  const existingError = activeContainer.querySelector('.auth-error');
  if (existingError) existingError.remove();
  
  const errorEl = document.createElement('div');
  errorEl.className = 'auth-error';
  errorEl.textContent = message;
  activeContainer.insertBefore(errorEl, activeContainer.firstChild);
  
  setTimeout(() => errorEl.remove(), 4000);
}

openDatabase()
  .then(() => {
    initAuth();
    attachAuthHandlers();
    updateStatus('Base local lista y funcionando');
    attachForms();
    fillVehicleOptions();
    seedSampleData();
    seedSampleUsers();
  })
  .catch(error => {
    console.error(error);
    updateStatus('Error inicializando la base local', false);
  });

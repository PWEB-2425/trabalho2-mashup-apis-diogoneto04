// Para index.html
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const username = loginForm.username.value;
    const password = loginForm.password.value;
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) window.location = '/dashboard.html';
    else alert('Login inválido!');
  };
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.onsubmit = async (e) => {
    e.preventDefault();
    const username = registerForm.username.value;
    const password = registerForm.password.value;
    const res = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) alert('Registado! Faça login.');
    else alert('Erro no registo.');
  };
}

// Para dashboard.html
if (window.location.pathname.endsWith('dashboard.html')) {
  // Só entra aqui se está no dashboard
  fetch('/auth/check')
    .then(res => res.json())
    .then(data => {
      if (!data.authenticated) window.location = '/';
      else carregarHistorico();
    });

  // Pesquisa
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.onsubmit = async (e) => {
      e.preventDefault();
      const termo = searchForm.termo.value;
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termo })
      });
      const data = await res.json();
      if (data.error) {
        document.getElementById('resultados').innerText = data.error;
      } else {
        document.getElementById('resultados').innerHTML = `
          <h3>Clima:</h3>
          <p>${data.weather.weather[0].description}, ${data.weather.main.temp}°C em ${data.weather.name}</p>
          <h3>Wikipedia:</h3>
          <p>${data.summary.extract}</p>
        `;
        carregarHistorico();
      }
    };
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      await fetch('/auth/logout');
      window.location = '/';
    };
  }

 function carregarHistorico() {
  fetch('/api/history')
    .then(res => res.json())
    .then(data => {
      console.log(data); 
      const ul = document.getElementById('history');
      ul.innerHTML = '';
      if (data.history && data.history.length) {
        data.history.slice().reverse().forEach(item => {
          const li = document.createElement('li');
          li.innerHTML = `
            <strong>${item.term}</strong>
            <span style="color:#888; font-size:13px;">
              (${new Date(item.date).toLocaleString('pt-PT')})
            </span>
          `;
          ul.appendChild(li);
        });
      } else {
        ul.innerHTML = '<li style="color:#aaa;">Sem pesquisas ainda.</li>';
      }
    });
}

}
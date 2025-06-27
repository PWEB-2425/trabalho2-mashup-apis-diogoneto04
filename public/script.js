const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: loginForm.username.value,
                password: loginForm.password.value
            })
        });
        if (res.ok) window.location = '/dashboard.html';
        else alert('Login inválido!');
    };
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.onsubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: registerForm.username.value,
                password: registerForm.password.value
            })
        });
        if (res.ok) alert('Registado! Faça login.');
        else alert('Erro no registo.');
    };
}

if (window.location.pathname.endsWith('dashboard.html')) {
    fetch('/auth/check')
        .then(res => res.json())
        .then(data => {
            if (!data.authenticated) window.location = '/';
            else carregarHistorico();
        });

    const searchForm = document.getElementById('searchForm');
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
                <div class="card">
                    ${data.image ? `<img src="${data.image}" alt="${termo}" class="cidade-img">` : ''}
                    <h3>Clima:</h3>
                    <p>${data.weather.weather[0].description}, ${data.weather.main.temp}°C em ${data.weather.name}</p>
                    <h3>Wikipedia:</h3>
                    <p>${data.summary.extract}</p>
                </div>
            `;
            carregarHistorico();
        }
    };

    document.getElementById('logoutBtn').onclick = async () => {
        await fetch('/auth/logout');
        window.location = '/';
    };

    function carregarHistorico() {
        fetch('/api/history')
            .then(res => res.json())
            .then(data => {
                const ul = document.getElementById('history');
                ul.innerHTML = '';
                if (data.history.length) {
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

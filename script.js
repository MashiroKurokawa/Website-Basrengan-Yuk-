// ==========================================
// 1. FITUR NAVIGASI & DARK MODE
// ==========================================
function navigate(targetView) {
    if (targetView === 'track' && !isLoggedIn) {
        alert("Silakan Log In atau Sign Up terlebih dahulu untuk melacak pesananmu.");
        return;
    }
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('nav-active'));

    document.getElementById(`view-${targetView}`).classList.add('active');
    if(document.getElementById(`nav-btn-${targetView}`)) document.getElementById(`nav-btn-${targetView}`).classList.add('nav-active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-mode');
    document.getElementById('theme-icon').innerText = body.classList.contains('light-mode') ? '🌙' : '☀️';
}

// ==========================================
// 2. DATABASE SEMENTARA & STATUS PESANAN
// ==========================================
let isLoggedIn = false;
let orderStatus = "empty"; 
let currentOrder = { name: "", price: 0 };
let currentDiscount = 0;

let usersDB = []; 
let tempPhone = ""; 
let tempPass = "";
let isSignupFlow = false; 

const indoPhoneRegex = /^(08|\+62)\d{8,11}$/;

// KONTAK ADMIN
const adminWA = "https://wa.me/6283898115619";
const adminEmail = "mailto:basrenganyuk@gmail.com";

// ==========================================
// 3. FITUR AUTENTIKASI (LOGIN/SIGN UP/OTP)
// ==========================================
function openAuthModal(type) {
    document.getElementById('auth-overlay').style.display = 'flex';
    switchAuthView(type);
}
function closeAuthModal() {
    document.getElementById('auth-overlay').style.display = 'none';
}
function switchAuthView(type) {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.getElementById(`form-${type}`).classList.add('active');
}
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;
    if (input.type === "password") {
        input.type = "text"; icon.innerText = "🙈";
    } else {
        input.type = "password"; icon.innerText = "👁️";
    }
}

function processSignup(event) {
    event.preventDefault(); 
    const phone = document.getElementById('signup-phone').value;
    const pass = document.getElementById('signup-pass').value;
    
    if(!indoPhoneRegex.test(phone)) {
        alert("Gagal! Gunakan format nomor telepon Indonesia (mulai dengan 08 atau +62).");
        return;
    }

    const userExists = usersDB.find(u => u.phone === phone);
    if(userExists) {
        alert("Pemberitahuan: Nomor WhatsApp ini sudah terdaftar! Anda akan dialihkan ke halaman Log In.");
        switchAuthView('login');
        document.getElementById('login-phone').value = phone; 
        return;
    }

    // REGEX: Minimal 8 karakter, wajib ada Huruf Kapital, Angka, dan Simbol
    const passRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if(!passRegex.test(pass)) {
        alert("Gagal! Password MINIMAL 8 karakter, serta wajib mengandung kombinasi Huruf Kapital, Angka, dan Simbol (contoh: Bsrng@12345).");
        return;
    }

    tempPhone = phone; 
    tempPass = pass;
    isSignupFlow = true;
    sendOTP();
}

function processLogin(event) {
    event.preventDefault();
    const phone = document.getElementById('login-phone').value;
    const pass = document.getElementById('login-pass').value;
    
    const user = usersDB.find(u => u.phone === phone && u.password === pass);
    
    if(user) {
        tempPhone = phone;
        isSignupFlow = false;
        sendOTP();
    } else {
        alert("Nomor WhatsApp atau Password salah! Pastikan kamu sudah mendaftar dengan benar.");
    }
}

function sendOTP() {
    alert(`[SIMULASI WHATSAPP]\n\nPesan otomatis dikirim ke: ${tempPhone}\n\nHalo!\nKode OTP Rahasia Anda adalah: 1234`);
    switchAuthView('otp');
}

function verifyOTP(event) {
    event.preventDefault();
    const otp = document.getElementById('otp-code').value;
    
    if(otp === '1234') {
        alert("Verifikasi Berhasil! Selamat datang.");
        
        if(isSignupFlow) {
            usersDB.push({ phone: tempPhone, password: tempPass });
        }

        closeAuthModal();
        isLoggedIn = true;
        document.getElementById('auth-buttons').style.display = 'none';
        document.getElementById('user-info').style.display = 'flex';
        document.getElementById('nav-btn-track').classList.remove('locked');
        
        document.getElementById('form-signup').reset();
        document.getElementById('form-login').reset();
        document.getElementById('form-otp').reset();
        updateTrackView();
    } else {
        alert("Kode OTP salah.");
    }
}

function simulateLogout() {
    isLoggedIn = false;
    orderStatus = "empty"; 
    document.getElementById('auth-buttons').style.display = 'flex';
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('nav-btn-track').classList.add('locked');
    updateTrackView(); 
    navigate('home'); 
}

// ==========================================
// 4. FITUR PEMESANAN CUSTOM & CHECKOUT
// ==========================================
function processCustomOrder() {
    if (!isLoggedIn) {
        alert("Sobat harus Log In dulu sebelum bisa memesan!");
        openAuthModal('login');
        return;
    }
    
    const flavor = document.getElementById('flavor-select').value;
    if(!flavor) {
        alert("Silakan pilih varian rasa terlebih dahulu!");
        return;
    }

    const itemName = `Paket Basreng (${flavor})`;
    const itemPrice = 10000;

    currentOrder.name = itemName;
    currentOrder.price = itemPrice;
    currentDiscount = 0;
    
    document.getElementById('checkout-phone').value = tempPhone;
    document.getElementById('promo-code').value = '';
    
    renderOrderSummary();
    navigate('checkout');
}

function renderOrderSummary() {
    const total = currentOrder.price - currentDiscount;
    const summaryDiv = document.getElementById('order-summary-content');
    
    let html = `
        <h3 style="margin-bottom:15px; font-size:1.1rem;">Ringkasan Belanja</h3>
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span>${currentOrder.name}</span>
            <span>Rp ${currentOrder.price.toLocaleString('id-ID')}</span>
        </div>
    `;
    if (currentDiscount > 0) {
        html += `<div style="display:flex; justify-content:space-between; margin-bottom:8px; color:var(--success-color);">
            <span>Diskon Promo</span><span>- Rp ${currentDiscount.toLocaleString('id-ID')}</span></div>`;
    }
    html += `
        <hr style="border-color:var(--border-color); margin:15px 0;">
        <div style="display:flex; justify-content:space-between; font-weight:bold; color:var(--primary-color); font-size:1.1rem;">
            <span>Total Bayar</span><span>Rp ${total.toLocaleString('id-ID')}</span>
        </div>`;
    summaryDiv.innerHTML = html;
}

function applyPromo() {
    const code = document.getElementById('promo-code').value.toUpperCase();
    if (code === 'BSRNG10') {
        currentDiscount = currentOrder.price * 0.1; 
        alert("Hore! Kode promo 'BSRNG10' berhasil digunakan. Kamu dapat diskon 10%.");
    } else {
        currentDiscount = 0;
        alert("Maaf, kode promo tidak valid atau sudah kadaluarsa.");
    }
    renderOrderSummary();
}

function processCheckout(event) {
    event.preventDefault();
    const phone = document.getElementById('checkout-phone').value;
    
    if(!indoPhoneRegex.test(phone)) {
        alert("Pastikan nomor telepon pengiriman menggunakan format Indonesia.");
        return;
    }

    alert("Pesanan berhasil dibuat! Silakan lakukan pembayaran agar pesanan bisa dikonfirmasi oleh Seller.");
    orderStatus = "pending"; 
    updateTrackView();
    document.getElementById('form-checkout').reset();
    navigate('track');
}

function simulateSellerVerification() {
    alert("Notifikasi: Seller telah memverifikasi pembayaran Anda! Pesanan sedang diproses.");
    orderStatus = "processing";
    updateTrackView();
}

function updateTrackView() {
    const emptyTrack = document.getElementById('empty-track');
    const activeTrack = document.getElementById('active-track');
    
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const sellerBtnBox = document.getElementById('seller-verification-box');

    if (orderStatus === "empty") {
        emptyTrack.style.display = 'block';
        activeTrack.style.display = 'none';
    } else if (orderStatus === "pending") {
        emptyTrack.style.display = 'none';
        activeTrack.style.display = 'block';
        
        step1.className = "timeline-item active"; 
        step2.className = "timeline-item"; 
        sellerBtnBox.style.display = 'block'; 
    } else if (orderStatus === "processing") {
        emptyTrack.style.display = 'none';
        activeTrack.style.display = 'block';
        
        step1.className = "timeline-item completed"; 
        step2.className = "timeline-item active"; 
        sellerBtnBox.style.display = 'none'; 
    }
}

// ==========================================
// 5. FITUR LAYANAN KONSUMEN (INTEGRASI AI GEMINI LANGSUNG)
// ==========================================

// 🔴 GANTI TEKS DI BAWAH DENGAN API KEY DARI GOOGLE AI STUDIO KAMU
const GEMINI_API_KEY = "TARUH_API_KEY_KAMU_DISINI"; 

function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.style.display = (chatWindow.style.display === 'none' || chatWindow.style.display === '') ? 'flex' : 'none';
}

function handleEnter(event) { 
    if (event.key === "Enter") sendMessage(); 
}

async function sendMessage() {
    const inputField = document.getElementById('user-input');
    const message = inputField.value.trim();
    const chatBody = document.getElementById('chat-body');

    if (message === '') return;

    chatBody.innerHTML += `<div class="chat-bubble user">${message}</div>`;
    inputField.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;

    const loadingId = "loading-" + Date.now();
    chatBody.innerHTML += `<div class="chat-bubble bot" id="${loadingId}">
        <span style="opacity: 0.7;">AI sedang mengetik... 🤖</span>
    </div>`;
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
        const systemInstruction = `
        Kamu adalah Customer Service yang ramah, asik, dan gaul untuk brand cemilan bernama "Basrengan-Yuk!".
        Tagline brand: "Your Buddy Snack" (Camilan yang menjadi teman saat beraktivitas).
        
        Informasi Produk:
        - Harga 1 Paket: Rp 10.000.
        - Pilihan Varian Rasa: Original (Gurih Asin), Pedas (Daun Jeruk), dan Rendang.
        - Produk 100% Halal dan digoreng fresh setiap hari.
        
        Informasi Pemesanan & Pengiriman:
        - Cara pesan: Langsung klik menu "Pesan Sekarang" di website ini.
        - Pengiriman: Bisa dikirim ke luar kota ke seluruh Indonesia.
        - Metode bayar: Tersedia Transfer BCA, QRIS, dan COD (Bayar di tempat).
        
        Kontak Admin (Hanya berikan ini jika pelanggan ada masalah/komplain berat atau ingin beli grosir/reseller):
        - WhatsApp: +62 838-9811-5619
        - Email: basrenganyuk@gmail.com
        
        Aturan menjawab:
        - Jawab dengan singkat, padat, dan jelas (maksimal 2-3 kalimat).
        - Gunakan emoji agar terlihat santai dan ramah.
        - Jika ditanya hal di luar basreng atau cemilan, tolak dengan sopan dan arahkan kembali ke produk.
        
        Pertanyaan pelanggan: "${message}"
        `;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: systemInstruction }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates.length > 0) {
            let botReply = data.candidates[0].content.parts[0].text;
            botReply = botReply.replace(/\n/g, "<br>");
            document.getElementById(loadingId).innerHTML = botReply;
        } else {
            throw new Error("Balasan kosong");
        }

    } catch (error) {
        console.error("Error:", error);
        document.getElementById(loadingId).innerHTML = `Maaf, koneksi AI sedang terputus. 🥺 Silakan hubungi admin WA kami di <a href="https://wa.me/6283898115619" target="_blank" class="wa-link">sini</a>.`;
    }

    chatBody.scrollTop = chatBody.scrollHeight;
}

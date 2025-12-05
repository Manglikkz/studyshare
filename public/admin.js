// admin.js - FINAL SECURE VERSION
// Mengambil konfigurasi hash dari file .env (Vite)
const ADMIN_PASSWORD_HASH = import.meta.env.VITE_ADMIN_PASSWORD_HASH;
const PRIMARY_COLOR = "#4a90e2";

// Cek apakah env variable terbaca (Hanya untuk debugging saat development)
if (!ADMIN_PASSWORD_HASH) {
  console.error("❌ FATAL: VITE_ADMIN_PASSWORD_HASH tidak ditemukan di .env!");
}

// ====================================================
// PASSWORD HASHING UTILITY
// ====================================================
class PasswordHasher {
  // Simple SHA-256 hashing utility using Web Crypto API
  static async sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  }

  // Verify password against hash
  static async verifyPassword(password, targetHash) {
    try {
      const hashedPassword = await this.sha256(password);
      // Membandingkan hash input dengan hash di .env
      return hashedPassword === targetHash;
    } catch (error) {
      console.error("Password verification error:", error);
      return false;
    }
  }
}

// ====================================================
// UTILITY CLASSES (UI)
// ====================================================
class AdminLoadingSpinner {
  static show(text = "Memproses...") {
    this.hide();
    const spinner = document.createElement("div");
    spinner.id = "admin-loading-spinner";
    spinner.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(255, 255, 255, 0.95);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            z-index: 9999; backdrop-filter: blur(5px);
        `;
    spinner.innerHTML = `
            <div class="spinner-container" style="text-align: center; padding: 2rem; border-radius: 20px; background: linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(123, 184, 241, 0.1) 100%); border: 1px solid rgba(74, 144, 226, 0.2); box-shadow: 0 10px 30px rgba(74, 144, 226, 0.2);">
                <div class="spinner" style="width: 60px; height: 60px; border: 4px solid rgba(74, 144, 226, 0.1); border-top: 4px solid ${PRIMARY_COLOR}; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <p style="color: ${PRIMARY_COLOR}; font-size: 1.1rem; font-weight: 500; margin: 0;">${text}</p>
            </div>
        `;
    document.body.appendChild(spinner);
  }

  static hide() {
    const spinner = document.getElementById("admin-loading-spinner");
    if (spinner) {
      spinner.style.animation = "fadeOut 0.3s ease-out";
      setTimeout(() => spinner.remove(), 300);
    }
  }
}

class AdminCustomAlert {
  static show(message, type = "info", duration = 3000) {
    const existingAlert = document.querySelector(".admin-custom-alert");
    if (existingAlert) existingAlert.remove();

    const alert = document.createElement("div");
    alert.className = `admin-custom-alert admin-custom-alert-${type}`;

    let bgColor, textColor, borderColor, icon;
    if (type === "success") {
      bgColor = "rgba(16, 185, 129, 0.1)";
      textColor = "#10b981";
      borderColor = "#10b981";
      icon = "✓";
    } else if (type === "error") {
      bgColor = "rgba(239, 68, 68, 0.1)";
      textColor = "#ef4444";
      borderColor = "#ef4444";
      icon = "✗";
    } else if (type === "warning") {
      bgColor = "rgba(245, 158, 11, 0.1)";
      textColor = "#f59e0b";
      borderColor = "#f59e0b";
      icon = "⚠";
    } else {
      bgColor = "rgba(74, 144, 226, 0.1)";
      textColor = PRIMARY_COLOR;
      borderColor = PRIMARY_COLOR;
      icon = "ℹ";
    }

    alert.style.cssText = `
            position: fixed; top: 20px; right: 20px; background: ${bgColor}; color: ${textColor}; border: 1px solid ${borderColor};
            padding: 16px 20px; border-radius: 12px; display: flex; align-items: center; gap: 12px; z-index: 9999;
            backdrop-filter: blur(10px); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15); max-width: 400px;
            animation: slideInRight 0.3s ease-out; transition: all 0.3s ease;
        `;

    alert.innerHTML = `
            <span class="admin-alert-icon" style="font-size: 1.2rem;">${icon}</span>
            <span class="admin-alert-message">${message}</span>
            <button class="admin-alert-close" style="background: none; border: none; color: ${textColor}; font-size: 1.5rem; cursor: pointer; margin-left: auto; padding: 0; line-height: 1; opacity: 0.7;">×</button>
        `;

    document.body.appendChild(alert);
    alert.querySelector(".admin-alert-close").addEventListener("click", () => {
      alert.style.animation = "slideOutRight 0.3s ease-out";
      setTimeout(() => alert.remove(), 300);
    });

    if (duration > 0) {
      setTimeout(() => {
        if (alert.parentNode) {
          alert.style.animation = "slideOutRight 0.3s ease-out";
          setTimeout(() => alert.remove(), 300);
        }
      }, duration);
    }
  }
}

class AdminConfirmDialog {
  static show(message, onConfirm, onCancel = null) {
    this.hide();
    const dialog = document.createElement("div");
    dialog.id = "admin-confirm-dialog-overlay";
    dialog.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5);
            display: flex; align-items: center; justify-content: center; z-index: 10000; animation: fadeIn 0.3s ease-out;
        `;
    dialog.innerHTML = `
            <div class="admin-confirm-dialog" style="background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 20px 60px rgba(74, 144, 226, 0.3); max-width: 400px; width: 90%; text-align: center; animation: slideInUp 0.3s ease-out;">
                <h3 style="margin-bottom: 1rem; color: #2d3748;">Konfirmasi</h3>
                <p style="margin-bottom: 1.5rem; color: #718096; line-height: 1.5;">${message}</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button id="admin-confirm-cancel" style="background: #e2e8f0; color: #2d3748; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; font-weight: 500;">Batal</button>
                    <button id="admin-confirm-ok" style="background: ${PRIMARY_COLOR}; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; font-weight: 500;">Ya, Hapus</button>
                </div>
            </div>
        `;
    document.body.appendChild(dialog);
    document
      .getElementById("admin-confirm-ok")
      .addEventListener("click", () => {
        this.hide();
        if (onConfirm) onConfirm();
      });
    document
      .getElementById("admin-confirm-cancel")
      .addEventListener("click", () => {
        this.hide();
        if (onCancel) onCancel();
      });
  }
  static hide() {
    const dialog = document.getElementById("admin-confirm-dialog-overlay");
    if (dialog) dialog.remove();
  }
}

// ====================================================
// NOTES MANAGER ADMIN
// ====================================================
class NotesManagerAdmin {
  constructor() {
    this.notes = [];
    this.supabaseService = null;
    this.isInitialized = false;
  }

  async init() {
    await this.waitForSupabase();
    await this.loadData();
    this.isInitialized = true;
  }

  async waitForSupabase() {
    if (
      typeof window.supabaseService !== "undefined" &&
      window.supabaseService
    ) {
      this.supabaseService = window.supabaseService;
      return true;
    }
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50;
      const checkInterval = setInterval(() => {
        attempts++;
        if (
          typeof window.supabaseService !== "undefined" &&
          window.supabaseService
        ) {
          this.supabaseService = window.supabaseService;
          clearInterval(checkInterval);
          resolve(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          reject(new Error("Supabase service not available"));
        }
      }, 100);
    });
  }

  async loadData() {
    try {
      AdminLoadingSpinner.show("Memuat data admin...");
      if (!this.supabaseService)
        throw new Error("Supabase service tidak tersedia");
      await this.supabaseService.checkConnection();
      if (!this.supabaseService.isConnected)
        throw new Error("Tidak terhubung ke database");

      await this.loadFromSupabase();
      await this.loadStats();
      AdminCustomAlert.show("Data admin berhasil dimuat!", "success", 2000);
    } catch (error) {
      console.error("Error loading data:", error);
      this.notes = [];
      this.updateStats(0, 0, 0);
      AdminCustomAlert.show(
        `Gagal memuat data: ${error.message}`,
        "error",
        4000
      );
      this.renderErrorState(error.message);
    } finally {
      AdminLoadingSpinner.hide();
    }
  }

  renderErrorState(msg) {
    const container = document.getElementById("adminNotesContainer");
    if (container) {
      container.innerHTML = `
                <div class="empty-state">
                    <h3 style="color: #ef4444;">❌ Gagal Memuat Data</h3>
                    <p style="color: #718096;">${msg}</p>
                    <button onclick="retryLoadAdminData()" class="btn-primary" style="margin-top: 1rem;">🔄 Coba Lagi</button>
                </div>`;
    }
  }

  async loadFromSupabase() {
    const notes = await this.supabaseService.getNotes();
    if (!notes || !Array.isArray(notes)) {
      this.notes = [];
      return;
    }

    this.notes = notes.map((note) => ({
      id: note.id,
      title: note.title || "",
      subject: note.subject || "other",
      content: note.content || "",
      author: note.author || "Anonim",
      date: note.created_at || new Date().toISOString(),
      likes: note.likes_count || 0,
      dislikes: note.dislikes_count || 0,
      image: note.image_url,
    }));
  }

  async loadStats() {
    try {
      const totalLikes = await this.supabaseService.getTotalLikes();
      const totalComments = await this.supabaseService.getTotalComments();
      this.updateStats(this.notes.length, totalLikes, totalComments);
    } catch (error) {
      const totalLikes = this.notes.reduce(
        (sum, note) => sum + (note.likes || 0),
        0
      );
      this.updateStats(this.notes.length, totalLikes, 0);
    }
  }

  updateStats(totalNotes, totalLikes, totalComments) {
    const elNotes = document.getElementById("totalNotes");
    const elLikes = document.getElementById("totalLikes");
    const elComments = document.getElementById("totalComments");
    if (elNotes) elNotes.textContent = totalNotes;
    if (elLikes) elLikes.textContent = totalLikes;
    if (elComments) elComments.textContent = totalComments;
  }

  async deleteNote(noteId) {
    if (!this.supabaseService || !this.supabaseService.isConnected)
      throw new Error("Tidak terhubung ke server");
    try {
      AdminLoadingSpinner.show("Menghapus catatan...");
      await this.supabaseService.deleteNote(noteId);
      return true;
    } finally {
      AdminLoadingSpinner.hide();
    }
  }
}

// ====================================================
// GLOBAL FUNCTIONS & LOGIC
// ====================================================
const notesManagerAdmin = new NotesManagerAdmin();

const DOMAdmin = {
  escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },
  formatDate(dateString) {
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Tanggal tidak valid";
    }
  },
  getSubjectName(subject) {
    const names = {
      "bahasa-arab": "Bahasa Arab",
      nahwu: "Nahwu",
      shorof: "Shorof",
      tahfidz: "Tahfidz",
      tahsin: "Tahsin",
      aqidah: "Aqidah",
      fikih: "Fikih",
      hadits: "Hadits",
      "adab-akhlaq": "Adab & Akhlaq",
      "bahasa-inggris": "Bahasa Inggris",
      matematika: "Matematika",
      bootcamp: "Bootcamp",
    };
    return names[subject] || subject;
  },
};

// --- LOGIN LOGIC YANG SUDAH DIAMANKAN ---
async function loginAdmin() {
  const passwordInput = document.getElementById("adminPassword");
  const password = passwordInput.value;

  if (!password) {
    AdminCustomAlert.show("Harap masukkan password!", "warning", 3000);
    return;
  }

  // Cek jika .env belum disetting
  if (!ADMIN_PASSWORD_HASH) {
    AdminCustomAlert.show(
      "Konfigurasi server (.env) belum lengkap!",
      "error",
      5000
    );
    console.error("VITE_ADMIN_PASSWORD_HASH is missing");
    return;
  }

  try {
    AdminLoadingSpinner.show("Verifikasi...");

    // Verifikasi menggunakan Hash (Aman)
    const isValid = await PasswordHasher.verifyPassword(
      password,
      ADMIN_PASSWORD_HASH
    );

    AdminLoadingSpinner.hide();

    if (isValid) {
      sessionStorage.setItem("adminLoggedIn", "true");
      sessionStorage.setItem("adminLoginTime", Date.now());
      showAdminPanel();
      AdminCustomAlert.show(
        "Login berhasil! Selamat datang Admin!",
        "success",
        2000
      );
      passwordInput.value = ""; // Bersihkan input
    } else {
      AdminCustomAlert.show("Password admin salah!", "error", 3000);
      passwordInput.value = ""; // Bersihkan input biar tidak ditebak
      passwordInput.focus();
    }
  } catch (error) {
    AdminLoadingSpinner.hide();
    console.error("Login error:", error);
    AdminCustomAlert.show("Terjadi kesalahan saat login", "error", 3000);
  }
}

function logoutAdmin() {
  AdminConfirmDialog.show("Apakah Anda yakin ingin logout?", () => {
    sessionStorage.removeItem("adminLoggedIn");
    sessionStorage.removeItem("adminLoginTime");
    showLoginForm();
    AdminCustomAlert.show("Logout berhasil!", "success", 2000);
  });
}

function showLoginForm() {
  document.getElementById("adminLogin").style.display = "block";
  document.getElementById("adminPanel").style.display = "none";
  const pwd = document.getElementById("adminPassword");
  if (pwd) pwd.value = "";
}

function showAdminPanel() {
  document.getElementById("adminLogin").style.display = "none";
  document.getElementById("adminPanel").style.display = "block";

  const container = document.getElementById("adminNotesContainer");
  if (container) {
    container.innerHTML = `<div class="loading-state"><div class="loading-spinner"></div><p>Memuat data admin...</p></div>`;
  }
  setTimeout(() => loadAdminData(), 100);
}

async function loadAdminData() {
  if (!notesManagerAdmin.isInitialized) await notesManagerAdmin.init();
  renderAdminNotesList(notesManagerAdmin.notes);
}

async function retryLoadAdminData() {
  await loadAdminData();
}

function renderAdminNotesList(notes) {
  const container = document.getElementById("adminNotesContainer");
  if (!container) return;

  if (!notes || notes.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <h3 style="color: #4a90e2;">📝 Belum Ada Catatan</h3>
                <p style="color: #718096;">Tidak ada catatan di database.</p>
                <a href="upload.html" class="btn-primary" style="margin-top: 1rem;">📤 Upload Catatan</a>
            </div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  notes.forEach((note) => {
    const div = document.createElement("div");
    div.className = "admin-note-item";
    div.style.cssText = `background: white; border-radius: 12px; padding: 1.5rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; border-left: 4px solid ${PRIMARY_COLOR}; transition: all 0.3s ease; margin-bottom: 1rem; box-shadow: 0 5px 15px rgba(0,0,0,0.05);`;

    div.innerHTML = `
            <div class="admin-note-content" style="flex: 1;">
                <div class="note-header" style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                    <h4 style="margin: 0; font-size: 1.2rem;">${DOMAdmin.escapeHtml(
                      note.title
                    )}</h4>
                    <span class="subject-tag" style="background: ${PRIMARY_COLOR}; color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem;">${DOMAdmin.getSubjectName(
      note.subject
    )}</span>
                </div>
                <div class="note-details" style="display: grid; gap: 0.5rem; font-size: 0.9rem; color: #718096;">
                    <p><strong>✍️ Penulis:</strong> ${DOMAdmin.escapeHtml(
                      note.author
                    )}</p>
                    <p><strong>📅 Tanggal:</strong> ${DOMAdmin.formatDate(
                      note.date
                    )}</p>
                    <p><strong>👍 Like:</strong> ${
                      note.likes
                    } | <strong>👎 Dislike:</strong> ${note.dislikes}</p>
                    <p><strong>📝 Isi:</strong> ${DOMAdmin.escapeHtml(
                      note.content.substring(0, 100)
                    )}...</p>
                </div>
            </div>
            <div class="admin-note-actions">
                <button class="btn-danger" onclick="deleteNote('${
                  note.id
                }', this)" style="background: #ef4444; color: white; border: none; padding: 0.6rem 1rem; border-radius: 8px; cursor: pointer;">🗑️ Hapus</button>
            </div>
        `;
    fragment.appendChild(div);
  });
  container.innerHTML = "";
  container.appendChild(fragment);
}

// Make delete function globally accessible for HTML onclick
window.deleteNote = async function (noteId, buttonElement) {
  AdminConfirmDialog.show(
    "Apakah Anda yakin ingin menghapus catatan ini secara permanen?",
    async () => {
      const originalText = buttonElement.innerHTML;
      buttonElement.innerHTML = "⏳";
      buttonElement.disabled = true;
      try {
        await notesManagerAdmin.deleteNote(noteId);
        const item = buttonElement.closest(".admin-note-item");
        if (item) item.remove();

        // Update counters UI
        const remaining = document.querySelectorAll(".admin-note-item").length;
        document.getElementById("totalNotes").textContent = remaining;
        if (remaining === 0) renderAdminNotesList([]);

        AdminCustomAlert.show("Catatan dihapus!", "success", 3000);
      } catch (error) {
        buttonElement.innerHTML = originalText;
        buttonElement.disabled = false;
        AdminCustomAlert.show(
          `Gagal menghapus: ${error.message}`,
          "error",
          4000
        );
      }
    }
  );
};

// ====================================================
// INITIALIZATION
// ====================================================
document.addEventListener("DOMContentLoaded", function () {
    console.log("🔐 Admin page loaded...");
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", loginAdmin); // Tidak perlu kurung ()
    }
  // Add Enter key listener for login
  const pwdInput = document.getElementById("adminPassword");
  if (pwdInput) {
    pwdInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") loginAdmin();
    });
  }

  // Expose functions to window for HTML buttons
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.retryLoadAdminData = retryLoadAdminData;
// window.deleteNote sudah ada di kode sebelumnya, tapi pastikan ada.

console.log("✅ Fungsi Admin berhasil didaftarkan ke Window");

  // Check session
  const isLoggedIn = sessionStorage.getItem("adminLoggedIn") === "true";
  const loginTime = parseInt(sessionStorage.getItem("adminLoginTime") || "0");
  const isValidSession =
    isLoggedIn && Date.now() - loginTime < 2 * 60 * 60 * 1000;

  if (isValidSession) {
    showAdminPanel();
  } else {
    sessionStorage.removeItem("adminLoggedIn");
    showLoginForm();
  }
});

// src/script.js - FINAL ROBUST VERSION

// ====================================================
// UI UTILITY CLASSES (Ditaruh di atas agar siap dipakai)
// ====================================================

// Custom Alert Box
class CustomAlert {
  static show(message, type = "info", duration = 3000) {
    const existingAlert = document.querySelector(".custom-alert");
    if (existingAlert) existingAlert.remove();

    const alert = document.createElement("div");
    alert.className = `custom-alert custom-alert-${type}`;

    let bgColor, textColor, borderColor, icon;
    switch (type) {
      case "success":
        bgColor = "rgba(16, 185, 129, 0.1)";
        textColor = "#10b981";
        borderColor = "#10b981";
        icon = "✓";
        break;
      case "error":
        bgColor = "rgba(239, 68, 68, 0.1)";
        textColor = "#ef4444";
        borderColor = "#ef4444";
        icon = "✗";
        break;
      case "warning":
        bgColor = "rgba(245, 158, 11, 0.1)";
        textColor = "#f59e0b";
        borderColor = "#f59e0b";
        icon = "⚠";
        break;
      default:
        bgColor = "rgba(74, 144, 226, 0.1)";
        textColor = "#4a90e2";
        borderColor = "#4a90e2";
        icon = "ℹ";
        break;
    }

    alert.style.cssText = `
            position: fixed; top: 20px; right: 20px; background: ${bgColor}; color: ${textColor}; border: 1px solid ${borderColor};
            padding: 16px 20px; border-radius: 12px; display: flex; align-items: center; gap: 12px; z-index: 9999;
            backdrop-filter: blur(10px); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15); max-width: 400px;
            animation: slideInRight 0.3s ease-out; transition: all 0.3s ease;
        `;

    alert.innerHTML = `
            <span class="alert-icon" style="font-size: 1.2rem;">${icon}</span>
            <span class="alert-message">${message}</span>
            <button class="alert-close" style="background: none; border: none; color: ${textColor}; font-size: 1.5rem; cursor: pointer; margin-left: auto; padding: 0; line-height: 1;">×</button>
        `;

    document.body.appendChild(alert);
    alert.querySelector(".alert-close").addEventListener("click", () => {
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
    return alert;
  }
}

// Loading Spinner
class LoadingSpinner {
  static show(text = "Memproses...") {
    this.hide();
    const spinner = document.createElement("div");
    spinner.id = "loading-spinner";
    spinner.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255, 255, 255, 0.9);
            display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(5px);
        `;
    spinner.innerHTML = `
            <div class="spinner-container" style="text-align: center; padding: 2rem; border-radius: 20px; background: linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(123, 184, 241, 0.1) 100%); border: 1px solid rgba(74, 144, 226, 0.2); box-shadow: 0 10px 30px rgba(74, 144, 226, 0.2);">
                <div class="spinner" style="width: 60px; height: 60px; border: 4px solid rgba(74, 144, 226, 0.1); border-top: 4px solid #4a90e2; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <p style="color: #4a90e2; font-size: 1.1rem; font-weight: 500; margin: 0;">${text}</p>
            </div>
        `;
    document.body.appendChild(spinner);

    if (!document.querySelector("#spinner-animation")) {
      const style = document.createElement("style");
      style.id = "spinner-animation";
      style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }`;
      document.head.appendChild(style);
    }
  }

  static hide() {
    const spinner = document.getElementById("loading-spinner");
    if (spinner) {
      spinner.style.animation = "fadeOut 0.3s ease-out";
      setTimeout(() => spinner.remove(), 300);
    }
  }
}

// DOM Utility Functions
const DOM = {
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  },

  createNoteCard(note) {
    const likeStatus = notesManager.getLikeStatus(note.id);
    const comments = notesManager.getComments(note.id);
    const noteCard = document.createElement("div");
    noteCard.className = "note-card";
    noteCard.setAttribute("data-note-id", note.id);

    let mediaHTML = "";
    if (note.image) {
      mediaHTML += `
                <div class="note-media">
                    <img src="${note.image}" alt="Foto catatan" class="note-image" onclick="openImageModal('${note.image}')">
                    <div class="image-actions">
                        <button class="image-action-btn" onclick="openImageModal('${note.image}')" title="Lihat gambar">🔍</button>
                        <button class="image-action-btn" onclick="downloadImageFromUrl('${note.image}', '${note.title}.jpg')" title="Download gambar">⬇️</button>
                    </div>
                </div>
            `;
    }

    noteCard.innerHTML = `
            <div class="note-header">
                <h3 class="note-title">${this.escapeHtml(note.title)}</h3>
                <span class="subject-tag">${this.getSubjectName(
                  note.subject
                )}</span>
            </div>
            <div class="note-content">${this.escapeHtml(note.content)}</div>
            ${mediaHTML}
            <div class="note-meta">
                <span class="author">${this.escapeHtml(note.author)}</span>
                <span class="date">${this.formatDate(note.date)}</span>
            </div>
            <div class="like-dislike">
                <button class="like-btn ${
                  likeStatus.liked ? "active" : ""
                }" data-note-id="${note.id}" onclick="handleLike('${note.id}')">
                    👍 Like <span class="like-count">${note.likes}</span>
                </button>
                <button class="dislike-btn ${
                  likeStatus.disliked ? "active" : ""
                }" data-note-id="${note.id}" onclick="handleDislike('${
      note.id
    }')">
                    👎 Dislike <span class="dislike-count">${
                      note.dislikes
                    }</span>
                </button>
            </div>
            <div class="comments-section">
                <h4>Komentar (${comments.length})</h4>
                <div class="comments-list">
                    ${comments
                      .map(
                        (comment) =>
                          `<div class="comment"><p><strong>${this.escapeHtml(
                            comment.author
                          )}:</strong> ${this.escapeHtml(
                            comment.text
                          )}</p><small>${this.formatDate(
                            comment.date
                          )}</small></div>`
                      )
                      .join("")}
                </div>
                <div class="comment-input-group">
                    <input type="text" class="comment-author" placeholder="Nama Anda" required>
                    <div class="comment-form-container">
                        <input type="text" placeholder="Tulis komentar..." class="comment-input">
                        <button class="comment-submit" onclick="handleAddComment('${
                          note.id
                        }', this)">Kirim</button>
                    </div>
                </div>
            </div>
        `;
    return noteCard;
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

  escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },

  renderNoteOfTheDay(note) {
    const container = document.getElementById("noteOfDayContainer");
    if (!container) return;

    if (!note) {
      container.innerHTML = `<div class="noteday-card"><p class="empty">Belum ada catatan.</p></div>`;
      return;
    }

    const comments = notesManager.getComments(note.id);

    container.innerHTML = `
        <div class="noteday-card">
            <div class="noteday-header">
                <span class="subject-tag large">${this.getSubjectName(
                  note.subject
                )}</span>
                <span class="date">${this.formatDate(note.date)}</span>
            </div>
            <h3>${this.escapeHtml(note.title)}</h3>
            
            <!-- Menggunakan class note-content agar format baris baru terbaca -->
            <div class="note-content full-text">${this.escapeHtml(
              note.content
            )}</div>
            
            <div class="noteday-stats">
                <span>👍 ${note.likes}</span>
                <span>💬 ${comments.length}</span>
                <span>✍️ ${this.escapeHtml(note.author)}</span>
            </div>
            <button class="btn-primary" onclick="scrollToNote('${
              note.id
            }')">Lihat Lengkap</button>
        </div>
    `;
  },

  renderTrendingSection(notes) {
    const container = document.getElementById("trendingContainer");
    if (!container) return;
    if (notes.length === 0) {
      container.innerHTML = '<p class="empty">Belum ada catatan trending.</p>';
      return;
    }
    container.innerHTML = notes
      .map(
        (note) => `
            <div class="trending-item" onclick="scrollToNote('${note.id}')">
                <h4>${this.escapeHtml(note.title.substring(0, 40))}...</h4>
                <div class="trending-meta"><span>${this.getSubjectName(
                  note.subject
                )}</span><span>👍 ${note.likes}</span></div>
            </div>
        `
      )
      .join("");
  },

  renderCategories() {
    const container = document.getElementById("categoriesContainer");
    if (!container) return;
    const categories = notesManager.getCategories();
    if (categories.length === 0) {
      container.innerHTML = '<p class="empty">Belum ada kategori.</p>';
      return;
    }
    container.innerHTML = categories
      .map(
        (cat) => `
            <div class="category-card" data-subject="${
              cat.id
            }" onclick="filterBySubject('${cat.id}')">
                <div class="category-icon">${cat.name.charAt(0)}</div><h4>${
          cat.name
        }</h4><p>${cat.count} catatan</p>
            </div>
        `
      )
      .join("");
  },

  renderActivityFeed(activities) {
    const container = document.getElementById("activityFeed");
    if (!container) return;
    if (activities.length === 0) {
      container.innerHTML = '<p class="empty">Belum ada aktivitas.</p>';
      return;
    }
    container.innerHTML = activities
      .map(
        (activity) =>
          `<div class="activity-item"><span>${activity.text}</span><small>${activity.timeAgo}</small></div>`
      )
      .join("");
  },

  renderNotes(notes, container) {
    container.innerHTML = "";
    const noNotes = document.getElementById("noNotes");
    if (notes.length === 0) {
      if (noNotes) noNotes.style.display = "block";
      return;
    }
    if (noNotes) noNotes.style.display = "none";
    notes.forEach((note) => {
      container.appendChild(this.createNoteCard(note));
    });
  },
};

// ====================================================
// CORE LOGIC: NOTES MANAGER
// ====================================================
class NotesManager {
  constructor() {
    this.notes = [];
    this.likes = {};
    this.comments = {};
    this.userLikes = {};
    this.supabaseService = null;
    this.initialized = false;

    // Auto start
    this.init();
  }

  // NEW: Initialization with Retry Logic
  async init() {
    console.log("📚 Initializing NotesManager...");
    if (typeof LoadingSpinner !== "undefined")
      LoadingSpinner.show("Menghubungkan ke server...");

    await this.waitForSupabaseClient();

    if (this.supabaseService) {
      console.log("✅ Supabase client ready, attempting to fetch data...");
      await this.fetchWithRetry();
    } else {
      console.warn("⚠️ Supabase not available, using empty mode.");
      this.notes = [];
      this.initialized = true;
      if (typeof LoadingSpinner !== "undefined") LoadingSpinner.hide();
    }
  }

  // Helper: Wait for global supabase variable
  async waitForSupabaseClient() {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 100; // 10 detik max wait
      const check = () => {
        if (window.supabaseService && window.supabaseService.client) {
          this.supabaseService = window.supabaseService;
          resolve(true);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(check, 100);
        } else {
          resolve(false);
        }
      };
      check();
    });
  }

  // Helper: Retry logic for Cold Start
  async fetchWithRetry() {
    let retryCount = 0;
    const maxRetries = 5;
    let success = false;

    while (retryCount < maxRetries && !success) {
      try {
        if (retryCount > 0 && typeof LoadingSpinner !== "undefined") {
          const el = document.querySelector("#loading-spinner p");
          if (el)
            el.textContent = `Membangunkan database... (${retryCount}/${maxRetries})`;
        }

        console.log(`🔄 Percobaan fetch data ke-${retryCount + 1}...`);
        const isConnected = await this.supabaseService.checkConnection();

        if (isConnected) {
          await this.loadFromSupabase();
          success = true;
          console.log("✅ Data berhasil diambil!");
        } else {
          throw new Error("Database belum siap");
        }
      } catch (error) {
        console.warn(`⚠️ Percobaan ${retryCount + 1} gagal.`);
        retryCount++;
        if (retryCount < maxRetries)
          await new Promise((r) => setTimeout(r, 1500));
      }
    }

    this.initialized = true;
    if (typeof LoadingSpinner !== "undefined") LoadingSpinner.hide();
    refreshNotesDisplay();

    if (!success && typeof CustomAlert !== "undefined") {
      CustomAlert.show(
        "Koneksi lambat. Refresh jika data kosong.",
        "warning",
        5000
      );
    }
  }

  async loadFromSupabase() {
    const notes = await this.supabaseService.getNotes();
    if (!notes) {
      this.notes = [];
      return;
    }

    this.notes = notes.map((note) => ({
      id: note.id,
      title: this.sanitizeHTML(note.title || ""),
      subject: this.sanitizeHTML(note.subject || "other"),
      content: this.sanitizeHTML(note.content || ""),
      author: this.sanitizeHTML(note.author || "Anonim"),
      date: note.created_at || new Date().toISOString(),
      likes: note.likes_count || 0,
      dislikes: note.dislikes_count || 0,
      image: note.image_url || null,
    }));
    await this.loadAdditionalData();
  }

  async loadAdditionalData() {
    if (!this.supabaseService || !this.supabaseService.isConnected) return;
    const promises = this.notes.map(async (note) => {
      try {
        const [likes, comments] = await Promise.all([
          this.supabaseService.getLikes(note.id),
          this.supabaseService.getComments(note.id),
        ]);
        const userId = this.getUserId();
        const userLike = likes.find((like) => like.user_id === userId);

        this.likes[note.id] = {
          liked: userLike?.type === "like",
          disliked: userLike?.type === "dislike",
          count: note.likes || 0,
          dislikes: note.dislikes || 0,
        };
        this.userLikes[note.id] = this.userLikes[note.id] || {};
        this.userLikes[note.id][userId] = userLike ? userLike.type : "none";
        this.comments[note.id] = comments.map((comment) => ({
          id: comment.id,
          author: this.sanitizeHTML(comment.author || "Anonim"),
          text: this.sanitizeHTML(comment.text || ""),
          date: comment.created_at,
        }));
      } catch (error) {
        this.likes[note.id] = {
          liked: false,
          disliked: false,
          count: note.likes || 0,
          dislikes: note.dislikes || 0,
        };
        this.comments[note.id] = [];
      }
    });
    await Promise.allSettled(promises);
  }

  sanitizeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
  escapeHtml(text) {
    return this.sanitizeHTML(text);
  }

  getUserId() {
    let userId = localStorage.getItem("user_id");
    if (!userId) {
      userId = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("user_id", userId);
    }
    return userId;
  }

  getNoteOfTheDay() {
    if (this.notes.length === 0) return null;
    const seed = new Date()
      .toDateString()
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const sorted = this.getFilteredAndSortedNotes("all", "likes");
    return sorted[seed % Math.max(1, sorted.length)];
  }

  getTrendingNotes(limit = 5) {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    return this.notes
      .filter((n) => new Date(n.date) > new Date(now - oneDay))
      .map((n) => ({
        ...n,
        score: n.likes * 0.7 + (this.comments[n.id]?.length || 0) * 0.3,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .concat(this.notes.slice(0, limit))
      .slice(0, limit); // Fallback if no trending
  }

  getCategories() {
    const cats = [
      { id: "matematika", name: "Matematika" },
      { id: "bahasa-inggris", name: "Bahasa Inggris" },
      { id: "bahasa-arab", name: "Bahasa Arab" },
      { id: "fikih", name: "Fikih" },
      { id: "aqidah", name: "Aqidah" },
      { id: "hadits", name: "Hadits" },
      { id: "adab-akhlaq", name: "Adab & Akhlaq" },
      { id: "nahwu", name: "Nahwu" },
      { id: "shorof", name: "Shorof" },
      { id: "tahfidz", name: "Tahfidz" },
      { id: "tahsin", name: "Tahsin" },
      { id: "bootcamp", name: "Bootcamp" },
    ];
    return cats
      .map((c) => ({
        ...c,
        count: this.notes.filter((n) => n.subject === c.id).length,
      }))
      .filter((c) => c.count > 0);
  }

  getRecentActivity(limit = 5) {
    const acts = [];
    this.notes.slice(0, 10).forEach((n) => {
      acts.push({
        type: "upload",
        text: `Catatan baru: "${n.title.substring(0, 30)}..."`,
        time: new Date(n.date).getTime(),
        noteId: n.id,
      });
      const lastComm = this.comments[n.id]?.[this.comments[n.id].length - 1];
      if (lastComm)
        acts.push({
          type: "comment",
          text: `Komentar di "${n.title.substring(0, 20)}..."`,
          time: new Date(lastComm.date).getTime(),
          noteId: n.id,
        });
    });
    return acts
      .sort((a, b) => b.time - a.time)
      .slice(0, limit)
      .map((a) => ({ ...a, timeAgo: this.getTimeAgo(Date.now() - a.time) }));
  }

  getTimeAgo(ms) {
    const sec = Math.floor(ms / 1000),
      min = Math.floor(sec / 60),
      hr = Math.floor(min / 60),
      day = Math.floor(hr / 24);
    if (day > 0) return `${day} hari lalu`;
    if (hr > 0) return `${hr} jam lalu`;
    if (min > 0) return `${min} menit lalu`;
    return `${sec} detik lalu`;
  }

  getTotalSubjects() {
    return new Set(this.notes.map((n) => n.subject)).size;
  }
  getTotalNotes() {
    return this.notes.length;
  }

  // CRUD
  async addNote(title, subject, content, author = "Anonim", imageData = null) {
    const newNote = {
      title: this.sanitizeHTML(title.trim()),
      subject,
      content: this.sanitizeHTML(content.trim()),
      author: this.sanitizeHTML(author.trim()) || "Anonim",
      date: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      image: imageData,
    };
    if (this.supabaseService && this.supabaseService.isConnected) {
      const sn = await this.supabaseService.addNote(newNote);
      newNote.id = sn.id;
      this.notes.unshift(newNote);
      return newNote;
    } else throw new Error("Tidak terhubung ke server");
  }

  getLikeStatus(noteId) {
    const uid = this.getUserId();
    const stat = this.userLikes[noteId]?.[uid] || "none";
    const n = this.notes.find((x) => x.id === noteId);
    return {
      liked: stat === "like",
      disliked: stat === "dislike",
      count: n?.likes || 0,
      dislikes: n?.dislikes || 0,
    };
  }

  async toggleLike(noteId) {
    const n = this.notes.find((x) => x.id === noteId);
    if (!n) return null;
    const uid = this.getUserId();
    const stat = this.getLikeStatus(noteId);
    if (stat.liked) {
      n.likes--;
      delete this.userLikes[noteId][uid];
    } else {
      if (stat.disliked) n.dislikes--;
      n.likes++;
      this.userLikes[noteId] = this.userLikes[noteId] || {};
      this.userLikes[noteId][uid] = "like";
    }

    const newStat = this.getLikeStatus(noteId);
    this.likes[noteId] = newStat;
    if (this.supabaseService?.isConnected) {
      try {
        await this.supabaseService.toggleLike(noteId, uid, "like");
        await this.supabaseService.updateNoteStats(noteId, n.likes, n.dislikes);
        CustomAlert.show(
          stat.liked ? "Like dihapus" : "Liked!",
          "success",
          2000
        );
      } catch {
        CustomAlert.show("Gagal sinkron", "warning");
      }
    }
    return newStat;
  }

  async toggleDislike(noteId) {
    const n = this.notes.find((x) => x.id === noteId);
    if (!n) return null;
    const uid = this.getUserId();
    const stat = this.getLikeStatus(noteId);
    if (stat.disliked) {
      n.dislikes--;
      delete this.userLikes[noteId][uid];
    } else {
      if (stat.liked) n.likes--;
      n.dislikes++;
      this.userLikes[noteId] = this.userLikes[noteId] || {};
      this.userLikes[noteId][uid] = "dislike";
    }

    const newStat = this.getLikeStatus(noteId);
    this.likes[noteId] = newStat;
    if (this.supabaseService?.isConnected) {
      try {
        await this.supabaseService.toggleLike(noteId, uid, "dislike");
        await this.supabaseService.updateNoteStats(noteId, n.likes, n.dislikes);
        CustomAlert.show(
          stat.disliked ? "Dislike dihapus" : "Disliked!",
          "success",
          2000
        );
      } catch {
        CustomAlert.show("Gagal sinkron", "warning");
      }
    }
    return newStat;
  }

  getComments(noteId) {
    return this.comments[noteId] || [];
  }

  async addComment(noteId, text, author = "Anonim") {
    if (!this.comments[noteId]) this.comments[noteId] = [];
    const nc = {
      noteId,
      author: this.sanitizeHTML(author.trim()) || "Anonim",
      text: this.sanitizeHTML(text.trim()),
      date: new Date().toISOString(),
    };
    if (this.supabaseService?.isConnected) {
      const sc = await this.supabaseService.addComment(nc);
      nc.id = sc.id;
      this.comments[noteId].push(nc);
      CustomAlert.show("Komentar terkirim!", "success", 2000);
    } else throw new Error("Offline");
    return nc;
  }

  getFilteredAndSortedNotes(subject = "all", sort = "likes") {
    let res = [...this.notes];
    if (subject !== "all") res = res.filter((n) => n.subject === subject);
    if (sort === "likes") res.sort((a, b) => b.likes - a.likes);
    else if (sort === "recent")
      res.sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (sort === "oldest")
      res.sort((a, b) => new Date(a.date) - new Date(b.date));
    return res;
  }

  isInitialized() {
    return this.initialized;
  }
  async refreshData() {
    return this.fetchWithRetry();
  }
}

// ====================================================
// GLOBAL FUNCTIONS & EVENTS
// ====================================================

// Initialization
const notesManager = new NotesManager();

let currentImageUrl = "";
function openImageModal(url) {
  currentImageUrl = url;
  document.getElementById("modalImage").src = url;
  document.getElementById("imageModal").classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeImageModal() {
  document.getElementById("imageModal").classList.remove("show");
  document.body.style.overflow = "";
}
function downloadImage() {
  if (!currentImageUrl) return;
  downloadImageFromUrl(currentImageUrl);
}
function downloadImageFromUrl(url, name = "download.jpg") {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function forceRefreshAll() {
  LoadingSpinner.show("Menyinkronkan data...");
  try {
    await notesManager.refreshData();
    CustomAlert.show("Data disinkronkan!", "success");
  } catch {
    CustomAlert.show("Gagal sinkronisasi", "error");
  }
}

async function handleLike(id) {
  if (await notesManager.toggleLike(id)) refreshNotesDisplay();
}
async function handleDislike(id) {
  if (await notesManager.toggleDislike(id)) refreshNotesDisplay();
}

async function handleAddComment(id, btn) {
  const p = btn.closest(".comment-input-group");
  const auth = p.querySelector(".comment-author").value,
    txt = p.querySelector(".comment-input").value;
  if (!auth || !txt)
    return CustomAlert.show("Isi nama dan komentar!", "warning");
  try {
    await notesManager.addComment(id, txt, auth);
    refreshNotesDisplay();
    p.querySelector(".comment-input").value = "";
  } catch (e) {
    CustomAlert.show(e.message, "error");
  }
}

function filterBySubject(s) {
  const el = document.getElementById("subjectFilter");
  if (el) {
    el.value = s;
    refreshNotesDisplay();
    document
      .getElementById("notesContainer")
      .scrollIntoView({ behavior: "smooth" });
  }
}

function scrollToNote(id) {
  const el = document.querySelector(`[data-note-id="${id}"]`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
    el.style.animation = "none";
    setTimeout(() => (el.style.animation = "fadeIn 0.5s ease"), 10);
  }
}

function setupImagePreview() {
  const area = document.getElementById("fileUploadArea");
  const input = document.getElementById("noteImage");
  const preview = document.getElementById("imagePreview");
  const placeholder = document.getElementById("uploadPlaceholder");
  const removeBtn = document.getElementById("removeImageBtn");

  if (!area || !input) return;

  // Handle saat file dipilih
  input.addEventListener("change", (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validasi ukuran (misal max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        CustomAlert.show("Ukuran file terlalu besar! Maksimal 5MB.", "warning");
        input.value = ""; // Reset
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        // Tampilkan gambar, sembunyikan placeholder text
        preview.innerHTML = `<img src="${ev.target.result}" alt="Preview">`;
        preview.style.display = "flex";
        placeholder.style.display = "none";

        // Tampilkan tombol hapus
        if (removeBtn) removeBtn.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle tombol hapus gambar
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      input.value = ""; // Reset input file
      preview.innerHTML = "";
      preview.style.display = "none";
      placeholder.style.display = "block";
      removeBtn.style.display = "none";
    });
  }
}

function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Hitung rasio aspek baru
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert ke Base64 dengan kualitas lebih rendah (JPG)
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

async function handleUpload(e) {
  e.preventDefault();

  const title = document.getElementById("noteTitle").value;
  const subj = document.getElementById("noteSubject").value;
  const content = document.getElementById("noteContent").value;
  const auth = document.getElementById("authorName").value;
  const fileInput = document.getElementById("noteImage");
  const file = fileInput ? fileInput.files[0] : null;

  if (!title || !subj || !content || !auth) {
    return CustomAlert.show(
      "Harap isi Judul, Mata Pelajaran, Konten, dan Nama Penulis!",
      "warning"
    );
  }

  LoadingSpinner.show("Mengompres & Mengupload...");

  try {
    let imageData = null;

    // JIKA ADA FILE, KOMPRES DULU
    if (file) {
      // Validasi ukuran awal (turunkan jadi 4MB agar aman)
      if (file.size > 4 * 1024 * 1024) {
        throw new Error("Ukuran file terlalu besar! Maksimal 4MB.");
      }
      // Lakukan kompresi (resize ke lebar 800px, kualitas 70%)
      imageData = await compressImage(file, 800, 0.7);
    }

    // Kirim ke database
    await notesManager.addNote(title, subj, content, auth, imageData);

    LoadingSpinner.hide();
    CustomAlert.show("Berhasil upload!", "success");

    const successMsg = document.getElementById("uploadSuccess");
    if (successMsg) successMsg.classList.add("show");

    e.target.reset();
    document.getElementById("imagePreview").style.display = "none";
    document.getElementById("uploadPlaceholder").style.display = "block";
    const removeBtn = document.getElementById("removeImageBtn");
    if (removeBtn) removeBtn.style.display = "none";
  } catch (err) {
    LoadingSpinner.hide();
    console.error("Upload Error:", err); // Cek console browser
    CustomAlert.show("Gagal Upload: " + err.message, "error");
  }
}

function refreshNotesDisplay() {
  const cont = document.getElementById("notesContainer");
  if (cont && notesManager.isInitialized()) {
    const subj = document.getElementById("subjectFilter")?.value || "all";
    const sort = document.getElementById("sortFilter")?.value || "likes";
    const notes = notesManager.getFilteredAndSortedNotes(subj, sort);
    DOM.renderNotes(notes, cont);
    updateHomepageSections();
  } else setTimeout(refreshNotesDisplay, 500);
}

function updateHomepageSections() {
  const countEl = document.getElementById("totalNotesCount");
  if (countEl) countEl.textContent = notesManager.getTotalNotes();
  const subjEl = document.getElementById("totalSubjectsCount");
  if (subjEl) subjEl.textContent = notesManager.getTotalSubjects();
  DOM.renderNoteOfTheDay(notesManager.getNoteOfTheDay());
  DOM.renderTrendingSection(notesManager.getTrendingNotes());
  DOM.renderCategories();
  DOM.renderActivityFeed(notesManager.getRecentActivity());
}

function resetFilters() {
  if (document.getElementById("subjectFilter"))
    document.getElementById("subjectFilter").value = "all";
  if (document.getElementById("sortFilter"))
    document.getElementById("sortFilter").value = "likes";
  refreshNotesDisplay();
}

function toggleFeaturedSection() {
  const sec = document.getElementById("featuredSection");
  if (sec.style.display === "none") {
    sec.style.display = "block";
    sec.classList.add("show");
  } else {
    sec.style.display = "none";
    sec.classList.remove("show");
  }
}

// Global Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 App Loaded");
  if (document.getElementById("notesContainer")) {
    document
      .getElementById("subjectFilter")
      ?.addEventListener("change", refreshNotesDisplay);
    document
      .getElementById("sortFilter")
      ?.addEventListener("change", refreshNotesDisplay);
    document
      .getElementById("featuredMenuBtn")
      ?.addEventListener("click", toggleFeaturedSection);
    refreshNotesDisplay();
  }
  const upForm = document.getElementById("uploadForm");
  if (upForm) {
    upForm.addEventListener("submit", handleUpload);
    setupImagePreview();
  }
});

window.forceRefreshAll = forceRefreshAll;
window.resetFilters = resetFilters;
window.handleLike = handleLike;
window.handleDislike = handleDislike;
window.handleAddComment = handleAddComment;
window.filterBySubject = filterBySubject;
window.scrollToNote = scrollToNote;
window.toggleFeaturedSection = toggleFeaturedSection;
window.closeReportModal = () =>
  (document.getElementById("reportModal").style.display = "none");
window.showReportModal = () =>
  (document.getElementById("reportModal").style.display = "block");
window.closeImageModal = closeImageModal;
window.openImageModal = openImageModal;
window.downloadImage = downloadImage;
window.downloadImageFromUrl = downloadImageFromUrl;
window.notesManager = notesManager;

console.log("✅ Functions Exposed");

document.addEventListener("DOMContentLoaded", () => {

  const hasSeenPromo = sessionStorage.getItem("hasSeenPromo");

  if (!hasSeenPromo) {
    setTimeout(() => {
      const promoModal = document.getElementById("promoModal");
      if (promoModal) {
        promoModal.classList.add("show");
      }
    }, 1500);
  }
});

function closePromoModal() {
  const promoModal = document.getElementById("promoModal");
  if (promoModal) {
    promoModal.classList.remove("show");
    sessionStorage.setItem("hasSeenPromo", "true");
  }
}

window.closePromoModal = closePromoModal;


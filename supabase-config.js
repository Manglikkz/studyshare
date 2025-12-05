// supabase-config.js

// ngambil data penting dari .env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "❌ Supabase Env Variables Missing! Pastikan file .env sudah dibuat."
  );
}

console.log("🚀 Starting Supabase initialization...");

// Initialize Supabase client
let supabase;
let supabaseService;

try {
  // Check if supabase library is loaded
  if (!window.supabase || !window.supabase.createClient) {
    console.error("❌ Supabase JS library not loaded!");
    throw new Error("Supabase JS library not found");
  }

  console.log("📦 Supabase library found, creating client...");

  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: "public",
    },
    global: {
      headers: {
        "Content-Type": "application/json",
      },
    },
  });

  console.log("✅ Supabase client created");

  // Supabase Service
  class SupabaseService {
    constructor() {
      this.client = supabase;
      this.isConnected = false;
      this.connectionChecked = false;
      console.log("🔄 SupabaseService instance created");
    }

    async checkConnection() {
      if (this.connectionChecked) {
        console.log("📡 Connection already checked");
        return this.isConnected;
      }

      console.log("🔌 Checking Supabase connection...");

      try {
        // Simple connection test
        const { data, error } = await this.client
          .from("notes")
          .select("count", { count: "exact", head: true })
          .limit(1);

        if (error) {
          console.error("❌ Connection test failed:", error.message);
          this.isConnected = false;
        } else {
          console.log("✅ Connection test successful");
          this.isConnected = true;
        }

        this.connectionChecked = true;
        return this.isConnected;
      } catch (error) {
        console.error("❌ Connection error:", error.message);
        this.isConnected = false;
        this.connectionChecked = true;
        return false;
      }
    }

    async getNotes() {
      const isConnected = await this.checkConnection();

      if (!isConnected) {
        console.warn("⚠️ Supabase not connected, returning empty array");
        return [];
      }

      console.log("📥 Fetching notes from Supabase...");
      try {
        const { data, error } = await this.client
          .from("notes")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("❌ Error fetching notes:", error);
          return [];
        }

        console.log(`✅ Loaded ${data?.length || 0} notes`);
        return data || [];
      } catch (error) {
        console.error("❌ Failed to fetch notes:", error);
        return [];
      }
    }

    async addNote(note) {
      const isConnected = await this.checkConnection();

      if (!isConnected) {
        throw new Error("❌ Supabase not connected");
      }

      console.log("💾 Saving note to Supabase...");

      const noteData = {
        title: note.title?.trim() || "",
        subject: note.subject || "other",
        content: note.content?.trim() || "",
        author: note.author?.trim() || "Anonim",
        likes_count: parseInt(note.likes) || 0,
        dislikes_count: parseInt(note.dislikes) || 0,
      };

      if (note.image && note.image !== "null") {
        noteData.image_url = note.image;
      }

      try {
        const { data, error } = await this.client
          .from("notes")
          .insert([noteData])
          .select();

        if (error) {
          console.error("❌ Error adding note:", error);
          throw new Error(`Failed to save: ${error.message}`);
        }

        console.log(`✅ Note saved with ID: ${data[0]?.id}`);
        return data[0];
      } catch (error) {
        console.error("❌ Failed to add note:", error);
        throw error;
      }
    }

    async deleteNote(noteId) {
      const isConnected = await this.checkConnection();

      if (!isConnected) {
        throw new Error("❌ Supabase not connected");
      }

      console.log(`🗑️ Deleting note: ${noteId}`);

      try {
        // 1. Hapus likes
        const { error: likesError } = await this.client
          .from("likes")
          .delete()
          .eq("note_id", noteId);

        if (likesError) {
          console.warn("⚠️ Error deleting likes:", likesError.message);
        }

        // 2. Hapus comments
        const { error: commentsError } = await this.client
          .from("comments")
          .delete()
          .eq("note_id", noteId);

        if (commentsError) {
          console.warn("⚠️ Error deleting comments:", commentsError.message);
        }

        // 3. Hapus note
        const { error } = await this.client
          .from("notes")
          .delete()
          .eq("id", noteId);

        if (error) {
          console.error("❌ Error deleting note:", error);
          throw error;
        }

        console.log("✅ Note and all related data deleted");
        return true;
      } catch (error) {
        console.error("❌ Failed to delete note:", error);
        throw error;
      }
    }

    async getLikes(noteId) {
      const isConnected = await this.checkConnection();

      if (!isConnected) {
        return [];
      }

      try {
        const { data, error } = await this.client
          .from("likes")
          .select("*")
          .eq("note_id", noteId);

        if (error) {
          console.error("❌ Error fetching likes:", error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.error("❌ Failed to fetch likes:", error);
        return [];
      }
    }

    async toggleLike(noteId, userId, type = "like") {
      const isConnected = await this.checkConnection();

      if (!isConnected) {
        throw new Error("❌ Supabase not connected");
      }

      try {
        // Check if user already reacted
        const { data: existingReaction, error: checkError } = await this.client
          .from("likes")
          .select("*")
          .eq("note_id", noteId)
          .eq("user_id", userId)
          .maybeSingle();

        if (checkError && checkError.code !== "PGRST116") {
          console.error("❌ Error checking reaction:", checkError);
          throw checkError;
        }

        if (existingReaction) {
          if (existingReaction.type === type) {
            // Hapus reaksi
            const { error } = await this.client
              .from("likes")
              .delete()
              .eq("id", existingReaction.id);

            if (error) throw error;
            return { reaction: null, type: "removed" };
          } else {
            // Update reaksi
            const { data, error } = await this.client
              .from("likes")
              .update({ type: type })
              .eq("id", existingReaction.id)
              .select();

            if (error) throw error;
            return { reaction: data[0], type: "updated" };
          }
        } else {
          // Tambah reaksi baru
          const { data, error } = await this.client
            .from("likes")
            .insert([
              {
                note_id: noteId,
                user_id: userId,
                type: type,
              },
            ])
            .select();

          if (error) throw error;
          return { reaction: data[0], type: "added" };
        }
      } catch (error) {
        console.error("❌ Failed to toggle like:", error);
        throw error;
      }
    }

    async getComments(noteId) {
      const isConnected = await this.checkConnection();

      if (!isConnected) {
        return [];
      }

      try {
        const { data, error } = await this.client
          .from("comments")
          .select("*")
          .eq("note_id", noteId)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("❌ Error fetching comments:", error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.error("❌ Failed to fetch comments:", error);
        return [];
      }
    }

    async addComment(comment) {
      const isConnected = await this.checkConnection();

      if (!isConnected) {
        throw new Error("❌ Supabase not connected");
      }

      console.log("💬 Adding comment to Supabase...");
      try {
        const { data, error } = await this.client
          .from("comments")
          .insert([
            {
              note_id: comment.noteId,
              author: comment.author?.trim() || "Anonim",
              text: comment.text?.trim() || "",
            },
          ])
          .select();

        if (error) {
          console.error("❌ Error adding comment:", error);
          throw error;
        }
        console.log("✅ Comment saved");
        return data[0];
      } catch (error) {
        console.error("❌ Failed to add comment:", error);
        throw error;
      }
    }

    async updateNoteStats(noteId, likes, dislikes) {
      const isConnected = await this.checkConnection();

      if (!isConnected) {
        return false;
      }

      try {
        const { error } = await this.client
          .from("notes")
          .update({
            likes_count: parseInt(likes) || 0,
            dislikes_count: parseInt(dislikes) || 0,
          })
          .eq("id", noteId);

        if (error) {
          console.error("❌ Error updating note stats:", error);
          return false;
        }
        return true;
      } catch (error) {
        console.error("❌ Failed to update note stats:", error);
        return false;
      }
    }

    async getTotalLikes() {
      const isConnected = await this.checkConnection();

      if (!isConnected) return 0;

      try {
        const { data, error } = await this.client
          .from("notes")
          .select("likes_count");

        if (error) return 0;

        return data.reduce((sum, note) => sum + (note.likes_count || 0), 0);
      } catch {
        return 0;
      }
    }

    async getTotalComments() {
      const isConnected = await this.checkConnection();

      if (!isConnected) return 0;

      try {
        const { count, error } = await this.client
          .from("comments")
          .select("*", { count: "exact", head: true });

        if (error) return 0;
        return count || 0;
      } catch {
        return 0;
      }
    }
  }

  // Initialize Supabase service
  supabaseService = new SupabaseService();
  console.log("✅ SupabaseService initialized");

  // Test connection after a short delay
  setTimeout(async () => {
    console.log("🧪 Testing connection after initialization...");
    const isConnected = await supabaseService.checkConnection();
    console.log(
      `📊 Final connection status: ${
        isConnected ? "✅ Connected" : "❌ Not Connected"
      }`
    );
  }, 1000);
} catch (error) {
  console.error("❌ Failed to initialize Supabase:", error);

  // Create fallback service
  supabaseService = {
    client: null,
    isConnected: false,
    connectionChecked: true,
    checkConnection: async () => {
      console.log("⚠️ Fallback service - no connection");
      return false;
    },
    getNotes: async () => {
      console.log("⚠️ Fallback service - returning empty notes");
      return [];
    },
    addNote: async () => {
      console.log("⚠️ Fallback service - cannot add note");
      throw new Error("Supabase not available");
    },
    deleteNote: async () => {
      console.log("⚠️ Fallback service - cannot delete note");
      throw new Error("Supabase not available");
    },
    getLikes: async () => [],
    toggleLike: async () => {
      throw new Error("Supabase not available");
    },
    getComments: async () => [],
    addComment: async () => {
      throw new Error("Supabase not available");
    },
    updateNoteStats: async () => false,
    getTotalLikes: async () => 0,
    getTotalComments: async () => 0,
  };
}

// Export for use in other files
window.supabaseService = supabaseService;
console.log("✅ Supabase service exposed to window");

/**
 * Edy Voice Widget - Web Component
 *
 * Uso:
 * <edy-voice-widget
 *   livekit-url="wss://..."
 *   api-url="/api/agent/token"
 *   room="edtech-widget"
 *   student-id="optional-student-id">
 * </edy-voice-widget>
 * <script src="edy-widget.js"></script>
 *
 * Requiere livekit-client cargado globalmente o por CDN:
 * <script src="https://cdn.jsdelivr.net/npm/livekit-client@2/dist/livekit-client.umd.js"></script>
 */

class EdyVoiceWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.room = null;
    this.audioEl = null;
    this.connected = false;
    this.transcript = [];
  }

  static get observedAttributes() {
    return ["livekit-url", "api-url", "room", "student-id"];
  }

  get livekitUrl() {
    return this.getAttribute("livekit-url") || "wss://edutech-meo77bh3.livekit.cloud";
  }

  get apiUrl() {
    return this.getAttribute("api-url") || "/api/agent/token";
  }

  get roomName() {
    return this.getAttribute("room") || "edtech-widget";
  }

  get studentId() {
    return this.getAttribute("student-id") || "";
  }

  async connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  disconnectedCallback() {
    this.disconnect();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --primary: #3b82f6;
          --primary-hover: #2563eb;
          --bg: #ffffff;
          --bg-muted: #f9fafb;
          --border: #e5e7eb;
          --text: #111827;
          --text-muted: #6b7280;
          --green: #10b981;
          --red: #ef4444;
          --yellow: #f59e0b;
        }

        .edy-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 380px;
          max-width: 90vw;
          max-height: 80vh;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: none;
          flex-direction: column;
          background: var(--bg);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18);
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        .edy-container.open {
          display: flex;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .edy-header {
          padding: 14px 16px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-muted);
        }

        .edy-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .edy-status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--red);
          transition: background 0.3s;
        }

        .edy-status-dot.connected { background: var(--green); }
        .edy-status-dot.connecting { background: var(--yellow); animation: pulse 1.5s infinite; }
        .edy-status-dot.speaking { background: var(--primary); animation: pulse 1s infinite; }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .edy-header h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
        }

        .edy-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: var(--text-muted);
          padding: 4px;
        }

        .edy-close:hover { color: var(--text); }

        .edy-content {
          flex: 1;
          padding: 12px 16px;
          min-height: 180px;
          max-height: 360px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .edy-msg {
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 13px;
          line-height: 1.5;
          max-width: 85%;
          word-wrap: break-word;
        }

        .edy-msg.user {
          background: var(--primary);
          color: white;
          align-self: flex-end;
        }

        .edy-msg.agent {
          background: var(--bg-muted);
          color: var(--text);
          align-self: flex-start;
          border: 1px solid var(--border);
        }

        .edy-msg.error {
          background: #fef2f2;
          color: var(--red);
          text-align: center;
          align-self: center;
          max-width: 100%;
        }

        .edy-msg .sender {
          font-size: 10px;
          font-weight: 600;
          opacity: 0.7;
          margin-bottom: 2px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .edy-status {
          font-size: 12px;
          color: var(--text-muted);
          text-align: center;
          padding: 8px 16px;
          border-top: 1px solid var(--border);
        }

        .edy-status.connected { color: var(--green); }

        .edy-footer {
          padding: 10px 16px;
          border-top: 1px solid var(--border);
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .edy-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 13px;
          color: var(--text);
          background: var(--bg);
          outline: none;
          transition: border-color 0.2s;
        }

        .edy-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .edy-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .edy-send {
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 8px;
          width: 36px;
          height: 36px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          flex-shrink: 0;
        }

        .edy-send:hover { background: var(--primary-hover); }
        .edy-send:disabled { opacity: 0.5; cursor: not-allowed; }

        .edy-hint {
          font-size: 10px;
          color: var(--text-muted);
          text-align: center;
          padding: 4px 16px 8px;
          opacity: 0.6;
        }

        /* Botón flotante */
        .edy-fab {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), #1e40af);
          border: none;
          color: white;
          font-size: 28px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.45);
          transition: transform 0.2s, box-shadow 0.2s;
          z-index: 9998;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .edy-fab:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 24px rgba(59, 130, 246, 0.6);
        }

        .edy-fab.hidden { display: none; }
      </style>

      <button class="edy-fab" title="Habla con Edy">🎙️</button>

      <div class="edy-container">
        <div class="edy-header">
          <div class="edy-header-left">
            <div class="edy-status-dot" id="statusDot"></div>
            <h3>Edy — Asistente de Cursos</h3>
          </div>
          <button class="edy-close" title="Cerrar">✕</button>
        </div>

        <div class="edy-content" id="content"></div>

        <div class="edy-status" id="statusBar">Iniciando...</div>

        <div class="edy-footer">
          <input
            type="text"
            class="edy-input"
            id="textInput"
            placeholder="Escribe un mensaje..."
            disabled
          />
          <button class="edy-send" id="sendBtn" disabled title="Enviar">➤</button>
        </div>

        <div class="edy-hint">
          También puedes usar el micrófono 🎙️
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const fab = this.shadowRoot.querySelector(".edy-fab");
    const closeBtn = this.shadowRoot.querySelector(".edy-close");
    const container = this.shadowRoot.querySelector(".edy-container");
    const input = this.shadowRoot.querySelector("#textInput");
    const sendBtn = this.shadowRoot.querySelector("#sendBtn");

    fab.addEventListener("click", () => {
      container.classList.toggle("open");
      fab.classList.toggle("hidden", container.classList.contains("open"));
      if (container.classList.contains("open") && !this.connected) {
        this.connect();
      }
    });

    closeBtn.addEventListener("click", () => {
      container.classList.remove("open");
      fab.classList.remove("hidden");
      this.disconnect();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && input.value.trim()) {
        e.preventDefault();
        this.sendText(input.value);
        input.value = "";
      }
    });

    sendBtn.addEventListener("click", () => {
      if (input.value.trim()) {
        this.sendText(input.value);
        input.value = "";
      }
    });
  }

  addMessage(role, text) {
    const content = this.shadowRoot.querySelector("#content");
    const msg = document.createElement("div");
    msg.className = `edy-msg ${role === "user" ? "user" : "agent"}`;

    const sender = document.createElement("div");
    sender.className = "sender";
    sender.textContent = role === "user" ? "Tú" : "Edy";

    const body = document.createElement("p");
    body.textContent = text;

    msg.appendChild(sender);
    msg.appendChild(body);
    content.appendChild(msg);
    content.scrollTop = content.scrollHeight;

    // Guardar en transcript
    this.transcript.push({ role, text, time: Date.now() });
  }

  setError(text) {
    const content = this.shadowRoot.querySelector("#content");
    const msg = document.createElement("div");
    msg.className = "edy-msg error";
    msg.textContent = text;
    content.appendChild(msg);
  }

  setStatus(text, state) {
    const bar = this.shadowRoot.querySelector("#statusBar");
    const dot = this.shadowRoot.querySelector("#statusDot");
    bar.textContent = text;
    bar.className = `edy-status ${state || ""}`;
    dot.className = `edy-status-dot ${state || ""}`;
  }

  setEnabled(enabled) {
    const input = this.shadowRoot.querySelector("#textInput");
    const sendBtn = this.shadowRoot.querySelector("#sendBtn");
    input.disabled = !enabled;
    sendBtn.disabled = !enabled;
  }

  async connect() {
    if (this.room && this.connected) return;

    try {
      this.setStatus("Conectando...", "connecting");

      // Cargar livekit-client si no está disponible globalmente
      if (typeof LivekitClient === "undefined") {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/livekit-client@2/dist/livekit-client.umd.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Obtener token
      const resp = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: this.roomName, studentId: this.studentId || undefined }),
      });

      if (!resp.ok) {
        throw new Error(`Token error: ${resp.status}`);
      }

      const { token } = await resp.json();

      // Crear sala
      const r = new LivekitClient.Room({
        adaptiveStream: true,
        dynacast: true,
      });

      this.room = r;

      // Escuchar mensajes del agente por data channel
      r.on(LivekitClient.RoomEvent.DataReceived, (payload, participant) => {
        try {
          const data = JSON.parse(new TextDecoder().decode(payload));
          if (data.type === "agent_speech" && data.text) {
            this.addMessage("agent", data.text);
          }
        } catch (e) {
          // Ignorar paquetes que no son JSON válido
        }
      });

      // Audio del agente
      r.on(LivekitClient.RoomEvent.TrackSubscribed, (track, pub, participant) => {
        if (track.kind === LivekitClient.Track.Kind.Audio) {
          if (!this.audioEl) {
            this.audioEl = document.createElement("audio");
            this.audioEl.autoplay = true;
            this.audioEl.style.display = "none";
            document.body.appendChild(this.audioEl);
          }
          track.attach(this.audioEl);
          this.audioEl.play().catch(() => {});
        }
      });

      r.on(LivekitClient.RoomEvent.TrackUnsubscribed, (track) => {
        if (track.kind === LivekitClient.Track.Kind.Audio && this.audioEl) {
          track.detach(this.audioEl);
        }
      });

      // Estado de speakers
      r.on(LivekitClient.RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const isAgentSpeaking = speakers.some(
          (s) => s.identity !== r.localParticipant.identity
        );
        if (isAgentSpeaking) {
          this.setStatus("Edy hablando...", "speaking");
        } else if (this.connected) {
          this.setStatus("Conectado", "connected");
        }
      });

      r.on(LivekitClient.RoomEvent.Disconnected, () => {
        this.connected = false;
        this.setStatus("Desconectado", "");
        this.setEnabled(false);
      });

      r.on(LivekitClient.RoomEvent.ParticipantConnected, (p) => {
        console.log("[EdyWidget] Agent connected:", p.identity);
      });

      // Conectar
      await r.connect(this.roomName ? `wss://${new URL(this.livekitUrl).host}` : this.livekitUrl, token);

      // Publicar micrófono
      const tracks = await LivekitClient.createLocalTracks({ audio: true, video: false });
      for (const track of tracks) {
        await r.localParticipant.publishTrack(track);
      }

      this.connected = true;
      this.setStatus("Conectado", "connected");
      this.setEnabled(true);
      this.addMessage("agent", "Hola, soy Edy. ¿En qué puedo ayudarle hoy?");

    } catch (err) {
      console.error("[EdyWidget] Connection error:", err);
      this.setStatus("Error de conexión", "");
      this.setError(`No pude conectar: ${err.message}`);
    }
  }

  async sendText(text) {
    const trimmed = text.trim();
    if (!trimmed || !this.room || !this.connected) return;

    // Mostrar en chat
    this.addMessage("user", trimmed);

    // Enviar usando sendText con topic "lk.chat" — el SDK del agente
    // escucha este topic nativamente y procesa el mensaje correctamente
    try {
      await this.room.localParticipant.sendText(trimmed, { topic: "lk.chat" });
      console.log("[EdyWidget] Text sent via lk.chat:", trimmed);
    } catch (err) {
      console.error("[EdyWidget] sendText failed, trying publishData:", err);
      // Fallback
      try {
        const payload = JSON.stringify({ type: "user_text", text: trimmed });
        await this.room.localParticipant.publishData(payload, { reliable: true });
      } catch (e) {
        console.error("[EdyWidget] Fallback also failed:", e);
      }
    }
  }

  disconnect() {
    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }
    if (this.audioEl) {
      this.audioEl.srcObject = null;
    }
    this.connected = false;
    this.setStatus("Desconectado", "");
    this.setEnabled(false);
  }
}

// Registrar el Web Component
customElements.define("edy-voice-widget", EdyVoiceWidget);

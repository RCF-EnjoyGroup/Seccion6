/**
 * Edy Voice Widget - Web Component
 *
 * Uso:
 * <edy-voice-widget
 *   livekit-url="wss://..."
 *   api-key="..."
 *   api-secret="..."
 *   room="edtech-widget">
 * </edy-voice-widget>
 * <script src="edy-widget.js"></script>
 */

class EdyVoiceWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isConnected_ = false;
    this.room = null;
  }

  async connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    const style = `
      :host {
        --primary-color: #3b82f6;
        --bg-color: #ffffff;
      }

      .edy-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 80px;
        height: 80px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .edy-button {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary-color), #1e40af);
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .edy-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
      }

      .edy-button.listening {
        animation: pulse 1.5s infinite;
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.8; }
      }

      .edy-modal {
        display: none;
        position: fixed;
        bottom: 100px;
        right: 20px;
        width: 350px;
        max-width: 90vw;
        background: var(--bg-color);
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        z-index: 9998;
        animation: slideUp 0.3s ease;
      }

      .edy-modal.open {
        display: flex;
        flex-direction: column;
      }

      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      .edy-header {
        padding: 16px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .edy-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
      }

      .edy-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #6b7280;
      }

      .edy-content {
        flex: 1;
        padding: 16px;
        min-height: 200px;
        max-height: 400px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .edy-message {
        padding: 10px 12px;
        border-radius: 8px;
        font-size: 14px;
        line-height: 1.4;
      }

      .edy-message.user {
        background: var(--primary-color);
        color: white;
        align-self: flex-end;
        max-width: 80%;
      }

      .edy-message.edy {
        background: #f3f4f6;
        color: #1f2937;
        align-self: flex-start;
        max-width: 80%;
      }

      .edy-message.error {
        background: #fee2e2;
        color: #dc2626;
        text-align: center;
      }

      .edy-footer {
        padding: 12px 16px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 8px;
      }

      .edy-input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
      }

      .edy-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .edy-send {
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 6px;
        width: 36px;
        height: 36px;
        cursor: pointer;
        font-size: 16px;
      }

      .edy-send:hover {
        background: #1e40af;
      }

      .edy-status {
        font-size: 12px;
        color: #6b7280;
        text-align: center;
        padding: 8px;
      }

      .edy-status.connected {
        color: #10b981;
      }

      .edy-status.error {
        color: #dc2626;
      }
    `;

    this.shadowRoot.innerHTML = `
      <style>${style}</style>
      <div class="edy-container">
        <button class="edy-button" title="Habla con Edy">🎤</button>

        <div class="edy-modal">
          <div class="edy-header">
            <h3>Edy - Asistente de Cursos</h3>
            <button class="edy-close">×</button>
          </div>

          <div class="edy-content"></div>

          <div class="edy-status">
            Conectando...
          </div>

          <div class="edy-footer">
            <input
              type="text"
              class="edy-input"
              placeholder="O escribe aquí..."
              disabled>
            <button class="edy-send" disabled>↓</button>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const button = this.shadowRoot.querySelector('.edy-button');
    const closeBtn = this.shadowRoot.querySelector('.edy-close');
    const modal = this.shadowRoot.querySelector('.edy-modal');
    const input = this.shadowRoot.querySelector('.edy-input');
    const sendBtn = this.shadowRoot.querySelector('.edy-send');

    button.addEventListener('click', () => {
      modal.classList.toggle('open');
      if (modal.classList.contains('open')) {
        this.initializeConnection();
      }
    });

    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
      if (this.room) {
        this.room.disconnect();
      }
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        this.sendMessage(input.value);
        input.value = '';
      }
    });

    sendBtn.addEventListener('click', () => {
      if (input.value.trim()) {
        this.sendMessage(input.value);
        input.value = '';
      }
    });
  }

  async initializeConnection() {
    const status = this.shadowRoot.querySelector('.edy-status');
    const input = this.shadowRoot.querySelector('.edy-input');
    const sendBtn = this.shadowRoot.querySelector('.edy-send');

    try {
      status.textContent = 'Conectando a Edy...';
      status.className = 'edy-status';

      // Aquí iría la lógica real de conexión LiveKit
      // Por ahora, simulamos con un mensaje
      this.addMessage('Hola 👋 Soy Edy, tu asistente de cursos. ¿En qué puedo ayudarte hoy?', 'edy');

      status.textContent = 'Conectado';
      status.className = 'edy-status connected';

      input.disabled = false;
      sendBtn.disabled = false;
    } catch (error) {
      status.textContent = `Error: ${error.message}`;
      status.className = 'edy-status error';
      this.addMessage('No pude conectar con Edy. Intenta de nuevo.', 'error');
    }
  }

  sendMessage(text) {
    this.addMessage(text, 'user');
    // Aquí iría la lógica de enviar al agente
    // Por ahora simulamos respuesta
    setTimeout(() => {
      this.addMessage(`Entendido: "${text}". Estoy buscando cursos para ti...`, 'edy');
    }, 500);
  }

  addMessage(text, sender) {
    const content = this.shadowRoot.querySelector('.edy-content');
    const msg = document.createElement('div');
    msg.className = `edy-message ${sender}`;
    msg.textContent = text;
    content.appendChild(msg);
    content.scrollTop = content.scrollHeight;
  }
}

// Registrar el Web Component
customElements.define('edy-voice-widget', EdyVoiceWidget);

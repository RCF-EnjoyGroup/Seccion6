"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Track } from "livekit-client";
import type {
  Room,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteAudioTrack,
  Participant,
} from "livekit-client";

interface EdyVoiceWidgetProps {
  livekitUrl: string;
  room: string;
  studentId?: string;
}

interface Message {
  id: string;
  role: "user" | "ady";
  text: string;
}

export default function EdyVoiceWidget({
  livekitUrl,
  room,
  studentId,
}: EdyVoiceWidgetProps) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);

  const roomRef = useRef<Room | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const connectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasConnectedRef = useRef(false);

  const addMessage = useCallback((role: "user" | "ady", text: string) => {
    setTranscript((prev) => [
      ...prev.slice(-12),
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, role, text },
    ]);
  }, []);

  // Audio de ElevenLabs via LiveKit track — sin fallback del navegador
  const attachAudioTrack = useCallback((track: RemoteAudioTrack) => {
    let audioEl = audioElRef.current;
    if (!audioEl) {
      audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      audioEl.style.display = "none";
      document.body.appendChild(audioEl);
      audioElRef.current = audioEl;
    }
    track.attach(audioEl);
    audioEl.play().catch((err: unknown) => {
      console.warn("[EdyWidget] Audio autoplay blocked:", err);
    });
  }, []);

  const detachAudioTrack = useCallback((track: RemoteAudioTrack) => {
    const audioEl = audioElRef.current;
    if (audioEl) track.detach(audioEl);
  }, []);

  const disconnect = useCallback(() => {
    if (roomRef.current) {
      console.log("[EdyWidget] Disconnecting...");
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    if (audioElRef.current) {
      audioElRef.current.srcObject = null;
    }
    setConnected(false);
    setConnecting(false);
    setSpeaking(false);
    hasConnectedRef.current = false;
  }, []);

  const connect = useCallback(async () => {
    if (hasConnectedRef.current || connecting) {
      console.log("[EdyWidget] Already connected/connecting, skipping");
      return;
    }
    hasConnectedRef.current = true;
    setConnecting(true);
    setError(null);

    console.log("[EdyWidget] Starting connection to:", livekitUrl, "room:", room);

    try {
      const LiveKitModule = await import("livekit-client");
      const { Room, createLocalTracks, RoomEvent, ParticipantEvent } = LiveKitModule;

      console.log("[EdyWidget] Requesting token...");
      const tokenResponse = await fetch("/api/agent/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room, studentId }),
      });

      console.log("[EdyWidget] Token response status:", tokenResponse.status);

      if (!tokenResponse.ok) {
        const errText = await tokenResponse.text();
        console.error("[EdyWidget] Token error:", errText);
        throw new Error(`Failed to get LiveKit token: ${tokenResponse.status} ${errText}`);
      }

      const { token } = await tokenResponse.json();
      console.log("[EdyWidget] Token received, length:", token?.length);

      const r = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      roomRef.current = r;

      // Recibir texto del agente por data channel (transcripción visible + fallback voz)
      r.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: Participant) => {
        try {
          const text = new TextDecoder().decode(payload);
          const data = JSON.parse(text) as { type?: string; text?: string };
          if (data.type === "agent_speech" && data.text) {
            console.log("[EdyWidget] Agent speech from", participant?.identity, ":", data.text);
            addMessage("ady", data.text);
            // La voz la sintetiza ElevenLabs via LiveKit audio track, no usar speechSynthesis
          }
        } catch (e) {
          console.error("[EdyWidget] Failed to parse data packet:", e);
        }
      });

      // Suscribirse a las pistas de audio que publique el agente (TTS ElevenLabs)
      r.on(RoomEvent.TrackPublished, (pub: RemoteTrackPublication, _participant: RemoteParticipant) => {
        console.log("[EdyWidget] TrackPublished:", pub.kind, "from", _participant.identity);
        if (pub.kind === Track.Kind.Audio) {
          pub.setSubscribed(true);
        }
      });

      r.on(RoomEvent.TrackSubscribed, (track: Track, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        console.log("[EdyWidget] TrackSubscribed:", track.kind, "from", participant.identity);
        if (track.kind === Track.Kind.Audio) {
          attachAudioTrack(track as RemoteAudioTrack);
          setSpeaking(true);
        }
      });

      r.on(RoomEvent.TrackUnsubscribed, (track: Track, _publication: RemoteTrackPublication, _participant: RemoteParticipant) => {
        if (track.kind === Track.Kind.Audio) {
          detachAudioTrack(track as RemoteAudioTrack);
        }
        setSpeaking(false);
      });

      r.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
        console.log("[EdyWidget] Participant connected:", participant.identity);
        // Suscribirse a pistas ya publicadas por el agente si entra después
        for (const pub of participant.trackPublications.values()) {
          if (pub.kind === Track.Kind.Audio && !pub.isSubscribed) {
            pub.setSubscribed(true);
          }
        }
      });

      r.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
        console.log("[EdyWidget] Participant disconnected:", participant.identity);
        setSpeaking(false);
      });

      r.on(RoomEvent.Disconnected, (reason?: unknown) => {
        console.log("[EdyWidget] Disconnected:", reason);
        setConnected(false);
        setConnecting(false);
        setSpeaking(false);
        hasConnectedRef.current = false;
      });

      r.on(RoomEvent.ConnectionStateChanged, (state: string) => {
        console.log("[EdyWidget] Connection state:", state);
      });

      // Detectar cuando el agente está hablando (lo usa el indicador visual)
      r.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
        const isAgentSpeaking = speakers.some((s) => s.identity !== r.localParticipant.identity);
        setSpeaking(isAgentSpeaking);
      });

      connectTimeoutRef.current = setTimeout(() => {
        if (!roomRef.current || roomRef.current.state !== "connected") {
          console.error("[EdyWidget] Connection timeout after 15s");
          setError("Timeout: No se pudo conectar (firewall/red?). Ver consola.");
          setConnecting(false);
          hasConnectedRef.current = false;
        }
      }, 15000);

      console.log("[EdyWidget] Connecting to LiveKit...");
      await r.connect(livekitUrl, token);
      console.log("[EdyWidget] Connected to LiveKit!");
      setConnected(true);

      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);

      console.log("[EdyWidget] Publishing local audio (mic)...");
      const tracks = await createLocalTracks({ audio: true, video: false });
      for (const track of tracks) {
        await r.localParticipant.publishTrack(track);
        console.log("[EdyWidget] Published track:", track.kind);
      }

      // Hook para detectar cuando el usuario habla (transcripción futura)
      r.localParticipant.on(ParticipantEvent.IsSpeakingChanged, (isSpeaking: boolean) => {
        if (isSpeaking) console.log("[EdyWidget] User is speaking...");
      });

      // Suscribirse a participantes y pistas ya presentes en la sala
      for (const participant of r.remoteParticipants.values()) {
        for (const pub of participant.trackPublications.values()) {
          if (pub.kind === Track.Kind.Audio && !pub.isSubscribed) {
            pub.setSubscribed(true);
          } else if (pub.kind === Track.Kind.Audio && pub.isSubscribed && pub.track) {
            attachAudioTrack(pub.track as RemoteAudioTrack);
          }
        }
      }
    } catch (err) {
      console.error("[EdyWidget] LiveKit connection error:", err);
      setError(err instanceof Error ? err.message : "Connection failed");
      setConnecting(false);
      hasConnectedRef.current = false;
    } finally {
      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
    }
  }, [livekitUrl, room, studentId, addMessage, attachAudioTrack, detachAudioTrack]);

  useEffect(() => {
    let mounted = true;
    const timeoutId = setTimeout(() => {
      if (mounted) connect();
    }, 0);
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
      if (audioElRef.current) {
        audioElRef.current.srcObject = null;
      }
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] flex flex-col">
      <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 bg-muted/50 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                speaking
                  ? "bg-blue-500 animate-pulse"
                  : connected
                  ? "bg-green-500"
                  : connecting
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-red-500"
              }`}
            />
            <span className="font-medium text-foreground">
              {speaking
                ? "Edy hablando..."
                : connected
                ? "Edy conectado"
                : connecting
                ? "Conectando..."
                : "Desconectado"}
            </span>
          </div>
          {connected && (
            <button
              onClick={disconnect}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Desconectar"
            >
              ✕
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-900/30 border-t border-border text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {!connected && !connecting && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                El agente Edy no está conectado.
              </p>
              <button
                onClick={() => {
                  hasConnectedRef.current = false;
                  connect();
                }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Conectar con Edy
              </button>
            </div>
          )}

          {connecting && (
            <p className="text-sm text-muted-foreground animate-pulse">
              Conectando con Edy...
            </p>
          )}

          {connected && transcript.length === 0 && (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>🎙️ Habla con Edy para buscar cursos o inscribirte</p>
              <p className="text-xs text-muted-foreground/70">
                {'Ejemplos: "Quiero un curso de programación", "Muéstrame cursos gratis", "Inscríbeme en el primero"'}
              </p>
            </div>
          )}

          {transcript.length > 0 && (
            <div className="space-y-2">
              {transcript.map((m) => (
                <div
                  key={m.id}
                  className={`text-sm p-2 rounded-lg ${
                    m.role === "ady"
                      ? "bg-primary/10 text-foreground border border-primary/20"
                      : "bg-muted/30 text-muted-foreground"
                  }`}
                >
                  <span className="text-xs font-mono text-muted-foreground/70">
                    {m.role === "ady" ? "Edy" : "Tú"}:
                  </span>
                  <p className="mt-1">{m.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {connected && (
          <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground/70">
            ID: {studentId || "Anónimo (inicia sesión para inscribirte)"}
          </div>
        )}
      </div>
    </div>
  );
}

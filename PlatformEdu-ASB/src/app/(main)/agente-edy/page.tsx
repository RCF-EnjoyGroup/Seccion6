export const metadata = {
  title: "Agente Edy - Asistente de EduPlatform",
  description: "Habla con Edy, tu asistente de ventas y atención de EduPlatform",
};

export default function AgenteEdyPage() {
  // In a real implementation, you'd get these from env
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "wss://edutech-meo77bh3.livekit.cloud";
  const room = "edtech-widget";

  return (
    <div className="min-h-screen bg-gray-950">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">🤖 Edy - Tu Asistente de EduPlatform</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Edy puede ayudarte a encontrar cursos, ver detalles e inscribirte. 
            Usa tu voz para conversar naturalmente.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">🎯 Qué puede hacer Edy</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Buscar cursos por tema o categoría</li>
              <li>• Mostrar detalles y lecciones de un curso</li>
              <li>• Inscribirte en cursos gratuitos directamente</li>
              <li>• Generar link de checkout simulado para cursos de pago</li>
              <li>• Escalar a un asesor humano si necesitas ayuda</li>
            </ul>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">💡 Ejemplos de comandos</h3>
            <ul className="space-y-2 text-gray-300 text-sm font-mono bg-gray-950 p-3 rounded">
              <li>{'"Quiero un curso de programación"'}</li>
              <li>{'"Muéstrame cursos de diseño para principiantes"'}</li>
              <li>{'"Dame detalles del primer curso"'}</li>
              <li>{'"Inscríbeme en ese curso"'}</li>
              <li>{'"No puedo acceder a mis lecciones"'}</li>
            </ul>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">⚠️ Nota importante</h3>
            <p className="text-gray-300 text-sm mb-3">
              Los pagos están <strong className="text-yellow-400">SIMULADOS</strong> en esta versión. 
              Si Edy te da un link de pago, es solo para practicar el flujo — no se cobra nada real.
            </p>
            <p className="text-gray-400 text-sm">
              Para inscribirte en cursos gratuitos, inicia sesión primero.
            </p>
          </div>
        </div>

        {/* LiveKit Widget */}
        <EdyVoiceWidgetClient
          livekitUrl={livekitUrl}
          room={room}
          studentId={undefined}
        />
      </main>
    </div>
  );
}

import EdyVoiceWidgetClient from "@/components/agent/edy-voice-widget-client";
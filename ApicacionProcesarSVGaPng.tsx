import React, { useState, useRef } from 'react';
import { Download } from 'lucide-react';

const BubbleLoadingFrameExtractor = () => {
  const [frames, setFrames] = useState([]);
  const [numFrames, setNumFrames] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef(null);

  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const calculateRadius = (time, delay) => {
    const cycleDuration = 1.0;
    const adjustedTime = ((time - delay) % cycleDuration + cycleDuration) % cycleDuration;
    
    // La animación tiene 3 keyframes: 0->2->0->0
    if (adjustedTime < 0.333) {
      // Fase de crecimiento: 0 a 2
      const t = adjustedTime / 0.333;
      return easeInOutCubic(t) * 2;
    } else if (adjustedTime < 0.666) {
      // Fase de decrecimiento: 2 a 0
      const t = (adjustedTime - 0.333) / 0.333;
      return 2 - easeInOutCubic(t) * 2;
    } else {
      // Fase de reposo: 0
      return 0;
    }
  };

  const generateFrames = async () => {
    setIsGenerating(true);
    setFrames([]);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 480; // Tamaño más grande para mejor calidad
    canvas.width = size;
    canvas.height = size;
    
    const positions = [0, 45, 90, 135, 180, 225, 270, 315];
    const delays = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875];
    
    const newFrames = [];

    for (let frameIndex = 0; frameIndex < numFrames; frameIndex++) {
      const time = frameIndex / numFrames;
      
      // Limpiar canvas con fondo transparente
      ctx.clearRect(0, 0, size, size);
      
      // Dibujar cada círculo
      positions.forEach((angle, i) => {
        const radius = calculateRadius(time, delays[i]);
        
        if (radius > 0.1) {
          const radians = (angle * Math.PI) / 180;
          const centerX = size / 2;
          const centerY = size / 2;
          const distance = size / 2 * 0.83; // Distancia del centro
          
          const x = centerX + distance * Math.sin(radians);
          const y = centerY - distance * Math.cos(radians);
          
          ctx.beginPath();
          ctx.arc(x, y, radius * (size / 24), 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        }
      });
      
      // Convertir a PNG
      await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          newFrames.push({ url, index: frameIndex });
          resolve();
        }, 'image/png');
      });
    }
    
    setFrames(newFrames);
    setIsGenerating(false);
  };

  const downloadFrame = (url, index) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `bubble-loading-frame-${String(index + 1).padStart(2, '0')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAll = () => {
    frames.forEach((frame, index) => {
      setTimeout(() => {
        downloadFrame(frame.url, frame.index);
      }, index * 200);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Extractor de Frames - Bubble Loading
          </h1>
          <p className="text-gray-600 mb-6">
            Genera y descarga frames individuales de la animación como imágenes PNG (480x480px)
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <label className="text-gray-700 font-medium">
              Número de frames:
            </label>
            <input
              type="number"
              min="4"
              max="32"
              value={numFrames}
              onChange={(e) => setNumFrames(parseInt(e.target.value) || 8)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-20"
            />
            <button
              onClick={generateFrames}
              disabled={isGenerating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isGenerating ? 'Generando...' : frames.length > 0 ? 'Regenerar Frames' : 'Generar Frames'}
            </button>
            {frames.length > 0 && (
              <button
                onClick={downloadAll}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-medium"
              >
                <Download size={18} />
                Descargar Todos ({frames.length})
              </button>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {frames.length === 0 && !isGenerating && (
            <div className="text-center py-12 text-gray-500">
              Haz clic en "Generar Frames" para comenzar
            </div>
          )}
        </div>

        {frames.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {frames.map((frame, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-4 hover:shadow-2xl transition-shadow"
              >
                <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg p-6 mb-4 flex items-center justify-center aspect-square border-2 border-gray-600">
                  <img
                    src={frame.url}
                    alt={`Frame ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Frame {String(index + 1).padStart(2, '0')}
                  </span>
                  <button
                    onClick={() => downloadFrame(frame.url, frame.index)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                    title="Descargar PNG"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BubbleLoadingFrameExtractor;
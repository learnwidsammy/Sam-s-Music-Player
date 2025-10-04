import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyserNode: AnalyserNode | null;
  isPlaying: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ analyserNode, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!analyserNode || !canvasRef.current || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationFrameId: number;

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);
      analyserNode.getByteFrequencyData(dataArray);

      // Create a semi-transparent background for a "trail" effect
      ctx.fillStyle = 'rgba(14, 16, 22, 0.4)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create a gradient for the bars
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, '#0ea5e9'); // Sky Blue
      gradient.addColorStop(0.5, '#6366f1'); // Indigo
      gradient.addColorStop(1, '#ec4899'); // Pink
      ctx.fillStyle = gradient;

      const barWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        // Draw the bar with the gradient fill
        ctx.fillRect(x, canvas.height - barHeight, barWidth -1, barHeight);

        x += barWidth;
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyserNode, isPlaying]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default Visualizer;
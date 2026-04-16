import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import SimulationLab from '@/pages/SimulationLab';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(220, 25%, 9%)',
            border: '1px solid hsl(220, 20%, 16%)',
            color: 'hsl(210, 40%, 95%)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<SimulationLab />} />
        <Route path="*" element={<SimulationLab />} />
      </Routes>
    </BrowserRouter>
  );
}

import { SidePanel } from '@/components/layout/SidePanel';
import { useTheme } from '@/hooks/useTheme';
import { useEffect } from 'react';

function App() {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return <SidePanel />;
}

export default App;
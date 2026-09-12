import { Routes, Route } from 'react-router-dom';
import Menu from './components/Menu';
import Clientes from './components/Clientes';
import Productos from './components/Productos';
import Ventas from './components/Ventas';

function App() {
  return (
    <>
      <Menu />
      <div className="container mt-4">
        <Routes>
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/ventas" element={<Ventas />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
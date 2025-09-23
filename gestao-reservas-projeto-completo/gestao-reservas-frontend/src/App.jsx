import { useState } from "react";
import Login from "./components/Login";
import Salas from "./components/Salas";
import Reservas from "./components/Reservas";
import CriarReserva from "./components/CriarReserva";
import "./index.css";

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestão de Reservas</h1>
      <p className="mb-4">Bem-vindo, {user.username} (id: {user.id})</p>
      <Salas />
      <Reservas />
      <CriarReserva user={user} onCriada={(r) => console.log("Nova reserva:", r)} />
    </div>
  );
}

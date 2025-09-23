import { useState } from "react";
import { criarReserva } from "../services/api";

export default function CriarReserva({ user, onCriada }) {
  const [salaId, setSalaId] = useState("");
  const [data, setData] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [erro, setErro] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    const token = localStorage.getItem("token");
    try {
      const payload = {
        sala_id: parseInt(salaId, 10),
        usuario_id: user?.id,
        data,
        hora_inicio: horaInicio,
        hora_fim: horaFim,
      };
      const nova = await criarReserva(token, payload);
      onCriada?.(nova);
      setSalaId(""); setData(""); setHoraInicio(""); setHoraFim("");
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6 p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold">Criar Reserva</h2>
      <input placeholder="Sala (id)" value={salaId} onChange={(e) => setSalaId(e.target.value)} required className="border rounded px-3 py-2 w-full"/>
      <input type="date" value={data} onChange={(e) => setData(e.target.value)} required className="border rounded px-3 py-2 w-full"/>
      <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required className="border rounded px-3 py-2 w-full"/>
      <input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} required className="border rounded px-3 py-2 w-full"/>
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Reservar</button>
      {erro && <p className="text-red-600">{erro}</p>}
    </form>
  );
}

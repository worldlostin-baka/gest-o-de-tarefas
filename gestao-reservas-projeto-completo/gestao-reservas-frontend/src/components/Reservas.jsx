import { useEffect, useState } from "react";
import { getReservas } from "../services/api";

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    getReservas(token)
      .then((data) => setReservas(data || []))
      .catch((e) => setErro(e.message));
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow mt-6">
      <h2 className="text-lg font-semibold mb-2">Reservas</h2>
      {erro && <p className="text-red-600">{erro}</p>}
      <ul className="space-y-1">
        {reservas.map((r) => (
          <li key={r.id}>
            Sala {r.sala?.nome} - {r.data} {r.hora_inicio} até {r.hora_fim} ({r.usuario?.username})
          </li>
        ))}
      </ul>
    </div>
  );
}

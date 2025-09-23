import { useEffect, useState } from "react";
import { getSalas } from "../services/api";

export default function Salas() {
  const [salas, setSalas] = useState([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    getSalas().then((data) => setSalas(data.salas || [])).catch((e) => setErro(e.message));
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow mt-6">
      <h2 className="text-lg font-semibold mb-2">Salas</h2>
      {erro && <p className="text-red-600">{erro}</p>}
      <ul className="list-disc list-inside space-y-1">
        {salas.map((s) => (
          <li key={s.id}>{s.nome} ({s.capacidade} pessoas)</li>
        ))}
      </ul>
    </div>
  );
}

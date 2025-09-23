import { useState } from "react";
import { login } from "../services/api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    try {
      const data = await login(username, password);
      localStorage.setItem("token", data.token);
      onLogin(data.user);
    } catch (e) {
      setErro(e.message || "Usuário ou senha inválidos");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto mt-20 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold">Login</h2>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Usuário"
        className="border rounded px-3 py-2 w-full"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
        className="border rounded px-3 py-2 w-full"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
        Entrar
      </button>
      {erro && <p className="text-red-600">{erro}</p>}
    </form>
  );
}

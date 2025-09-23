import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../Login";

describe("Login component", () => {
  it("renderiza inputs e botão", () => {
    render(<Login onLogin={() => {}} />);
    expect(screen.getByPlaceholderText(/Usuário/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Entrar/i })).toBeInTheDocument();
  });

  it("permite digitar usuário e senha", async () => {
    const user = userEvent.setup();
    render(<Login onLogin={() => {}} />);
    const u = screen.getByPlaceholderText(/Usuário/i);
    const p = screen.getByPlaceholderText(/Senha/i);
    await user.type(u, "admin");
    await user.type(p, "123");
    expect(u).toHaveValue("admin");
    expect(p).toHaveValue("123");
  });
});

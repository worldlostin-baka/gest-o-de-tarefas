# Changelog – Gestão de Reservas

Todas as mudanças relevantes neste projeto serão documentadas aqui.

---

## [1.0.0] – 2025-09-21
### Adicionado
- Estrutura inicial do projeto Django + React.
- Modelos `Sala` e `Reserva`.
- API com Django Rest Framework.
- Frontend com React + Vite + Tailwind v4.

---

## [1.1.0] – 2025-09-21
### Alterado
- Autenticação básica trocada por **JWT (SimpleJWT)**.
- Adicionado comando `python manage.py seed` para popular dados iniciais.
- Frontend atualizado para usar `Bearer <token>`.

---

## [1.2.0] – 2025-09-21
### Adicionado
- **Refresh automático de token** no frontend.
- **Permissões detalhadas**: apenas admin pode criar/editar salas.
- **Documentação da API (Swagger/OpenAPI)** com drf-spectacular.
- **Testes automatizados no frontend** (Vitest + RTL).

---

## [1.3.0] – 2025-09-21
### Adicionado
- **Dockerfiles** para backend e frontend.
- **docker-compose.yml** para rodar db + backend + frontend juntos.
- Backend configurado para usar **Postgres** via `dj-database-url`.

---

## [1.4.0] – 2025-09-21
### Adicionado
- **Black + Flake8** no backend.
- **Prettier + ESLint** no frontend.
- Scripts `lint` e `format`.

---

## [1.5.0] – 2025-09-21
### Adicionado
- **pre-commit hooks** no backend (Black + Flake8 + tests Django).
- **Husky + lint-staged** no frontend (ESLint + Prettier).
- **Hooks de testes** no push:
  - Backend (`python manage.py test`)
  - Frontend (`npm run test -- --run`).

---

## [1.6.0] – 2025-09-21
### Adicionado
- **CONTRIBUTING.md** com guia de contribuição para novos devs.
- Documentação de setup, lint, testes, Docker e hooks.

---

// Augmentação de tipos do next-auth: a sessão expõe o id do usuário,
// usado no RBAC (ex.: comparar donoId do serviço com o usuário logado).

import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}

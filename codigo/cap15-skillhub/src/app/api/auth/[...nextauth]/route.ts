import { handlers } from "@/lib/auth";

// Expõe /api/auth/* (signIn, signOut, session, csrf, providers).
// O NextAuth v5 exporta os handlers diretamente como rotas GET/POST.
export const { GET, POST } = handlers;

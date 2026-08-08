"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";

export function ModalExemplo() {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <Button variante="secundario" onClick={() => setAberto(true)}>
        Abrir modal
      </Button>
      <Modal aberto={aberto} aoFechar={() => setAberto(false)} titulo="Aceitar orçamento?">
        <p>
          Ao aceitar, o orçamento <strong>#2041</strong> será enviado ao cliente
          com validade de 7 dias. Esta ação não pode ser desfeita.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variante="fantasma" onClick={() => setAberto(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              setAberto(false);
              alert("Orçamento aceito! (exemplo)");
            }}
          >
            Aceitar
          </Button>
        </div>
      </Modal>
    </>
  );
}

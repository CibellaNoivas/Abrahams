# Abrahams by Cibella Group

Landing page responsiva para uma marca masculina de alfaiataria, camisas e acessórios.

## Como executar

```bash
node server.mjs
```

Depois abra `http://localhost:4173`.

No Windows, você também pode executar:

```bat
start-server.cmd
```

O projeto usa React e Tailwind CSS em modo estático, com um pequeno servidor Node para mídia, agenda e envio de e-mail.

## Editar produtos

O catalogo agora pode ser editado pelo painel privado:

```text
http://localhost:4173/admin/catalogo?key=abrahams2026
```

Nesse painel voce pode adicionar produto, remover produto, trocar titulo, etiqueta, descricao, tags e imagem. Depois de clicar em `Salvar catalogo`, a secao `Catalogo` do site passa a usar os novos produtos automaticamente.

Os produtos ficam salvos em `%LOCALAPPDATA%\AbrahamsSite\catalogo.json`. Se esse arquivo ainda nao existir, o site usa o catalogo padrao do projeto.

## Agendamento

A seção `Agendamento` mostra horários disponíveis de segunda a sexta, das 09:00 às 18:00, e sábado, das 09:00 às 13:00. Domingo fica fechado. Cada atendimento reserva 1h30, grava solicitações em `%LOCALAPPDATA%\AbrahamsSite\agendamentos.json` e bloqueia o mesmo horário depois que alguém envia o formulário.

O e-mail automático usa SMTP. Antes de iniciar o servidor em produção, configure:

```powershell
$env:BOOKING_TO_EMAIL="ibrahimhakkialtin@gmail.com,taner@cibellanoivas.com"
$env:CALENDAR_ATTENDEE_EMAILS="ibrahimhakkialtin@gmail.com,taner@cibellanoivas.com"
$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_USER="seu-email@gmail.com"
$env:SMTP_PASS="sua-senha-de-app"
$env:SMTP_FROM="Abrahams Agendamento <seu-email@gmail.com>"
node server.mjs
```

Sem SMTP configurado, o agendamento fica salvo no servidor, mas o e-mail e o convite de calendário não são disparados.

`BOOKING_TO_EMAIL` recebe o relatório completo. `CALENDAR_ATTENDEE_EMAILS` define quem entra como convidado no evento de calendário. Se `CALENDAR_ATTENDEE_EMAILS` não for informado, o sistema usa a mesma lista de `BOOKING_TO_EMAIL`.

## O que foi incluído

- Hero cinematográfico com imagens Abrahams e mudança automática.
- Header com logo que muda de cor em áreas claras e escuras.
- Catálogo para ternos, calças, blazers, camisas, gravatas-borboleta, gravatas e abotoaduras.
- Painel privado para adicionar, remover e editar produtos do catalogo.
- Atelier, lookbook editorial, agendamento e contato.
- Formulário com nome, idade, e-mail, WhatsApp, segmento procurado, data do evento e detalhes de curadoria.
- Convite `.ics` no e-mail para o agendamento aparecer no Google Calendar/Outlook dos colaboradores.
- WhatsApp Abrahams: `+55 11 91561-4927`.
- Emails: `ibrahimhakkialtin@gmail.com`, `taner@cibellanoivas.com` e `camila@cibellanoivas.com`.
- Agendamentos salvos localmente em `%LOCALAPPDATA%\AbrahamsSite\agendamentos.json`.
- Integração opcional com GitHub Actions/Google Calendar via `repository_dispatch`.
- Workload Identity Provider padrão: `projects/299661583209/locations/global/workloadIdentityPools/github-actions-pool/providers/github`.
- Project ID padrão: `trusty-field-459814-a9`.
- Service account padrão: `abrahams-test@trusty-field-459814-a9.iam.gserviceaccount.com`.

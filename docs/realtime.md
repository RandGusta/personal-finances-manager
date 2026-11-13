# Atualizações de carteiras com SSE

O sistema usa Server-Sent Events (SSE), não WebSocket/STOMP. Os dados continuam
sendo criados, editados, excluídos e consultados pelos endpoints HTTP existentes.
O SSE só avisa que os dados mudaram; Dashboard e Transactions buscam os valores
atualizados pelos services que já utilizam.

## Fluxo e arquivos

1. `WalletRealtimeService.ts` abre `GET /api/v1/users/me/events`, enviando o JWT no
   cabeçalho `Authorization: Bearer ...`. O token não é colocado na URL.
2. O filtro JWT existente valida o acesso. `WalletEventsController` entrega o
   stream `text/event-stream` para o usuário autenticado, sem receber um ID de
   usuário ou de carteira escolhido pelo frontend.
3. `WalletEventService` registra a conexão e envia `event: connected`.
4. Após criar, editar ou excluir uma transação, `TransactionService` publica
   `WalletTransactionChangedEvent` como antes.
5. Após o commit, `WalletTransactionUpdateListener` consulta os membros atuais da
   carteira e chama `WalletEventService.sendToUser` para cada um.
6. O frontend recebe `event: wallet-update` e atualiza a página. O único JSON de
   atualização contém `walletId` e `changeType` (`CREATED`, `UPDATED` ou `DELETED`).

O backend usa `SseEmitter` do Spring MVC. No frontend, `@microsoft/fetch-event-source`
permite manter o JWT no cabeçalho, usando SSE sobre `fetch`. Não foi necessário
trocar a autenticação para cookies nem implementar manualmente um parser SSE.
O `EventSource` nativo do navegador não oferece a opção de enviar esse cabeçalho.

## Conexão e segurança

- O stream usa o mesmo CORS dos outros controllers (`app.frontend-url`).
- Cada aba pode ter uma conexão independente para o mesmo usuário.
- Antes de enviar dados, o serviço confere a expiração do JWT e sua `tokenVersion`
  persistida. Trocar ou recuperar a senha fecha as conexões após o commit.
- Um heartbeat a cada 15 segundos mantém o stream ativo e identifica conexões
  abandonadas ou expiradas, mesmo quando ninguém lança transações.
- Membros removidos não recebem os próximos avisos da carteira. Usuários externos
  nunca são destinatários desses avisos.
- Ao sair da página, o `AbortController` cancela a requisição. Em falhas de rede,
  tenta reconectar após 5 segundos. HTTP 401/403 interrompe as tentativas.
- Após uma reconexão bem-sucedida, a página consulta novamente os dados para
  recuperar mudanças feitas durante a desconexão. Não existe histórico/replay de
  eventos: a fonte de verdade continua sendo o banco e os endpoints de consulta.
- O stream retorna `Cache-Control: no-store` e `X-Accel-Buffering: no`. Em deploy,
  o proxy também deve permitir streaming e não acumular/bufferizar a resposta.

O registro de conexões é em memória e serve a uma instância do backend. Escalar
para múltiplas instâncias exigiria distribuir os eventos entre elas.

## Como verificar

Reinicie o backend e o frontend depois de atualizar as dependências. No DevTools,
aba Network, procure `/api/v1/users/me/events`: é uma requisição HTTP que permanece
aberta e recebe eventos. Não haverá mais conexão com `/ws`.

Abra dois usuários membros da mesma carteira em sessões separadas. Crie, edite
e exclua uma transação com um deles: Dashboard e Transactions do outro devem
atualizar sem recarregar a página. Carteiras não compartilhadas não devem gerar
avisos para esse segundo usuário.

Na pasta `backend/finance-control`, execute:

```powershell
.\mvnw.cmd '-Dtest=WalletEventsIntegrationTest,WalletTransactionUpdateListenerTest' test
```

Os testes usam banco H2 temporário e porta aleatória, sem MySQL ou contas reais.
Verificam autenticação, CORS, criação/edição/exclusão com eventos reais após commit,
isolamento, múltiplas abas, remoção de membros, revogação por senha, versão do token,
expiração e heartbeats.

Na pasta `frontend`, `npm run test:realtime` verifica o service com rede/storage
simulados: envio do JWT, reconexão, atualização da página, bloqueio de 401/403,
validação do tipo de resposta e cancelamento ao sair da tela.

Referências: [SSE no Spring MVC](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-async.html)
e [cliente SSE baseado em fetch](https://github.com/Azure/fetch-event-source).

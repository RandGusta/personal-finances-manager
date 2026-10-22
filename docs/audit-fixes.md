# Correções da auditoria de retornos e sessões

## Sessões e senhas

O usuário possui `tokenVersion`, iniciando em zero. O JWT carrega essa versão e o
backend confere ID, e-mail, versão, assinatura e expiração. Troca e recuperação de
senha incrementam a versão; tokens anteriores deixam de autenticar.

O evento `UserSessionsRevokedEvent`, processado após o commit, fecha conexões
SSE do usuário. A validade também é conferida antes de entregar atualizações
e ao abrir o stream. Uma tarefa fecha conexões expiradas, e o frontend
interrompe tentativas automáticas de reconexão após uma recusa de autenticação.

Ao aplicar esta alteração, os tokens emitidos anteriormente (sem versão) exigem
novo login. A tela de troca de senha remove o token local e direciona para login.

A configuração local existente `spring.jpa.hibernate.ddl-auto=update` adiciona
`user.token_version`, um BIGINT com DEFAULT 0. Não é necessário apagar o banco.
Em ambientes que não usam atualização automática de schema, a coluna deve ser
adicionada por uma migração antes de executar esta versão.

O gerenciamento de conexões SSE é local à instância. Uma implantação com múltiplas
instâncias exigiria propagação dos eventos de atualização e revogação entre elas.
A versão persistida continua protegendo HTTP e a entrega de cada evento.

## Contratos HTTP

- JSON/enum/parâmetro inválido ou ausente: 400 com `message` genérica.
- Rota inexistente: 404 com `message`.
- Método HTTP não permitido: 405.
- Ordenação de transações: somente `id`, `date`, `amount`, `type`, `description`
  e `createdDate`; campos fora dessa lista retornam 400.
- Transações não retornam mais `createdById` e `createdByName`, sem uso no frontend.
- A página de transações expõe apenas `content`, `totalElements`, `totalPages`,
  `size`, `number`, `numberOfElements`, `first`, `last` e `empty`.
- Identificadores, papéis e os dados de membros utilizados nas telas foram mantidos
  sob os mesmos controles de acesso. E-mails permanecem visíveis aos colaboradores.
- A função antiga sem consumidores que apontava para `/home` foi removida do frontend.

## Resumo global

`GET /api/v1/users/me/summary` soma as transações das carteiras acessíveis ao usuário
autenticado, incluindo as compartilhadas uma única vez. O backend usa BigDecimal
para totais e agrupamentos. O Dashboard faz uma requisição para esse resumo e não
soma valores financeiros no JavaScript.

## Verificação

A auditoria original em `teste/` (ignorada pelo Git) executou o backend com HTTP e
WebSocket reais, H2 temporário e e-mail/Gemini simulados. Ela verificou os contratos,
isolamento, tentativas de adulteração, revogação após troca e recuperação de senha,
fechamento do WebSocket e soma global de carteira pessoal e compartilhada.
Não acessa o banco MySQL ou contas reais.

Após a migração para SSE, os testes de tempo real atualizados estão em
`WalletEventsIntegrationTest`, no backend. Usam HTTP real, H2 temporário e os mesmos
serviços de produção, sem chamar e-mail ou IA externos. O script antigo de auditoria
WebSocket é histórico e não verifica o transporte SSE atual. Veja `realtime.md`.

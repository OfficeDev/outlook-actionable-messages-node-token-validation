---
page_type: sample
products:
- office-outlook
- office-365
languages:
- javascript
extensions:
  contentType: samples
  technologies:
  - Actionable messages
  createdDate: 11/17/2016 11:23:12 AM
---
# Amostra do Node.js de verificação de token de solicitação de ação

Os serviços podem enviar mensagens acionáveis para usuários completarem tarefas simples que vai de encontro aos seus serviços. Quando um usuário executar uma das ações em uma mensagem, uma solicitação de ação será enviada pela Microsoft ao serviço. A solicitação da Microsoft conterá um token de portador no cabeçalho de autorização. Este exemplo de código mostra como verificar o token para garantir que a solicitação de ação veio mesmo da Microsoft e como usar as declarações do token para validar a solicitação.

        app.post('/api/despesa', function (req, res) {
            token var;
            
            // Solicite um novo token do Cabeçalho de autorização. 
            if (req.headers && req.headers.hasOwnProperty('authorization')) {
                var auth = req.headers['authorization'].trim().split(' ');
                if (auth.length == 2 && auth[0].toLowerCase() == 'portador') {
                    token = auth[1];
                }
            }
            
            if (token) {
                var validator = new validation.ActionableMessageTokenValidator();
                
                // Isso verificará se o token foi emitido pela Microsoft para o
                // URL de destino especificada, ou seja, o destino corresponde à audiência pretendida (declaração de "AUD" no token)
                // 
                // Em seu código, substitua https://api.contoso.com pela URL base do seu serviço.
                // Por exemplo, se a URL de destino do serviço for https://api.xyz.com/finance/expense?id=1234,
                // em seguida, substitua https://api.contoso.com por https://api.xyz.com
                validator.validateToken(
                    token, 
                    "https://api.contoso.com",
                    function (err, result) {
                        if (err) {
                            console.error('erro: ' + err.message);
                            res.status(401);
                            res.end();
                        } else {                        
                            // Temos um token válido. Agora, verificaremos se o remetente e a ação executores são quem
                            // esperamos. O remetente é a identidade da entidade que enviou a Mensagem 
                            // Acionável, e o executor da ação é a identidade do usuário que 
                            // executa a ação (subdeclaração no token). 
                            // 
                            // Você deve substituir o código abaixo por sua própria lógica de validação 
                            // Neste exemplo, verificamos se o email foi enviado por expense@contoso.com (remetente esperado)
                            // e o email da pessoa que executou a ação é john@contoso.com (destinatário esperado)
                            //
                            // Você também deve retornar o cabeçalho CARD-ACTION-STATUS na resposta.
                            // O valor do cabeçalho será exibido para o usuário.
                            
                            if (result.sender.toLowerCase() != 'expense@contoso.com' ||
                                result.action_performer.toLowerCase() != 'john@contoso.com') {
                                res.set('CARD-ACTION-STATUS', 'remetente inválido ou executor da ação sem permissão.')
                                res.status(403);
                                res.end();
                                return;
                            }

                            // Outro código de lógica de negócios aqui para processar o relatório de despesas.
                            
                            res.set('CARD-ACTION-STATUS', 'A despesa foi aprovada.')
                            res.status(200);
                            res.end();
                        }
                    });
            } else {
                res.status(401);
                res.end();
            }
        });

O exemplo de código está usando a biblioteca a seguir para a validação de JWT.   

[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)   

Mais informações das Mensagens Acionáveis do Outlook estão disponíveis [aqui](https://dev.outlook.com/actions).

## Direitos autorais
Copyright (c) 2017 Microsoft. Todos os direitos reservados.


Este projeto adotou o [Código de Conduta do Código Aberto da Microsoft](https://opensource.microsoft.com/codeofconduct/). Para saber mais, confira [Perguntas frequentes sobre o Código de Conduta](https://opensource.microsoft.com/codeofconduct/faq/) ou contate [opencode@microsoft.com](mailto:opencode@microsoft.com) se tiver outras dúvidas ou comentários.

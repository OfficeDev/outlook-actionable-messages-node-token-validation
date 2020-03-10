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
# Пример кода Node.js для проверки маркера запроса

Службы могут отправлять пользователям сообщения с действиями для выполнения простых задач в отношении своих служб. При выполнении пользователем одного из действий в сообщении, ему будет отправлен запрос на обслуживание от Майкрософт. Запрос от Майкрософт будет содержать маркер носителя в заголовке авторизации. В этом примере кода показано, как проверить маркер, чтобы убедиться, что запрос получен от Майкрософт, и использовать утверждения в маркере для проверки запроса.

        app.post('/api/expense', function (req, res) {
            var маркер;
            
            // Получить маркер из заголовка авторизации 
            if (req.headers && req.headers.hasOwnProperty('authorization')) {
                var auth = req.headers['authorization'].trim().split(' ');
                if (auth.length == 2 && auth[0].toLowerCase() == 'носитель') {
                    маркер= auth[1];
                }
            }
            
            если (маркер) {
                var validator = new validation.ActionableMessageTokenValidator();
                
                // Данное действие подтверждает, что маркер был выдан корпорацией Майкрософт
                // для указанного конечного URL-адреса, т. е. цель совпадает с целевой аудиторией (утверждение "aud" в маркере)
                // 
                // Замените в вашем коде https://api.contoso.com на базовый URL-адрес вашей службы.
                // Например, если целевой URL-адрес службы — https://api.xyz.com/finance/expense?id=1234,
                // замените https://api.contoso.com на https://api.xyz.com
                validator.validateToken(
                    маркер, 
                    "https://api.contoso.com",
                    функция (err, result) {
                        если (err) {
                            console.error('error: ' + err.message);
                            res.status(401);
                            res.end();
                        } else {                        
                            // У нас действительный маркер. Теперь нужно убедиться, что отправитель и исполнитель действия являются теми,
                            // кого мы ожидаем. Отправитель — это идентификация субъекта, который изначально отправил интерактивное 
                            // сообщение, а исполнитель действия — это идентификация пользователя, который в действительности 
                            выполнил действие (утверждение "sub" в маркере). 
                            // 
                            // Вам потребуется заменить указанный ниже код на собственную логику проверки 
                            // В этом примере мы проверяем, что сообщение отправлено expense@contoso.com (ожидаемый отправитель)
                            // и электронная почта лица, выполнившего действие, — john@contoso.com (ожидаемый получатель)
                            //
                            // Вам потребуется также вернуть заголовок CARD-ACTION-STATUS в ответе.
                            // Значение заголовка будет отображаться для пользователя.
                            
                            if (result.sender.toLowerCase() != 'expense@contoso.com' ||
                                result.action_performer.toLowerCase() != 'john@contoso.com') {
                                headers.add("CARD-ACTION-STATUS", "Недопустимый отправитель или исполнитель действия не разрешен.");
                                res.status(403);
                                res.end();
                                return;
                            }

                            // Добавьте сюда код бизнес-логики для обработки отчета о расходах.
                            
                            headers.add("CARD-ACTION-STATUS", "Расход утвержден.");
                            res.status(200);
                            res.end();
                        }
                    });
            } else {
                res.status(401);
                res.end();
            }
        });

Пример кода использует следующую библиотеку для проверки JWT.   

[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)   

Дополнительные сведения о сообщениях с действиями в Outlook доступны [здесь](https://dev.outlook.com/actions).

## Авторские права
(c) Корпорация Майкрософт (Microsoft Corporation), 2017. Все права защищены.


Этот проект соответствует [Правилам поведения разработчиков открытого кода Майкрософт](https://opensource.microsoft.com/codeofconduct/). Дополнительные сведения см. в разделе [часто задаваемых вопросов о правилах поведения](https://opensource.microsoft.com/codeofconduct/faq/). Если у вас возникли вопросы или замечания, напишите нам по адресу [opencode@microsoft.com](mailto:opencode@microsoft.com).

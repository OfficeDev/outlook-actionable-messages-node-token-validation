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
# Ejemplo de verificación del token de solicitud de acción en Node.js

Los servicios pueden enviar mensajes accionables a los usuarios para que realicen tareas sencillas en sus servicios. Cuando un usuario realiza una de las acciones de un mensaje, Microsoft enviará una solicitud de acción al servicio. La solicitud de Microsoft contendrá un token de portador en el encabezado de la autorización. En este ejemplo de código se muestra cómo comprobar el token para garantizar que la solicitud de acción es de Microsoft, y usar las notificaciones del token para validar la solicitud.

        app.post('/api/expense', function (req, res) {
            var token;
            
            // Obtener el token del encabezado de autorización 
            si (req.headers && req.headers.hasOwnProperty('authorization')) {
                var auth = req.headers['authorization'].trim().split(' ');
                si (auth.length == 2 && auth[0].toLowerCase() == 'bearer') {
                    token = auth[1];
                }
            }
            
            si (token) {
                var validator = new validation.ActionableMessageTokenValidator();
                
                // Esto validará que el token fue emitido por Microsoft para la
                // dirección URL de destino especificada, es decir, el destino coincide con el público deseado (notificación "aud" de token)
                // 
                // En su código, reemplace https://api.contoso.com por la dirección URL base del servicio.
                // Por ejemplo, si la dirección URL del servicio de destino es https://api.xyz.com/finance/expense?id=1234,
                // entonces reemplace https://api.contoso.com por https://api.xyz.com
                validator.validateToken(
                    token, 
                    "https://api.contoso.com",
                    function (err, result) {
                        si (err) {
                            console.error('error: ' + err.message);
                            res.status(401);
                            res.end();
                        } else {                        
                            // Ya tenemos un token válido. Ahora verificaremos que el remitente y el ejecutante de la acción sean quiénes
                            // nosotros deseamos. El remitente es la identidad de la entidad que envió inicialmente el mensaje 
                            // que requiere acción, y el ejecutante de la acción es la identidad del usuario que realmente 
                            // realizó la acción (notificación "sub" de token) 
                            // 
                            // Debería reemplazar el código siguiente con su propia lógica de validación 
                            // En este ejemplo, comprobamos que el correo electrónico es enviado por expense@contoso.com (remitente esperado)
                            // y el correo electrónico de la persona que realizó la acción es john@contoso.com (destinatario esperado)
                            //
                            // También debería devolver el encabezado CARD-ACTION-STATUS en la respuesta.
                            // El valor del encabezado se mostrará al usuario.
                            
                            si (result.sender.toLowerCase() != 'expense@contoso.com' ||
                                result.action_performer.toLowerCase() != 'john@contoso.com') {
                                res.set('CARD-ACTION-STATUS', 'Remitente inválido o no se permite el ejecutante de la acción.')
                                res.status(403);
                                res.end();
                                devuelve;
                            }

                            // Código de lógica empresarial adicional para procesar el informe de gastos.
                            
                            res.set('CARD-ACTION-STATUS', 'El gasto fue aprobado.')
                            res.status(200);
                            res.end();
                        }
                    });
            } else {
                res.status(401);
                res.end();
            }
        });

El código de ejemplo usa la siguiente biblioteca para la validación de JWT.   

[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)   

Puede encontrar más información sobre los Mensajes accionables de Outlook [aquí](https://dev.outlook.com/actions).

## Derechos de autor
Copyright (c) 2017 Microsoft. Todos los derechos reservados.


Este proyecto ha adoptado el [Código de conducta de código abierto de Microsoft](https://opensource.microsoft.com/codeofconduct/). Para obtener más información, vea [Preguntas frecuentes sobre el código de conducta](https://opensource.microsoft.com/codeofconduct/faq/) o póngase en contacto con [opencode@microsoft.com](mailto:opencode@microsoft.com) si tiene otras preguntas o comentarios.

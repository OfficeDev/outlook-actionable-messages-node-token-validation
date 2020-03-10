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
# Exemple Node.js de vérification du jeton de demande d’action

Les services peuvent envoyer des messages actionnables aux utilisateurs pour effectuer des tâches simples sur leurs services. Lorsqu’un utilisateur effectue l’une des actions dans un message, une demande d’action est envoyée au service par Microsoft. La demande de Microsoft contient un jeton du porteur dans l’en-tête d'autorisation. Cet exemple de code présente comment vérifier le jeton pour vous assurer que la demande d’action provient de Microsoft et utiliser les revendications dans le jeton pour valider la demande.

        app.post('/api/expense', fonction (req, res) {
            jeton var ;
            
            // Obtenir le jeton auprès de l'en-tête d’autorisation 
            si (req.headers && req.headers.hasOwnProperty('authorization')) {
                var auth = req.headers['authorization'].trim().split(' ');
                si (auth.length == 2 && auth[0].toLowerCase() == 'bearer') {
                    jeton = auth[1];
                }
            }
            
            si (jeton) {
                var validator = new validation.ActionableMessageTokenValidator();
                
                // Ceci valide l'émission du jeton par Microsoft pour le
                // l'URL cible spécifiée, autrement dit, la cible correspond à l’audience prévue (demande « aud » dans le jeton)
                // 
                // Dans votre code, remplacez https://api.contoso.com par l’URL de base de votre service.
                // Par exemple, si l’URL cible du service est https://api.xyz.com/finance/expense ?id=1234,
                // remplacez https://api.contoso.com par https://api.xyz.com
                validator.validateToken(
                    jeton, 
                    "https://api.contoso.com",
                    fonction (err, result) {
                        si (err) {
                            console.error('error: ' + err.message);
                            res.status(401);
                            res.end();
                        } else {                        
                            // Un jeton valide existe. Vous allez maintenant vérifier que l’expéditeur et l'exécutant de l’action sont ceux
                            // prévus. L’expéditeur correspond à l’identité de l’entité qui a initialement envoyé le Message 
                            // actionnable et l’exécutant de l’action correspond à l’identité de l’utilisateur qui a réellement 
                            // réalisé l’action (« sous- » revendication dans le jeton). 
                            // 
                            // Vous devez remplacer le code ci-dessous par votre propre logique de validation. 
                            // Dans cet exemple, vous vérifierez que le message électronique est envoyé par expense@contoso.com (expéditeur prévu)
                            // et que l’adresse de courrier de la personne qui a effectué l’action est john@contoso.com (destinataire prévu)
                            //
                            // Vous devez également retourner l’en-tête CARD-ACTION-STATUS dans la réponse.
                            // La valeur de l’en-tête s’affiche pour l’utilisateur.
                            
                            si (result.sender.toLowerCase() != 'expense@contoso.com' ||
                                result.action_performer.toLowerCase() != 'john@contoso.com') {
                                res.set('CARD-ACTION-STATUS', "Expéditeur non valide ou l'exécutant de l'action n'est pas autorisé.");
                                res.status(403);
                                res.end();
                                retour ;
                            }

                            // Code de logique métier plus précis ici pour traiter le rapport sur les dépenses.
                            
                            res.set('CARD-ACTION-STATUS', ’La dépense a été approuvée.’);
                            res.status(200);
                            res.end();
                        }
                    });
            } else {
                res.status(401);
                res.end();
            }
        });

L’exemple de code utilise la bibliothèque suivante pour la validation JWT.   

[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)   

D'autres informations sur les Messages actionnables d'Outlook sont disponibles [ici](https://dev.outlook.com/actions).

## Copyright
Copyright (c) 2017 Microsoft. Tous droits réservés.


Ce projet a adopté le [code de conduite Open Source de Microsoft](https://opensource.microsoft.com/codeofconduct/). Pour en savoir plus, reportez-vous à la [FAQ relative au code de conduite](https://opensource.microsoft.com/codeofconduct/faq/) ou contactez [opencode@microsoft.com](mailto:opencode@microsoft.com) pour toute question ou tout commentaire.

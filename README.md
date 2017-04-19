# Action Request Token Verification Node.js Sample

Services can send actionable messages to users to complete simple tasks against their services. When users perform one of the actions in the messages, an action request will be sent by Microsoft to the service. The request from Microsoft will contain a bearer token in the authorization header. This code sample shows how to verify the token to ensure the action request is from Microsoft, and use the claims in the token to validate the request.

        app.post('/api/expense', function (req, res) {
            var token;
            
            if (req.headers && req.headers.hasOwnProperty('authorization')) {
                var auth = req.headers['authorization'].trim().split(' ');
                if (auth.length == 2 && auth[0].toLowerCase() == 'bearer') {
                    token = auth[1];
                }
            }
            
            if (token) {
                var validator = new validation.ActionableMessageTokenValidator();
                
                // validateToken will verify the following
                // 1. The token is issued by Microsoft and its digital signature is valid.
                // 2. The token has not expired.
                // 3. The audience claim matches the service domain URL.
                //
                // Replace https://api.contoso.com with your service domain URL.
                // For example, if the service URL is https://api.xyz.com/finance/expense?id=1234,
                // then replace https://api.contoso.com with https://api.xyz.com
                validator.validateToken(
                    token, 
                    "https://api.contoso.com",
                    function (err, result) {
                        if (err) {
                            console.error('error: ' + err.message);
                            res.status(401);
                            res.end();
                        } else {
                            // We have a valid token. We will verify the sender and the action performer. 
                            // You should replace the code below with your own validation logic.
                            // In this example, we verify that the email is sent by expense@contoso.com
                            // and the action performer is someone with a @contoso.com email address.
                            //
                            // You should also return the CARD-ACTION-STATUS header in the response.
                            // The value of the header will be displayed to the user.
                            
                            if (result.sender.toLowerCase() != 'expense@contoso.com' ||
                                !result.action_performer.toLowerCase().endsWith('@contoso.com')) {
                                res.set('CARD-ACTION-STATUS', 'Invalid sender or the action performer is not allowed.')
                                res.status(403);
                                res.end();
                                return;
                            }

                            // Further business logic code here to process the expense report.
                            
                            res.set('CARD-ACTION-STATUS', 'The expense was approved.')
                            res.status(200);
                            res.end();
                        }
                    });
            } else {
                res.status(401);
                res.end();
            }
        });

The code sample is using the following library for JWT validation.   

[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)   

More information Outlook Actionable Messages is available [here](https://dev.outlook.com/actions).

## Copyright
Copyright (c) 2016 Microsoft. All rights reserved.
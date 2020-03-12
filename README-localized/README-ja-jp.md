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
# アクション要求トークンの検証 Node.js サンプル

サービスは、アクション可能メッセージをユーザーに送信して、サービスに対する単純なタスクを完了することができます。ユーザーがメッセージに含まれるいずれかのアクションを実行すると、Microsoft によりアクション要求がサービスに対して送信されます。Microsoft からの要求には、認証ヘッダーにベアラー トークンが含まれています。このコード サンプルでは、トークンを検証して、アクション要求が Microsoft からのものであることを確認し、トークンの要求を使用して要求を検証する方法を示します。

        app.post('/api/expense', function (req, res) {
            var token;
            
            // 認証ヘッダーからトークンを取得します 
            if (req.headers && req.headers.hasOwnProperty('authorization')) {
                var auth = req.headers['authorization'].trim().split(' ');
                if (auth.length == 2 && auth[0].toLowerCase() == 'bearer') {
                    token = auth[1];
                }
            }
            
            if (token) {
                var validator = new validation.ActionableMessageTokenValidator();
                
                // これにより、トークンが指定されたターゲット URL に対して Microsoft によって発行されたこと、
                // つまりターゲットが対象のオーディエンスに一致することを検証します (トークンの “aud” 要求)
                // 
                // コードで、https://api.contoso.com をサービスのベース URL に置き換えます。
                // たとえば、サービスのターゲット URL が https://api.xyz.com/finance/expense?id=1234 の場合、
                // https://api.contoso.com を https://api.xyz.com に置き換えます
                validator.validateToken(
                    token,
                    "https://api.contoso.com",
                    function (err, result) {
                        if (err) {
                            console.error('error: ' + err.message);
                            res.status(401);
                            res.end();
                        } else {                        
                            // 有効なトークンがあります。次に、送信者とアクション実行者が予想どおりであることを
                            確認します。送信者は、最初にアクション可能メッセージを送信したエンティティの ID であり、 
                            アクション実行者は、実際にアクションを実行したユーザーの ID です 
                            // (トークン内の “sub” クレーム)。
                            // 
                            // 以下のコードを独自の検証ロジックに置き換える必要があります 
                            // この例では、expense@contoso.com (予想される送信者) によってメールが送信され、
                            アクションを実行した人のメールが john@contoso.com (予想される受信者) であることを確認します
                            //
                            // 応答で CARD-ACTION-STATUS ヘッダーも返す必要があります。
                            // ヘッダーの値はユーザーに表示されます。
                            
                            if (result.sender.toLowerCase() != 'expense@contoso.com' ||
                                result.action_performer.toLowerCase() != 'john@contoso.com') {
                                res.set('CARD-ACTION-STATUS', 'Invalid sender or the action performer is not allowed.')
                                res.status(403);
                                res.end();
                                return;
                            }

                            // 経費明細書を処理するための追加のビジネス ロジック コードはこちらです。
                            
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

このコード サンプルでは、JWT 認証に次のライブラリを使用しています。   

[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)   

Outlook のアクション可能メッセージの詳細については、[こちら](https://dev.outlook.com/actions)をクリックしてください。

## 著作権
Copyright (c) 2017 Microsoft.All rights reserved.


このプロジェクトでは、[Microsoft オープン ソース倫理規定](https://opensource.microsoft.com/codeofconduct/)が採用されています。詳細については、「[倫理規定の FAQ](https://opensource.microsoft.com/codeofconduct/faq/)」を参照してください。また、その他の質問やコメントがあれば、[opencode@microsoft.com](mailto:opencode@microsoft.com) までお問い合わせください。

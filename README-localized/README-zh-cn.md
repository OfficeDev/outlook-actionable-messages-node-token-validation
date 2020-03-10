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
# 操作请求令牌验证 Node.js 示例

服务能够向用户发送可操作邮件，以针对服务完成简单的任务。用户在邮件中执行其中一个操作时，Microsoft 将向该服务发送一个操作请求。来自 Microsoft 的请求将在授权标头中包含持有者令牌。此代码示例介绍如何验证令牌以确保操作请求来自 Microsoft，然后使用令牌中的声明验证此请求。

        app.post('/api/expense', function (req, res) {
            var token;
            
            // 从授权标头获取令牌 
            if (req.headers && req.headers.hasOwnProperty('authorization')) {
                var auth = req.headers['authorization'].trim().split(' ');
                if (auth.length == 2 && auth[0].toLowerCase() == 'bearer') {
                    token = auth[1];
                }
            }
            
            if (token) {
                var validator = new validation.ActionableMessageTokenValidator();
                
                // 这将验证令牌已由 Microsoft 针对具体的
                // 目标 URL 签署，即与指定受众匹配的目标（令牌中的 “aud” 声明）
                // 
                // 在代码中，使用服务的基 URL 替换 https://api.contoso.com。
                // 例如，如果服务目标 URL 是 https://api.xyz.com/finance/expense?id=1234，
                // 随后替换 https://api.contoso.com with https://api.xyz.com
                validator.validateToken(
                    token,
                    "https://api.contoso.com",
                    function (err, result) {
                        if (err) {
                            console.error('error: ' + err.message);
                            res.status(401);
                            res.end();
                        } else {                        
                            // 我们拥有一个有效的令牌。我们现在将验证我们期待的发件人和
                            // 操作执行人。发件人是最初发送可执行邮件的实体身份， 
                            // 操作执行者是实际执行操作的用户身份 
                            //（令牌中的“sub”声明）。
                            // 
                            // 应使用自有验证逻辑替换下列代码 
                            // 在此示例中，我们验证由 expense@contoso.com （预计发件人）发送的电子邮件
                            // 和操作执行人是 john@contoso.com （期望收件人）的电子邮件
                            //
                            // 还应在响应中返回 CARD-ACTION-STATUS 标头。
                            // 标头值将显示给用户。
                            
                            if (result.sender.toLowerCase() != 'expense@contoso.com' ||
                                result.action_performer.toLowerCase() != 'john@contoso.com') {
                                res.set('CARD-ACTION-STATUS', 'Invalid sender or the action performer is not allowed.')
                                res.status(403);
                                res.end();
                                return;
                            }

                            // 这里的其他业务逻辑代码用于处理费用报表。
                            
                            res.set('CARD-ACTION-STATUS', '费用已批准。')
                            res.status(200);
                            res.end();
                        }
                    });
            } else {
                res.status(401);
                res.end();
            }
        });

代码示例使用下列库来验证 JWT。   

[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)   

有关 Outlook 可操作邮件的更多信息参见“[这里](https://dev.outlook.com/actions)”。

## 版权信息
版权所有 (c) 2017 Microsoft。保留所有权利。


此项目已采用 [Microsoft 开放源代码行为准则](https://opensource.microsoft.com/codeofconduct/)。有关详细信息，请参阅[行为准则 FAQ](https://opensource.microsoft.com/codeofconduct/faq/)。如有其他任何问题或意见，也可联系 [opencode@microsoft.com](mailto:opencode@microsoft.com)。

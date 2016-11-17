// 
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
// 
// Copyright (c) Microsoft Corporation
// All rights reserved.
// 
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

'use strict';

var express = require('express');
var jwt = require('jsonwebtoken');
var request = require('request');
var oid = require('./OpenIdMetadata');
var app = express();

app.post('/api/expense', function (req, res) {
    var token;
    
    if (req.headers && req.headers.hasOwnProperty('authorization')) {
        var auth = req.headers['authorization'].trim().split(' ');
        if (auth.length == 2 && auth[0].toLowerCase() == 'bearer') {
            token = auth[1];
        }
    }
    
    if (token) {
        var decoded = jwt.decode(token, { complete: true });
        var verifyOptions = {
            issuer: "https://substrate.office.com/sts/",
            
            // Replace [WEB SERVICE URL] with your service domain URL.
            // For example, if the service URL is https://api.contoso.com/finance/expense?id=1234,
            // then replace [WEB SERVICE URL] with https://api.contoso.com
            audience: "[WEB SERVICE URL]"
        };
        
        var openIdMetadata = new oid.OpenIdMetadata("https://substrate.office.com/sts/common/.well-known/openid-configuration")
        
        openIdMetadata.getKey(decoded.header.kid, key => {
            if (key) {
                try {
                    jwt.verify(token, key, verifyOptions);
                    
                    if (decoded.payload.appid != "48af08dc-f6d2-435f-b2a7-069abd99c086") {
                        console.error("Invalid app id");
                        res.status(401);
                        res.end();
                        return;
                    }
                    
                    // sender claim will contain the email address of the sender.
                    // Validate that the email is sent by your organization.
                    var sender = decoded.payload.sender;
                    
                    // subject claim will contain the email of the person who performed the action.
                    // Validate that the person has the priviledge to perform this action.
                    var subject = decoded.payload.sub;
                } catch (err) {
                    console.error(err);
                    res.status(401);
                    res.end();
                    return;
                }
                
                res.status(200);
                res.end();
                return;
            } else {
                res.status(401);
                res.end();
                return;
            }
        });
    }
    else {
        res.status(401);
        res.end();
    }
});

app.listen(3000);
console.log('listening on 3000');

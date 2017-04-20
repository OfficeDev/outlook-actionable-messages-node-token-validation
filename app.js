//------------------------------------------------------------------------------
//
// Copyright (c) Microsoft Corporation.
// All rights reserved.
//
// This code is licensed under the MIT License.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files(the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions :
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
//------------------------------------------------------------------------------

'use strict';

var express = require('express');
var request = require('request');
var validation = require('./ActionableMessageTokenValidator');
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

app.listen(3000);
console.log('listening on 3000');

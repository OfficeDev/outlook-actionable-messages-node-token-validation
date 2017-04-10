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

"use strict";

var request = require('request');
var getPem = require('rsa-pem-from-mod-exp');
var base64url = require('base64url');
var oid = require('./OpenIdMetadata');
var jwt = require('jsonwebtoken');

var O365TokenValidationResult = (function() {
    function O365TokenValidationResult() {
        this.sender = "";
        this.actionPerformer = "";
    }
    
    return O365TokenValidationResult;
}());

var O365TokenValidator = (function () {
    function O365TokenValidator() {
    };
    
    O365TokenValidator.prototype.validateToken = function (token, audience, cb) {
        var decoded = jwt.decode(token, { complete: true });
        var verifyOptions = {
            issuer: "https://substrate.office.com/sts/",
            audience: audience
        };
        
        var openIdMetadata = new oid.OpenIdMetadata("https://substrate.office.com/sts/common/.well-known/openid-configuration")
        
        openIdMetadata.getKey(decoded.header.kid, key => {
            var result = new O365TokenValidationResult();
            
            if (key) {
                try {
                    jwt.verify(token, key, verifyOptions);
                    
                    if (decoded.payload.appid != "48af08dc-f6d2-435f-b2a7-069abd99c086") {
                        var error = new Error("Invalid app id");
                        Error.captureStackTrace(error);
                        cb(error);
                    } else {
                        result.sender = decoded.payload.sender;
                        result.actionPerformer = decoded.payload.sub;
                    }
                } catch (err) {
                    cb(err);
                    return;
                }
            } else {
                var error = new Error("invalid key");
                Error.captureStackTrace(error);
                cb(error);
            }
            
            cb(null, result);
        });
    };
    
    return O365TokenValidator;
}());

exports.O365TokenValidationResult = O365TokenValidationResult;
exports.O365TokenValidator = O365TokenValidator;

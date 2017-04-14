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

/**
 * Module for token validation.
 */

"use strict";

var request = require('request');
var getPem = require('rsa-pem-from-mod-exp');
var base64url = require('base64url');
var oid = require('./OpenIdMetadata');
var jwt = require('jsonwebtoken');

const O365_APP_ID = "48af08dc-f6d2-435f-b2a7-069abd99c086";
const O365_OPENID_METADATA_URL = "https://substrate.office.com/sts/common/.well-known/openid-configuration";
const O365_TOKEN_ISSUER = "https://substrate.office.com/sts/";

/**
 * Result from token validation.
 */
var ActionableMessageTokenValidationResult = (function() {
    function ActionableMessageTokenValidationResult() {
        this.sender = "";
        this.actionPerformer = "";
    }
    
    return ActionableMessageTokenValidationResult;
}());

/**
 * Token validator for actionable message.
 */
var ActionableMessageTokenValidator = (function () {
    /**
     * Constructor.
     */
    function ActionableMessageTokenValidator() {
    };
    
    /**
     * Validates an actionable message token.
     * @param token
     *   A JWT issued by Microsoft.
     *
     * @param targetUrl
     *   The expected URL in the token. This should the web service URL.
     *
     * @param cb
     *   The callback when the validation is completed.
     */
    ActionableMessageTokenValidator.prototype.validateToken = function (token, targetUrl, cb) {
        var decoded = jwt.decode(token, { complete: true });
        var verifyOptions = {
            issuer: O365_TOKEN_ISSUER,
            audience: targetUrl
        };
        
        var openIdMetadata = new oid.OpenIdMetadata(O365_OPENID_METADATA_URL)
        
        openIdMetadata.getKey(decoded.header.kid, key => {
            var result = new ActionableMessageTokenValidationResult();
            
            if (key) {
                try {
                    jwt.verify(token, key, verifyOptions);
                    
                    if (decoded.payload.appid.toLowerCase() != O365_APP_ID.toLowerCase()) {
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
    
    return ActionableMessageTokenValidator;
}());

exports.ActionableMessageTokenValidationResult = ActionableMessageTokenValidationResult;
exports.ActionableMessageTokenValidator = ActionableMessageTokenValidator;

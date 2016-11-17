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

var OpenIdMetadata = (function () {
    function OpenIdMetadata(url) {
        this.lastUpdated = 0;
        this.url = url;
    }
    OpenIdMetadata.prototype.getKey = function (keyId, cb) {
        var _this = this;
        // If keys are more than 5 days old, refresh them
        var now = new Date().getTime();
        if (this.lastUpdated < (now - 1000 * 60 * 60 * 24 * 5)) {
            this.refreshCache(function (err) {
                if (err) {
                }
                // Search the cache even if we failed to refresh
                var key = _this.findKey(keyId);
                cb(key);
            });
        }
        else {
            // Otherwise read from cache
            var key = this.findKey(keyId);
            cb(key);
        }
    };
    OpenIdMetadata.prototype.refreshCache = function (cb) {
        var _this = this;
        var options = {
            method: 'GET',
            url: this.url,
            json: true
        };
        request(options, function (err, response, body) {
            if (!err && (response.statusCode >= 400 || !body)) {
                err = new Error('Failed to load openID config: ' + response.statusCode);
            }
            if (err) {
                cb(err);
            }
            else {
                var openIdConfig = body;
                var options = {
                    method: 'GET',
                    url: openIdConfig.jwks_uri,
                    json: true
                };
                request(options, function (err, response, body) {
                    if (!err && (response.statusCode >= 400 || !body)) {
                        err = new Error("Failed to load Keys: " + response.statusCode);
                    }
                    if (!err) {
                        _this.lastUpdated = new Date().getTime();
                        _this.keys = body.keys;
                    }
                    cb(err);
                });
            }
        });
    };
    OpenIdMetadata.prototype.findKey = function (keyId) {
        if (!this.keys) {
            return null;
        }
        for (var i = 0; i < this.keys.length; i++) {
            if (this.keys[i].kid == keyId) {
                var key = this.keys[i];
                if (!key.n || !key.e) {
                    // Return null for non-RSA keys
                    return null;
                }
                var modulus = base64url.toBase64(key.n);
                var exponent = key.e;
                return getPem(modulus, exponent);
            }
        }
        return null;
    };
    return OpenIdMetadata;
}());

exports.OpenIdMetadata = OpenIdMetadata;

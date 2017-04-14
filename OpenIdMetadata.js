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
 * Module for Open ID metadata.
 */

"use strict";

var request = require('request');
var getPem = require('rsa-pem-from-mod-exp');
var base64url = require('base64url');

/**
 * Represents an OpenID configuration.
 */
var OpenIdMetadata = (function () {
    function OpenIdMetadata(url) {
        this.lastUpdated = 0;
        this.url = url;
    }

    /**
     * Gets a public key from the cache given the key ID.
     * @param keyId
     *   The ID of the key to retrieve.
     * 
     * @param cb
     *   The callback after the key search is completed.
     */
    OpenIdMetadata.prototype.getKey = function (keyId, cb) {
        var _this = this;
        // If keys are more than 5 days old, refresh them
        var now = new Date().getTime();

        if (this.lastUpdated < (now - 1000 * 60 * 60 * 24 * 5)) {
            this._refreshCache(function (err) {
                if (err) {
                }
                // Search the cache even if we failed to refresh
                var key = _this._findKey(keyId);
                cb(key);
            });
        } else {
            // Otherwise read from cache
            var key = this.findKey(keyId);
            cb(key);
        }
    };

    /**
     * Refresh the internal cache.
     * @param cb
     *   The callback after the cache is refreshed.
     */
    OpenIdMetadata.prototype._refreshCache = function (cb) {
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
            } else {
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

    /**
     * Find the key given the key ID.
     * @param keyId
     *   The ID of the key.
     *
     * @return
     *   The value of the key if found; else null.
     */
    OpenIdMetadata.prototype._findKey = function (keyId) {
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

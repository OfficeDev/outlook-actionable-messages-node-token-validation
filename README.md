# Action Request Token Verification Node.js Sample

Services can send actionable messages to users to complete simple tasks against their services. When users perform one of the actions in the messages, an action request will be sent by Microsoft to the service. The request from Microsoft will contain a bearer token in the authorization header. This code sample shows how to verify the token to ensure the action request is from Microsoft, and use the claims in the token to validate the request.

More information Outlook Actionable Messages is available [here](https://dev.outlook.com/actions).

## Copyright
Copyright (c) 2016 Microsoft. All rights reserved.
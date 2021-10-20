# JWT-FSM

Simple finite-state-machine (FSM) to manage json-web-tokens (JWT) tokens

[![NPM version][npm-version-image]][npm-url]

The core idea is before token expires, this library will automatically schedule token renewal so user always has a _fresh_ token.

```typescript
const jwtFsm = new JwtFsm({
  renew: async () => {
    // Service call to renew the token
    return "updatedToken";
  },
  recover: async () => {
    // Tries to recover the token from local storage
    return localStorage.getItem("token");
  },
  persist: async (token) => {
    // Persists token to local storage
    localStorage.setItem("token", token);
  },
  // Optional
  renewal: 5, // renew 5 minutes before expiration
  logger: {
    info: (text) => console.log(text),
    error: (text) => console.error(text),
  },
});

// Get token value
const token = jwtFsm.token;

// Manually update token value
jwtFsm.setToken("updatedToken");

// Clear renewal schedule
jwtFsm.dispose();
```

[npm-url]: https://npmjs.org/package/jwt-fsm
[npm-version-image]: https://badge.fury.io/js/jwt-fsm.svg

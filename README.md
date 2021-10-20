# JWT-FSM

Simple finite-state-machine (FSM) to manage json-web-tokens (JWT) tokens

The core idea is before token expires, this library will automatically schedule token renewal so user always has a _fresh_ token.

```typescript
const jwtFsm = new JwtFsm({
  renew: async () => {
    return "updatedToken";
  },
  recover: async () => {
    return "token";
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

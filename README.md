# JWT-FSM

Simple FSM to manage JWT tokens

```typescript
const jwtFsm = new JwtFsm({
  renew: async () => { 
    return "updatedToken";
  },
  recover: async () => {
    return "token";
  },
  // optional
  renewal: 5,     // renew 5 minutes before expiration
  logger: { 
    info: (text) => console.log(text),
    error: (text) => console.error(text) 
  }
});

// Get token value
const token = jwtFsm.token; 

// Manually update token value
jwtFsm.setToken("updatedToken");

// Clear renewal schedule
jwtFsm.dispose();
```

# @lockally/express

Official [Lockally](https://lockally.com) middleware for Express. `app.use(lockally(...))`
attaches a ready-to-use mailer at `req.lockally` so any route can send transactional
email in one call.

## Install

```bash
npm install @lockally/express
```

## Use

```ts
import express from "express";
import { lockally } from "@lockally/express";

const app = express();
app.use(lockally({ apiKey: process.env.LOCKALLY_API_KEY! }));
//        lk_test_… runs in sandbox, lk_live_… sends real mail
// app.use(lockally({ apiKey, baseUrl: "https://api.lockally.com" }));  // optional override

app.post("/signup", async (req, res) => {
  await req.lockally.send({
    from: "alerts@yourdomain.com",
    to: "user@example.com",
    subject: "Welcome",
    text: "Thanks for signing up.",
    html: "<b>Thanks for signing up.</b>",
    replyTo: "support@yourdomain.com",
  });
  res.sendStatus(202);
});
```

Send from outside a request (workers, cron) with the same config:

```ts
import { createMailer } from "@lockally/express";
const mailer = createMailer({ apiKey: process.env.LOCKALLY_API_KEY! });
await mailer.send({ from: "alerts@yourdomain.com", to: "ops@yourdomain.com", subject: "Nightly report" });
```

`to`/`cc`/`bcc`/`replyTo` accept a string or a string array. Attachments are
`{ filename, content, contentType }` where `content` is a `Buffer`, `Uint8Array`, or
string.

### Mapping notes

- **Reply-To** is sent as a header (Lockally has no `reply_to` field).
- **Attachments** are base64-encoded as `{ filename, contentType, contentBase64 }`.
- One `Idempotency-Key` is generated per send (24 h dedupe window).

## License

MIT © Lockally

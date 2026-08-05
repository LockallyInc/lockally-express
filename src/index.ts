// Express middleware for Lockally. `app.use(lockally({ apiKey }))` attaches a
// ready-to-use mailer at `req.lockally` for every request handler.
import { Configuration, SendApi } from "lockally";
import type { RequestHandler } from "express";
import { LockallyMailer, type LockallyOptions } from "./mailer.ts";

export {
  LockallyMailer,
  buildRequest,
  type LockallyOptions,
  type SendEmailOptions,
  type Attachment,
  type SendApiLike,
} from "./mailer.ts";

/**
 * Build the Lockally client for the given options. Exposed so you can send from
 * outside a request (workers, cron) with the same configuration.
 */
export function createMailer(options: LockallyOptions): LockallyMailer {
  const config = new Configuration({
    accessToken: options.apiKey,
    ...(options.baseUrl ? { basePath: options.baseUrl.replace(/\/+$/, "") } : {}),
  });
  return new LockallyMailer(new SendApi(config));
}

/**
 * Express middleware that attaches a {@link LockallyMailer} at `req.lockally`.
 *
 *   app.use(lockally({ apiKey: process.env.LOCKALLY_API_KEY! }));
 *   app.post("/signup", async (req, res) => {
 *     await req.lockally.send({ from: "alerts@you.com", to: "user@example.com", subject: "Hi" });
 *     res.sendStatus(202);
 *   });
 */
export function lockally(options: LockallyOptions): RequestHandler {
  const mailer = createMailer(options);
  return (req, _res, next) => {
    req.lockally = mailer;
    next();
  };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      lockally: LockallyMailer;
    }
  }
}

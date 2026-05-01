import { randomBytes } from "crypto";
import { TokenGenerator } from "../domain/ports";

export class CryptoTokenGenerator implements TokenGenerator {
  generate(): string {
    return randomBytes(16).toString("base64url");
  }
}

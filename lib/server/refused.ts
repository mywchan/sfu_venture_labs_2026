/** The request was understood but isn't allowed; `message` is shown to the person. */
export class Refused extends Error {
  constructor(
    message: string,
    readonly status: number = 409,
  ) {
    super(message);
  }
}

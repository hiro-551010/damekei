export class AuthError extends Error {
  name = "AuthError" as const;
  constructor(message = "ログインが必要です") { super(message); }
}

export class ForbiddenError extends Error {
  name = "ForbiddenError" as const;
  constructor(message = "権限がありません") { super(message); }
}

export class NotFoundError extends Error {
  name = "NotFoundError" as const;
  constructor(message = "見つかりません") { super(message); }
}

export class DomainError extends Error {
  name = "DomainError" as const;
}

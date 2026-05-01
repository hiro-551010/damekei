export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id: string | number) {
    super(`${resource} not found: ${id}`);
    this.name = "NotFoundError";
  }
}

export class InvalidSkillAllocationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSkillAllocationError";
  }
}

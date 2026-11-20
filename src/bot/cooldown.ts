export class Cooldown {
  private readonly last = new Map<string, number>();

  constructor(
    private readonly windowMs = 2000,
    private readonly now: () => number = Date.now,
  ) {}

  allow(key: string): boolean {
    const current = this.now();
    const previous = this.last.get(key);
    if (previous !== undefined && current - previous < this.windowMs) {
      return false;
    }
    this.last.set(key, current);
    return true;
  }
}

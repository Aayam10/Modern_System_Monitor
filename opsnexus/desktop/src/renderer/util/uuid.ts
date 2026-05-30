let _n = 0
export function uuid(): string {
  return `${Date.now()}-${++_n}-${Math.random().toString(36).slice(2,7)}`
}

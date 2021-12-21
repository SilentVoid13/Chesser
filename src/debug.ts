export default function debug(debugFn: () => void): void {
  if (process.env.DEBUG) {
    debugFn();
  }
}
